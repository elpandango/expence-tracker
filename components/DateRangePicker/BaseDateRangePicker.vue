<script
 setup
 lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import BaseButton from "~/components/Buttons/BaseButton.vue";
import {
  buildCalendarCells,
  clampDateToRange,
  compareDates,
  formatDisplayDate,
  formatIsoDate,
  isAfterDate,
  isBeforeDate,
  isSameDay,
  MONTH_NAMES,
  normalizeRange,
  parseIsoDate,
  startOfDay,
  WEEKDAY_NAMES,
} from "~/utils/datePicker";
import type {DateField, DateRangeValue} from "~/utils/datePicker";

const props = defineProps({
  modelValue: {
    type: Object as () => DateRangeValue | null,
    default: () => ({
      startDate: null,
      endDate: null,
    }),
  },
  startPlaceholder: {
    type: String,
    default: 'Start date',
  },
  endPlaceholder: {
    type: String,
    default: 'End date',
  },
  minDate: {
    type: String,
    default: null,
  },
  maxDate: {
    type: String,
    default: null,
  },
  height: {
    type: String,
    default: '40px',
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRangeValue): void;
}>();

const pickerElement = ref<HTMLElement | null>(null);
const calendarElement = ref<HTMLElement | null>(null);
const startFieldElement = ref<HTMLElement | null>(null);
const endFieldElement = ref<HTMLElement | null>(null);
const calendarVisible = ref(false);
const activeField = ref<DateField>('start');
const hoverDate = ref<Date | null>(null);
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);
const calendarPosition = ref({
  top: 0,
  left: 0,
  width: 0,
  openUpward: false,
});

const CALENDAR_GAP = 12;
const CALENDAR_MIN_WIDTH = 320;
const VIEWPORT_PADDING = 16;

const currentDate = startOfDay(new Date());
const minDateObject = computed(() => parseIsoDate(props.minDate));
const maxDateObject = computed(() => {
  const parsedMaxDate = parseIsoDate(props.maxDate);

  if (!parsedMaxDate) {
    return currentDate;
  }

  return isAfterDate(parsedMaxDate, currentDate) ? currentDate : parsedMaxDate;
});

const initialViewDate = computed(() => {
  return endDate.value || startDate.value || maxDateObject.value || currentDate;
});

const currentMonth = ref(initialViewDate.value.getMonth());
const currentYear = ref(initialViewDate.value.getFullYear());

const calendarCells = computed(() => {
  return buildCalendarCells({
    month: currentMonth.value,
    year: currentYear.value,
  });
});

const displayedMonth = computed(() => {
  return MONTH_NAMES[currentMonth.value];
});

const displayStartDate = computed(() => {
  return formatDisplayDate(startDate.value);
});

const displayEndDate = computed(() => {
  return formatDisplayDate(endDate.value);
});

const calendarStyle = computed(() => {
  return {
    top: `${calendarPosition.value.top}px`,
    left: `${calendarPosition.value.left}px`,
    width: `${calendarPosition.value.width}px`,
  };
});

const previewRangeEnd = computed(() => {
  if (activeField.value !== 'end' || !startDate.value || !hoverDate.value) {
    return endDate.value;
  }

  return hoverDate.value;
});

const normalizedPreviewRange = computed(() => {
  const previewStart = startDate.value;
  const previewEnd = previewRangeEnd.value;

  if (!previewStart || !previewEnd) {
    return {
      startDate: previewStart,
      endDate: previewEnd,
    };
  }

  if (isBeforeDate(previewEnd, previewStart)) {
    return {
      startDate: previewEnd,
      endDate: previewStart,
    };
  }

  return {
    startDate: previewStart,
    endDate: previewEnd,
  };
});

const syncFromModelValue = (value: DateRangeValue | null) => {
  const parsedStart = clampDateToRange({
    date: parseIsoDate(value?.startDate ?? null),
    minDate: minDateObject.value,
    maxDate: maxDateObject.value,
  });
  const parsedEnd = clampDateToRange({
    date: parseIsoDate(value?.endDate ?? null),
    minDate: minDateObject.value,
    maxDate: maxDateObject.value,
  });

  const normalized = normalizeRange({
    startDate: parsedStart,
    endDate: parsedEnd,
    changedField: 'end',
    minDate: minDateObject.value,
    maxDate: maxDateObject.value,
  });

  startDate.value = normalized.startDate;
  endDate.value = normalized.endDate;

  const viewDate = normalized.endDate || normalized.startDate || maxDateObject.value || currentDate;
  currentMonth.value = viewDate.getMonth();
  currentYear.value = viewDate.getFullYear();
};

watch(() => props.modelValue, (newValue) => {
  syncFromModelValue(newValue);
}, {immediate: true, deep: true});

