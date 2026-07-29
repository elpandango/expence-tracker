<template>
  <Card>
    <div class="mb-1 !min-h-[30px]">
      <div class="w-[208px]">
        <Dropdown
         v-model="selectedPeriod"
         :options="periods"
         type="form-dropdown"
         size="h-[36px]"
         placeholder="Select period"
         @update:model-value="onPeriodChange"
        />
      </div>

      <div v-if="selectedPeriod.value === 'custom'">
        <div class="w-full flex pt-2.5">
          <div class="flex flex-1 gap-3">
            <Datepicker
             v-model="startDate"
             :max-date="endDate || maxSelectableDate"
             placeholder="Select start date"
            />
            <Datepicker
             v-model="endDate"
             :min-date="startDate || ''"
             :max-date="maxSelectableDate"
             placeholder="Select end date"
            />
          </div>

          <BaseButton
           class="ml-3"
           @click="applyCustomRange">Apply
          </BaseButton>
        </div>
      </div>
    </div>

    <slot/>
  </Card>
</template>

<script
 setup
 lang="ts">
import {ref, computed, onMounted} from 'vue';
import Dropdown from "~/components/Dropdown/Dropdown.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";
import {DATE_RANGE_PRESETS, getDateRangeForPreset} from "~/utils/dateRangePresets";
import {formatDateToLocalIso} from "~/utils/dateFormat";

const emit = defineEmits(['date-changed']);

const selectedPeriod = ref({
  value: DATE_RANGE_PRESETS.currentMonth,
  label: 'Current month'
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

  emit('date-changed', {
    startDate: startDate.value,
    endDate: endDate.value,
  });
};

const applyCustomRange = () => {
  emit('date-changed', {
    startDate: startDate.value,
    endDate: endDate.value,
  });
};

onMounted(() => {
  const range = getDateRangeForPreset(selectedPeriod.value.value);
  startDate.value = range.startDate;
  endDate.value = range.endDate;
});
</script>

<style>
</style>
