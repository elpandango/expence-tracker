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
import {ref, computed} from 'vue';
import Dropdown from "~/components/Dropdown/Dropdown.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const emit = defineEmits(['date-changed']);

const selectedPeriod = ref({
  value: 30,
  label: 'Last 30 days'
});

const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);

const maxSelectableDate = computed(() =>
 new Date().toISOString().substring(0, 10)
);

const periods = [
  {value: 7, label: 'Last 7 days'},
  {value: 30, label: 'Last 30 days'},
  {value: 90, label: 'Last 3 months'},
  {value: 180, label: 'Last 6 months'},
  {value: 365, label: 'Last 12 months'},
  {value: 'custom', label: 'Custom range'},
];

const onPeriodChange = () => {
  const calculatedStartDate = new Date();
  const calculatedEndDate = new Date();

  switch (selectedPeriod.value.value) {
    case 7:
      calculatedStartDate.setDate(calculatedStartDate.getDate() - 7);
      break;
    case 30:
      calculatedStartDate.setDate(calculatedStartDate.getDate() - 30);
      break;
    case 90:
      calculatedStartDate.setMonth(calculatedStartDate.getMonth() - 3);
      break;
    case 180:
      calculatedStartDate.setMonth(calculatedStartDate.getMonth() - 6);
      break;
    case 365:
      calculatedStartDate.setFullYear(calculatedStartDate.getFullYear() - 1);
      break;
  }

  startDate.value = calculatedStartDate.toISOString().substring(0, 10);
  endDate.value = calculatedEndDate.toISOString().substring(0, 10);

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
</script>

<style>
</style>
