<script
 setup
 lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import BaseButton from "~/components/Buttons/BaseButton.vue";
import {
  buildCalendarCells,
  clampDateToRange,
  formatDisplayDate,
  formatIsoDate,
  isAfterDate,
  isBeforeDate,
  isSameDay,
  MONTH_NAMES,
  parseIsoDate,
  startOfDay,
  WEEKDAY_NAMES,
} from "~/utils/datePicker";

const props = defineProps({
  modelValue: {
    type: [Date, String],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Select date'
  },
  height: {
    type: String,
    default: '40px'
  },
  minDate: {
    type: String,
    default: null
  },
  maxDate: {
    type: String,
    default: null
  }
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

const pickerElement = ref<HTMLElement | null>(null);
const fieldElement = ref<HTMLElement | null>(null);
const calendarElement = ref<HTMLElement | null>(null);
const calendarVisible = ref(false);
const selectedDate = ref<Date | null>(null);
const currentDate = startOfDay(new Date());
const currentMonth = ref(currentDate.getMonth());
const currentYear = ref(currentDate.getFullYear());
const calendarPosition = ref({
  top: 0,
  left: 0,
  width: 0,
  openUpward: false,
});

const CALENDAR_GAP = 12;
const CALENDAR_MIN_WIDTH = 320;
const VIEWPORT_PADDING = 16;

const minDateObject = computed(() => parseIsoDate(props.minDate));
const maxDateObject = computed(() => {
  const parsedMaxDate = parseIsoDate(props.maxDate);

  if (!parsedMaxDate) {
    return currentDate;
  }

  return isAfterDate(parsedMaxDate, currentDate) ? currentDate : parsedMaxDate;
});

const calendarCells = computed(() => {
  return buildCalendarCells({
    month: currentMonth.value,
    year: currentYear.value,
  });
});

const formattedDate = computed(() => {
  return formatDisplayDate(selectedDate.value);
});

const showCurrentMonth = computed(() => {
  return MONTH_NAMES[currentMonth.value];
});

const calendarStyle = computed(() => {
  return {
    top: `${calendarPosition.value.top}px`,
    left: `${calendarPosition.value.left}px`,
    width: `${calendarPosition.value.width}px`,
  };
});

const syncSelectedDate = (value: string | Date | null) => {
  const parsedDate = clampDateToRange({
    date: parseIsoDate(value),
    minDate: minDateObject.value,
    maxDate: maxDateObject.value,
  });

  selectedDate.value = parsedDate;

  const viewDate = parsedDate || maxDateObject.value || currentDate;
  currentMonth.value = viewDate.getMonth();
  currentYear.value = viewDate.getFullYear();
};

watch(() => props.modelValue, (newValue) => {
  syncSelectedDate(newValue);
}, {immediate: true});

watch(() => [props.minDate, props.maxDate], () => {
  syncSelectedDate(props.modelValue);
});

const isDisabled = (date: Date | null) => {
  if (!date) return true;
  if (minDateObject.value && isBeforeDate(date, minDateObject.value)) return true;
  return !!(maxDateObject.value && isAfterDate(date, maxDateObject.value));
};

const isSelected = (date: Date | null) => {
  return !!date && isSameDay(date, selectedDate.value);
};

const updateCalendarPosition = () => {
  if (!calendarVisible.value) return;

  const anchorElement = fieldElement.value;
  const popupElement = calendarElement.value;

  if (!anchorElement || !popupElement) return;

  const anchorRect = anchorElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popupWidth = Math.max(anchorRect.width, CALENDAR_MIN_WIDTH);
  const maxLeft = viewportWidth - popupWidth - VIEWPORT_PADDING;
  const left = Math.min(Math.max(anchorRect.left, VIEWPORT_PADDING), Math.max(VIEWPORT_PADDING, maxLeft));
  const popupHeight = popupElement.offsetHeight;
  const spaceBelow = viewportHeight - anchorRect.bottom - VIEWPORT_PADDING;
  const spaceAbove = anchorRect.top - VIEWPORT_PADDING;
  const shouldOpenUpward = popupHeight > spaceBelow && spaceAbove > spaceBelow;
  const top = shouldOpenUpward
    ? Math.max(VIEWPORT_PADDING, anchorRect.top - popupHeight - CALENDAR_GAP)
    : Math.min(anchorRect.bottom + CALENDAR_GAP, viewportHeight - popupHeight - VIEWPORT_PADDING);

  calendarPosition.value = {
    top,
    left,
    width: popupWidth,
    openUpward: shouldOpenUpward,
  };
};

const openCalendar = async () => {
  calendarVisible.value = true;
  await nextTick();
  updateCalendarPosition();
};

const closeCalendar = () => {
  calendarVisible.value = false;
};

const toggleCalendar = async () => {
  if (calendarVisible.value) {
    closeCalendar();
    return;
  }

  await openCalendar();
};

const selectDate = (date: Date | null) => {
  if (!date || isDisabled(date)) return;

  selectedDate.value = startOfDay(date);
  emit('update:modelValue', formatIsoDate(selectedDate.value));
  closeCalendar();
};

const updateMonth = (direction: -1 | 1) => {
  const nextMonthDate = new Date(currentYear.value, currentMonth.value + direction, 1);
  currentMonth.value = nextMonthDate.getMonth();
  currentYear.value = nextMonthDate.getFullYear();
};

const prevMonth = () => {
  updateMonth(-1);
};

const nextMonth = () => {
  updateMonth(1);
};

const handleOutsideClick = (event: Event) => {
  const target = event.target as Node | null;

  if (!target) return;

  const isInsidePicker = !!pickerElement.value?.contains(target);
  const isInsideCalendar = !!calendarElement.value?.contains(target);

  if (!isInsidePicker && !isInsideCalendar) {
    closeCalendar();
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeCalendar();
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscape);
  window.removeEventListener('resize', updateCalendarPosition);
  window.removeEventListener('scroll', updateCalendarPosition, true);
});

watch(calendarVisible, async (visible) => {
  if (visible) {
    await nextTick();
    updateCalendarPosition();
    window.addEventListener('resize', updateCalendarPosition);
    window.addEventListener('scroll', updateCalendarPosition, true);
    return;
  }

  window.removeEventListener('resize', updateCalendarPosition);
  window.removeEventListener('scroll', updateCalendarPosition, true);
});

watch(() => [currentMonth.value, currentYear.value], async () => {
  if (!calendarVisible.value) return;

  await nextTick();
  updateCalendarPosition();
});
</script>

<template>
  <div
   ref="pickerElement"
   class="datepicker"
  >
    <button
     ref="fieldElement"
     type="button"
     class="datepicker__field"
     :class="{
       'is-active': calendarVisible,
     }"
     :style="{height}"
     @click="toggleCalendar"
    >
      <span
       v-if="formattedDate"
       class="datepicker__value"
      >
        {{ formattedDate }}
      </span>
      <span
       v-else
       class="datepicker__placeholder"
      >
        {{ placeholder }}
      </span>
    </button>

    <Teleport to="body">
      <div
       v-if="calendarVisible"
       ref="calendarElement"
       class="datepicker__calendar"
       :class="{
         'is-open-upward': calendarPosition.openUpward,
       }"
       :style="calendarStyle"
      >
        <div class="datepicker__calendar-header">
          <BaseButton
           variant="transparent"
           size="smallest"
           @click="prevMonth"
          >
            Prev
          </BaseButton>
          <span class="datepicker__calendar-title">{{ showCurrentMonth }} {{ currentYear }}</span>
          <BaseButton
           variant="transparent"
           size="smallest"
           @click="nextMonth"
          >
            Next
          </BaseButton>
        </div>

        <div class="datepicker__weekdays">
          <div
           v-for="weekday in WEEKDAY_NAMES"
           :key="weekday"
           class="datepicker__weekday"
          >
            {{ weekday }}
          </div>
        </div>

        <div class="datepicker__grid">
          <button
           v-for="cell in calendarCells"
           :key="cell.key"
           type="button"
           class="datepicker__day"
           :class="{
             'is-blank': !cell.date,
             'is-selected': isSelected(cell.date),
             'is-disabled': cell.date && isDisabled(cell.date),
           }"
           :disabled="!cell.date || isDisabled(cell.date)"
           @click="selectDate(cell.date)"
          >
            {{ cell.dayNumber ?? '' }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.datepicker {
  width: 100%;
}

.datepicker__field {
  width: 100%;
  border: 1px solid rgb(231 229 228);
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 0 1rem;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.datepicker__field:hover,
.datepicker__field.is-active {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 1px rgb(37 99 235 / 0.2);
}

.datepicker__placeholder {
  color: rgb(120 113 108);
}

.datepicker__value {
  color: inherit;
  font-weight: 500;
}

.datepicker__calendar {
  position: fixed;
  z-index: 90;
  padding: 1rem;
  border: 1px solid rgba(1, 29, 58, 0.08);
  border-radius: 1rem;
  background: var(--card-bg-color);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

.datepicker__calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.datepicker__calendar-title {
  font-weight: 600;
}

.datepicker__weekdays,
.datepicker__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.375rem;
}

.datepicker__weekdays {
  margin-bottom: 0.625rem;
}

.datepicker__weekday {
  padding: 0.25rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(120 113 108);
}

.datepicker__day {
  min-height: 2.75rem;
  border: 0;
  border-radius: 0.875rem;
  background: transparent;
  color: inherit;
  font-weight: 500;
  transition:
    background-color 120ms ease,
    color 120ms ease,
    opacity 120ms ease;
}

.datepicker__day:hover:not(.is-disabled):not(.is-blank):not(.is-selected) {
  background: rgb(219 234 254);
  color: rgb(30 64 175);
}

.datepicker__day.is-blank {
  visibility: hidden;
}

.datepicker__day.is-selected {
  background: rgb(37 99 235);
  color: white;
}

.datepicker__day.is-disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

:global(.dark) .datepicker__field {
  border-color: rgb(82 82 91);
  background: rgb(31 41 55 / 0.55);
}

:global(.dark) .datepicker__placeholder,
:global(.dark) .datepicker__weekday {
  color: rgb(168 162 158);
}

:global(.dark) .datepicker__calendar {
  border-color: rgb(82 82 91);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
}

:global(.dark) .datepicker__day:hover:not(.is-disabled):not(.is-blank):not(.is-selected) {
  background: rgb(30 64 175 / 0.28);
  color: rgb(219 234 254);
}

@media (max-width: 640px) {
  .datepicker__calendar {
    padding: 0.875rem;
  }
}
</style>
