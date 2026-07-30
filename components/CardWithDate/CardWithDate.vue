<script
 setup
 lang="ts">
import {ref, computed, onMounted, watch} from 'vue';
import Dropdown from "~/components/Dropdown/Dropdown.vue";
import BaseDateRangePicker from '~/components/DateRangePicker/BaseDateRangePicker.vue';
import {DATE_RANGE_PRESETS, getDateRangeForPreset} from "~/utils/dateRangePresets";
import {formatDateToLocalIso} from "~/utils/dateFormat";

const emit = defineEmits(['date-changed']);

const selectedPeriod = ref({
  value: DATE_RANGE_PRESETS.currentMonth,
  label: 'Current month'
});

const customRange = ref({
  startDate: '2026-07-01',
  endDate: '2026-07-30',
});

const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);

const maxSelectableDate = computed(() =>
  formatDateToLocalIso(new Date())
);

const periods = [
  {value: DATE_RANGE_PRESETS.currentWeek, label: 'Current week'},
  {value: DATE_RANGE_PRESETS.currentMonth, label: 'Current month'},
  {value: DATE_RANGE_PRESETS.last3Months, label: 'Last 3 months'},
  {value: DATE_RANGE_PRESETS.last6Months, label: 'Last 6 months'},
  {value: DATE_RANGE_PRESETS.last12Months, label: 'Last 12 months'},
  {value: DATE_RANGE_PRESETS.custom, label: 'Custom range'},
];

const onPeriodChange = () => {
  if (selectedPeriod.value.value === DATE_RANGE_PRESETS.custom) {
    return;
  }

  const range = getDateRangeForPreset(selectedPeriod.value.value);
  startDate.value = range.startDate;
  endDate.value = range.endDate;

  customRange.value.startDate = range.startDate;
  customRange.value.endDate = range.endDate;

  emit('date-changed', {
    startDate: startDate.value,
    endDate: endDate.value,
  });
};

watch(customRange, (range) => {
  startDate.value = range.startDate;
  endDate.value = range.endDate;

  if (
    selectedPeriod.value.value === DATE_RANGE_PRESETS.custom &&
    range.startDate &&
    range.endDate
  ) {
    emit('date-changed', {
      startDate: range.startDate,
      endDate: range.endDate,
    });
  }
}, {deep: true});

onMounted(() => {
  const range = getDateRangeForPreset(selectedPeriod.value.value);
  startDate.value = range.startDate;
  endDate.value = range.endDate;

  customRange.value.startDate = range.startDate;
  customRange.value.endDate = range.endDate;
});
</script>

<template>
  <Card>
    <div class="mb-4 !min-h-[30px]">
      <div class="w-full md:w-[208px]">
        <Dropdown
         v-model="selectedPeriod"
         :options="periods"
         type="form-dropdown"
         size="h-[36px]"
         placeholder="Select period"
         @update:model-value="onPeriodChange"
        />
      </div>

      <div v-if="selectedPeriod.value === 'custom'" class="w-full mt-4">
        <BaseDateRangePicker
         v-model="customRange"
         start-placeholder="Start date"
         end-placeholder="End date"
         :max-date="maxSelectableDate"
        />
      </div>
    </div>

    <slot/>
  </Card>
</template>

<style>
</style>
