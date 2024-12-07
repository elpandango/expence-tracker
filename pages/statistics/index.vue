<template>
  <div class="charts-page">
    <h1>Statistics</h1>
    <div v-if="isLoading">Loading chart...</div>

    <div
     class="charts"
     v-else>

      <CardWithDate
       class="chart-wrapper w50p"
       @date-changed="handleDateChanged">
        <HighchartsComponent :options="chartConfigs.lineChartOptions"/>
      </CardWithDate>

      <CardWithDate
       class="chart-wrapper w50p"
       @date-changed="handleDateChanged">
        <HighchartsComponent :options="chartConfigs.top5ChartOptions"/>
      </CardWithDate>

      <CardWithDate
       class="chart-wrapper w50p"
       @date-changed="handleDateChanged">
        <HighchartsComponent :options="chartConfigs.categoriesChartOptions"/>
      </CardWithDate>

      <CardWithDate
       class="chart-wrapper w50p"
       @date-changed="handleDateChanged">
        <HighchartsComponent :options="chartConfigs.cashVsCardsChartOptions"/>
      </CardWithDate>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useChartStore} from "~/stores/charts.ts";
import {generateChartConfigs} from "~/utils/chartUtils.ts";

const chartStore = useChartStore();
const isLoading = ref(true);
let HighchartsComponent = null;
const chartConfigs = ref({});

const handleDateChanged = (date) => {
  console.log('date: ', date);
};

onMounted(async () => {
  const {default: component} = await import('~/components/HighchartComponent/HighchartComponent.vue');
  HighchartsComponent = component;

  await Promise.all([
    chartStore.getChartsData('categories', '?type=expense&groupBy=category'),
    chartStore.getChartsData('totalIncomeAll', '?type=deposit'),
    chartStore.getChartsData('totalExpensesAll', '?type=expense'),
    chartStore.getChartsData('top5', '?type=expense&top=5&groupBy=category'),
    chartStore.getChartsData('totalCashExpenses', '?type=expense&source=cash'),
    chartStore.getChartsData('totalCardExpenses', '?type=expense&source=card'),
  ]);

  console.log('chartStore: ', chartStore);

  chartConfigs.value = generateChartConfigs(chartStore);

  isLoading.value = false;
});

</script>

<style
 lang="scss"
 src="./styles.scss"></style>