watch(() => [props.minDate, props.maxDate], () => {
  syncFromModelValue(props.modelValue);
});

const emitRange = () => {
  emit('update:modelValue', {
    startDate: formatIsoDate(startDate.value),
    endDate: formatIsoDate(endDate.value),
  });
};

const getActiveFieldElement = () => {
  return activeField.value === 'end'
    ? endFieldElement.value || startFieldElement.value
    : startFieldElement.value || endFieldElement.value;
};

const updateCalendarPosition = () => {
  if (!calendarVisible.value) return;

  const anchorElement = getActiveFieldElement();
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

const openCalendar = (field: DateField) => {
  activeField.value = field;
  calendarVisible.value = true;
  hoverDate.value = null;

  const referenceDate = field === 'end'
    ? endDate.value || startDate.value || maxDateObject.value || currentDate
    : startDate.value || endDate.value || maxDateObject.value || currentDate;

  currentMonth.value = referenceDate.getMonth();
  currentYear.value = referenceDate.getFullYear();

  void nextTick(() => {
    updateCalendarPosition();
  });
};

const closeCalendar = () => {
  calendarVisible.value = false;
  hoverDate.value = null;
};

const isDateDisabled = (date: Date | null) => {
  if (!date) return true;
  if (minDateObject.value && isBeforeDate(date, minDateObject.value)) return true;
  return !!(maxDateObject.value && isAfterDate(date, maxDateObject.value));
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

const selectDate = (date: Date | null) => {
  if (!date || isDateDisabled(date)) return;

  const normalizedDate = startOfDay(date);

  if (activeField.value === 'start') {
    startDate.value = normalizedDate;
    endDate.value = null;
    emitRange();
    activeField.value = 'end';
    hoverDate.value = null;

    const nextViewDate = startDate.value || normalizedDate;
    currentMonth.value = nextViewDate.getMonth();
    currentYear.value = nextViewDate.getFullYear();

    void nextTick(() => {
      updateCalendarPosition();
    });
    return;
  }

  const normalized = normalizeRange({
    startDate: startDate.value,
    endDate: normalizedDate,
    changedField: 'end',
    minDate: minDateObject.value,
    maxDate: maxDateObject.value,
  });

  startDate.value = normalized.startDate;
  endDate.value = normalized.endDate;
  emitRange();
  closeCalendar();
};

const handleDayHover = (date: Date | null) => {
  if (activeField.value !== 'end' || !startDate.value || !date || isDateDisabled(date)) {
    hoverDate.value = null;
    return;
  }

  hoverDate.value = date;
};

const isSelectedStart = (date: Date | null) => {
  return !!date && isSameDay(date, startDate.value);
};

const isSelectedEnd = (date: Date | null) => {
  return !!date && isSameDay(date, endDate.value);
};

const isInPreviewRange = (date: Date | null) => {
  if (!date || !normalizedPreviewRange.value.startDate || !normalizedPreviewRange.value.endDate) {
    return false;
  }

  if (isSelectedStart(date) || isSelectedEnd(date)) {
    return false;
  }

  const start = normalizedPreviewRange.value.startDate;
  const end = normalizedPreviewRange.value.endDate;

  return compareDates(date, start) >= 0 && compareDates(date, end) <= 0;
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

watch(() => [currentMonth.value, currentYear.value, activeField.value], async () => {
  if (!calendarVisible.value) return;

  await nextTick();
  updateCalendarPosition();
});
</script>

<template>
  <div
   ref="pickerElement"
   class="base-date-range-picker"
  >
    <div class="base-date-range-picker__fields">
      <button
       ref="startFieldElement"
       type="button"
       class="base-date-range-picker__field"
       :class="{
         'is-active': calendarVisible && activeField === 'start',
       }"
       :style="{height}"
       @click="openCalendar('start')"
      >
        <span
         v-if="displayStartDate"
         class="base-date-range-picker__value"
        >
          {{ displayStartDate }}
        </span>
        <span
         v-else
         class="base-date-range-picker__placeholder"
        >
          {{ startPlaceholder }}
        </span>
      </button>

      <button
       ref="endFieldElement"
       type="button"
       class="base-date-range-picker__field"
       :class="{
         'is-active': calendarVisible && activeField === 'end',
       }"
       :style="{height}"
       @click="openCalendar('end')"
      >
        <span
         v-if="displayEndDate"
         class="base-date-range-picker__value"
        >
          {{ displayEndDate }}
        </span>
        <span
         v-else
         class="base-date-range-picker__placeholder"
        >
          {{ endPlaceholder }}
        </span>
      </button>
    </div>

    <Teleport to="body">
      <div
       v-if="calendarVisible"
       ref="calendarElement"
       class="base-date-range-picker__calendar"
       :class="{
         'is-open-upward': calendarPosition.openUpward,
       }"
       :style="calendarStyle"
      >
        <div class="base-date-range-picker__calendar-header">
          <div class="base-date-range-picker__calendar-title">
            <strong>{{ displayedMonth }} {{ currentYear }}</strong>
          </div>

          <div class="base-date-range-picker__calendar-actions">
            <BaseButton
             variant="transparent"
             size="smallest"
             @click="prevMonth"
            >
              Prev
            </BaseButton>
            <BaseButton
             variant="transparent"
             size="smallest"
             @click="nextMonth"
            >
              Next
            </BaseButton>
          </div>
        </div>

        <div class="base-date-range-picker__weekdays">
          <div
           v-for="weekday in WEEKDAY_NAMES"
           :key="weekday"
           class="base-date-range-picker__weekday"
          >
            {{ weekday }}
          </div>
        </div>

        <div class="base-date-range-picker__grid">
          <button
           v-for="cell in calendarCells"
           :key="cell.key"
           type="button"
           class="base-date-range-picker__day"
           :class="{
             'is-blank': !cell.date,
             'is-disabled': cell.date && isDateDisabled(cell.date),
             'is-start': isSelectedStart(cell.date),
             'is-end': isSelectedEnd(cell.date),
             'is-in-range': isInPreviewRange(cell.date),
           }"
           :disabled="!cell.date || isDateDisabled(cell.date)"
           @click="selectDate(cell.date)"
           @mouseenter="handleDayHover(cell.date)"
          >
            {{ cell.dayNumber ?? '' }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.base-date-range-picker {
  position: relative;
  width: 100%;
}

.base-date-range-picker__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.base-date-range-picker__field {
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

.base-date-range-picker__field:hover,
.base-date-range-picker__field.is-active {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 1px rgb(37 99 235 / 0.2);
}

.base-date-range-picker__placeholder {
  color: rgb(120 113 108);
}

.base-date-range-picker__value {
  color: inherit;
  font-weight: 500;
}

.base-date-range-picker__calendar {
  position: fixed;
  z-index: 90;
  padding: 1rem;
  border: 1px solid rgba(1, 29, 58, 0.08);
  border-radius: 1rem;
  background: var(--card-bg-color);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

.base-date-range-picker__calendar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.base-date-range-picker__calendar-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.base-date-range-picker__calendar-mode {
  font-size: 0.8125rem;
  color: rgb(120 113 108);
}

.base-date-range-picker__calendar-actions {
  display: flex;
  gap: 0.5rem;
}

.base-date-range-picker__weekdays,
.base-date-range-picker__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.375rem;
}

.base-date-range-picker__weekdays {
  margin-bottom: 0.625rem;
}

.base-date-range-picker__weekday {
  padding: 0.25rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(120 113 108);
}

.base-date-range-picker__day {
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

.base-date-range-picker__day:hover:not(.is-disabled):not(.is-blank):not(.is-start):not(.is-end) {
  background: rgb(219 234 254);
  color: rgb(30 64 175);
}

.base-date-range-picker__day.is-blank {
  visibility: hidden;
}

.base-date-range-picker__day.is-disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.base-date-range-picker__day.is-in-range {
  background: rgb(219 234 254);
  color: rgb(30 64 175);
}

.base-date-range-picker__day.is-start,
.base-date-range-picker__day.is-end {
  background: rgb(37 99 235);
  color: white;
}

:global(.dark) .base-date-range-picker__field {
  border-color: rgb(82 82 91);
  background: rgb(31 41 55 / 0.55);
}

:global(.dark) .base-date-range-picker__placeholder,
:global(.dark) .base-date-range-picker__calendar-mode,
:global(.dark) .base-date-range-picker__weekday {
  color: rgb(168 162 158);
}

:global(.dark) .base-date-range-picker__calendar {
  border-color: rgb(82 82 91);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
}

:global(.dark) .base-date-range-picker__day:hover:not(.is-disabled):not(.is-blank):not(.is-start):not(.is-end),
:global(.dark) .base-date-range-picker__day.is-in-range {
  background: rgb(30 64 175 / 0.28);
  color: rgb(219 234 254);
}

@media (max-width: 640px) {
  .base-date-range-picker__fields {
    grid-template-columns: 1fr;
  }

  .base-date-range-picker__calendar {
    padding: 0.875rem;
  }

  .base-date-range-picker__calendar-header {
    flex-direction: column;
  }

  .base-date-range-picker__calendar-actions {
    width: 100%;
  }

  .base-date-range-picker__calendar-actions :deep(button) {
    flex: 1 1 0;
  }
}
</style>
