<template>
  <div class="charts-page">
    <h1>{{ $t('components.statisticsPage.pageTitleText') }}</h1>

    <div class="charts">
      <div class="chart-row">
        <CardWithDate
         class="chart-wrapper w50p"
         @date-changed="handleDateChanged('expenses_vs_incomes', $event)">
          <template v-if="isHighchartsLoaded && chartsLoadingState.expenses_vs_incomes">
            <HighchartsComponent
             v-if="chartConfigs.expenses_vs_incomes"
             :options="chartConfigs.expenses_vs_incomes"/>
          </template>
          <template v-else>
            <Preloader height="300px"/>
          </template>
        </CardWithDate>

        <CardWithDate
         class="chart-wrapper w50p"
         @date-changed="handleDateChanged('top5', $event)">
          <template v-if="isHighchartsLoaded && chartsLoadingState.top5">
            <HighchartsComponent
             v-if="chartConfigs.top5"
             :options="chartConfigs.top5"/>
          </template>
          <template v-else>
            <Preloader height="300px"/>
          </template>
        </CardWithDate>
      </div>

      <div class="chart-row">
        <CardWithDate
         class="chart-wrapper w50p"
         @date-changed="handleDateChanged('categories', $event)">
          <template v-if="isHighchartsLoaded && chartsLoadingState.categories">
            <HighchartsComponent
             v-if="chartConfigs.categories"
             :options="chartConfigs.categories"/>
          </template>
          <template v-else>
            <Preloader height="300px"/>
          </template>
        </CardWithDate>

        <CardWithDate
         class="chart-wrapper w50p"
         @date-changed="handleDateChanged('total_expenses', $event)">
          <template v-if="isHighchartsLoaded && chartsLoadingState.total_expenses">
            <HighchartsComponent
             v-if="chartConfigs.total_expenses"
             :options="chartConfigs.total_expenses"/>
          </template>
          <template v-else>
            <Preloader height="300px"/>
          </template>
        </CardWithDate>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue';
import {useSeoConfig} from "~/use/useSeoConfig";
import {useChartStore} from "~/stores/charts";
import {generateChartConfigs, generateChartConfigForType} from "~/utils/chartUtils";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const chartStore = useChartStore();

const isHighchartsLoaded = ref(false);
let HighchartsComponent = null;
let chartConfigs = reactive({
  expenses_vs_incomes: null,
  categories: null,
  top5: null,
  total_expenses: null,
});
const chartsLoadingState = reactive({
  expenses_vs_incomes: true,
  categories: true,
  top5: true,
  total_expenses: true,
});

const handleDateChanged = async (type, date) => {
  chartsLoadingState[type] = false;
  await fetchChartsData(type, date);
  chartConfigs[type] = generateChartConfigForType(chartStore, type);
  chartsLoadingState[type] = true;
};

const fetchChartsData = async (type, date) => {
  const dateQuery = `&startDate=${date.startDate}&endDate=${date.endDate}`;

  try {
    if (type === 'expenses_vs_incomes') {
      await Promise.all([
        chartStore.getChartsData('totalExpensesAll', `?type=expense${dateQuery}`),
        chartStore.getChartsData('totalIncomeAll', `?type=deposit${dateQuery}`)
      ]);
    } else if (type === 'categories') {
      await Promise.all([
        chartStore.getChartsData('categories', `?type=expense&groupBy=category${dateQuery}`)
      ]);
    } else if (type === 'top5') {
      await Promise.all([
        chartStore.getChartsData('top5', `?type=expense&top=5&groupBy=category${dateQuery}`)
      ]);
    } else if (type === 'total_expenses') {
      await Promise.all([
        chartStore.getChartsData('totalCashExpenses', `?type=expense&source=cash${dateQuery}`),
        chartStore.getChartsData('totalCardExpenses', `?type=expense&source=card${dateQuery}`)
      ]);
    }
  } catch (err) {
    console.error(`Error fetching data for ${type}:`, err);
  }
};

onMounted(async () => {
  try {
    const {default: component} = await import('~/components/HighchartComponent/HighchartComponent.vue');
    HighchartsComponent = component;
    await chartStore.getAllChartsData();
  } catch (err) {
    console.log(err);
  } finally {
    chartConfigs = generateChartConfigs(chartStore);
    isHighchartsLoaded.value = true;
  }
});

</script>

<style
 lang="scss"
 src="./styles.scss"></style>