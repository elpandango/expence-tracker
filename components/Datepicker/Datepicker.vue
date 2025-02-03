<template>
  <div
   ref="datepicker"
   class="w-full relative">
    <input
     type="text"
     class="w-full px-4 border-[1px] border-stone-200 dark:border-neutral-600 bg-transparent dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500"
     :value="formattedDate"
     :style="{height: height}"
     readonly
     :placeholder="placeholder"
     @click="toggleCalendar"
    >

    <div
     v-if="calendarVisible"
     class="bg-card-bg mt-2 border-[1px] border-stone-200 dark:border-neutral-600 p-2.5 rounded-md">
      <div class="flex items-center justify-between w-full mb-2.5">
        <BaseButton
         variant="transparent"
         size="smallest"
         @click="prevMonth">Prev
        </BaseButton>
        <span>{{ showCurrentMonth }} {{ currentYear }}</span>
        <BaseButton
         variant="transparent"
         size="smallest"
         @click="nextMonth">Next
        </BaseButton>
      </div>

      <div class="grid grid-cols-7 gap-1 mb-5">
        <div
         v-for="weekday in weekdays"
         :key="weekday"
         class="text-center p-1 text-sm font-bold cursor-default transition-all duration-300">
          {{ weekday }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div
         v-for="(day, index) in daysWithOffset"
         :key="index"
         :class="[
      'p-2 text-center cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:text-white',
      {
        'bg-white text-gray-700 hover:bg-white !cursor-not-allowed': !day,
        'bg-blue-600 text-white': isSelected(day),
        'bg-gray-200 text-gray-400 !cursor-not-allowed hover:bg-gray-200 hover:text-gray-400': day && isDisabled(day)
      }]"
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
  return maxDateObj.value && date > maxDateObj.value;
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

<style>
</style>
