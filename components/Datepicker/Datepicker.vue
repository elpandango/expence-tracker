<template>
  <div
   class="datepicker"
   ref="datepicker">
    <input
     type="text"
     :value="formattedDate"
     @click="toggleCalendar"
     :style="{height: height}"
     readonly
     :placeholder="placeholder"
    />

    <div
     v-if="calendarVisible"
     class="calendar">
      <div class="calendar-header">
        <BaseButton
         @click="prevMonth"
         variant="transparent"
         size="small">Prev
        </BaseButton>
        <span>{{showCurrentMonth }} {{ currentYear }}</span>
        <BaseButton
         @click="nextMonth"
         variant="transparent"
         size="small">Next
        </BaseButton>
      </div>

      <div class="calendar-weekdays">
        <div v-for="weekday in weekdays" :key="weekday" class="calendar-weekday">
          {{ weekday }}
        </div>
      </div>

      <div class="calendar-days">
        <div
         v-for="(day, index) in daysWithOffset"
         :key="index"
         :class="['calendar-day', { empty: !day, selected: isSelected(day), disabled: day && isDisabled(day) }]"
         @click="() => day && !isDisabled(day) && selectDate(day)"
        >
          {{ day || '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue';
import BaseButton from "~/components/Buttons/BaseButton.vue";

const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

const props = defineProps({
  modelValue: {
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

const emit = defineEmits(['update:modelValue']);

const calendarVisible = ref(false);
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null);
const currentDate = new Date();
const currentMonth = ref(currentDate.getMonth());
const currentYear = ref(currentDate.getFullYear());
const datepicker = ref(null);

const daysInMonth = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value + 1, 0);
  const numDays = date.getDate();
  return Array.from({length: numDays}, (_, i) => i + 1);
});

const daysWithOffset = computed(() => {
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1).getDay();
  const offset = (firstDayOfMonth + 6) % 7;
  const emptyDays = Array(offset).fill(null);
  return [...emptyDays, ...daysInMonth.value];
});

const formattedDate = computed(() => {
  return selectedDate.value
   ? `${selectedDate.value.getDate()}/${selectedDate.value.getMonth() + 1}/${selectedDate.value.getFullYear()}`
   : '';
});

const minDateObj = computed(() => (props.minDate ? new Date(props.minDate) : null));
const maxDateObj = computed(() => (props.maxDate ? new Date(props.maxDate) : null));

const isDisabled = (day) => {
  const date = new Date(currentYear.value, currentMonth.value, day);
  if (minDateObj.value && date < minDateObj.value) return true;
  if (maxDateObj.value && date > maxDateObj.value) return true;
  return false;
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedDate.value = new Date(newVal);
  } else {
    selectedDate.value = null;
  }
});

const toggleCalendar = () => {
  calendarVisible.value = !calendarVisible.value;
};

const selectDate = (day) => {
  selectedDate.value = new Date(Date.UTC(currentYear.value, currentMonth.value, day));
  calendarVisible.value = false;
  emit('update:modelValue', selectedDate.value.toISOString().substring(0, 10));
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const isSelected = (day) => {
  return selectedDate.value && selectedDate.value.getDate() === day && selectedDate.value.getMonth() === currentMonth.value && selectedDate.value.getFullYear() === currentYear.value;
};

const closeCalendar = (event) => {
  if (datepicker.value && !datepicker.value.contains(event.target)) {
    calendarVisible.value = false;
  }
};

const showCurrentMonth = computed(() => {
  const monthIndex = currentMonth.value;
  return monthsFull[monthIndex];
});

onMounted(() => {
  document.addEventListener('click', closeCalendar);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeCalendar);
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>
