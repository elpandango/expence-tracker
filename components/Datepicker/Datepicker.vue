<template>
  <div
   class="datepicker"
   ref="datepicker">
    <input
     type="text"
     :value="formattedDate"
     @click="toggleCalendar"
     readonly
     placeholder="Select date"
    />

    <div
     v-if="calendarVisible"
     class="calendar">
      <div class="calendar-header">
        <button @click="prevMonth">Prev</button>
        <span>{{ currentMonth + 1 }} {{ currentYear }}</span>
        <button @click="nextMonth">Next</button>
      </div>
      <div class="calendar-days">
        <div
         v-for="day in daysInMonth"
         :key="day"
         :class="['calendar-day', { selected: isSelected(day) }]"
         @click="selectDate(day)"
        >
          {{ day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue';

const props = defineProps({
  modelValue: {
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

const formattedDate = computed(() => {
  return selectedDate.value
   ? `${selectedDate.value.getDate()}/${selectedDate.value.getMonth() + 1}/${selectedDate.value.getFullYear()}`
   : '';
});

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
  return selectedDate.value && selectedDate.value.getDate() === day;
};

const closeCalendar = (event) => {
  if (datepicker.value && !datepicker.value.contains(event.target)) {
    calendarVisible.value = false;
  }
};

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
