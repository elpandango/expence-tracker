<template>
  <Card>
    <div class="period-selector mar-b-4">
      <div class="dropdown-block">
        <Dropdown
         v-model="selectedPeriod"
         :options="periods"
         type="form-dropdown"
         size="small"
         placeholder="Select period"
         @update:modelValue="onPeriodChange"
        />
      </div>

      <div v-if="selectedPeriod.value === 'custom'">
        <div class="filters">
          <div class="filters-row">
            <Datepicker
             v-model="startDate"
             placeholder="Select start date"/>
            <Datepicker
             v-model="endDate"
             placeholder="Select end date"/>
          </div>

          <BaseButton @click="applyCustomRange">Apply</BaseButton>
        </div>

      </div>
    </div>

    <slot></slot>
  </Card>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import Dropdown from "~/components/Dropdown/Dropdown.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const emit = defineEmits(['date-changed']);

const selectedPeriod = ref({
  value: 30,
  label: 'Last 30 days'
});

const startDate = ref('');
const endDate = ref('');
const periods = [
  {value: 7, label: 'Last 7 days'},
  {value: 30, label: 'Last 30 days'},
  {value: 90, label: 'Last 3 months'},
  {value: 180, label: 'Last 6 months'},
  {value: 365, label: 'Last 12 months'},
  {value: 'custom', label: 'Custom range'},
];

const onPeriodChange = () => {
  let startDate = new Date();
  const endDate = new Date();

  switch (selectedPeriod.value.value) {
    case 7:
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 30:
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 90:
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 180:
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case 365:
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  emit('date-changed', {
    startDate: startDate.toISOString().substring(0, 10),
    endDate: endDate.toISOString().substring(0, 10)
  });
};

const applyCustomRange = () => {
  emit('date-changed', {
    startDate: startDate.value,
    endDate: endDate.value
  });
};

</script>

<style
 lang="scss">

.period-selector {
  .dropdown-block {
    width: 208px;
  }

  .filters {
    display: flex;
    width: 100%;
    padding-top: 10px;

    .filters-row {
      display: flex;
      flex: 1;
      gap: 12px;
    }

    .button {
      margin-left: 12px;
    }
  }
}

</style>