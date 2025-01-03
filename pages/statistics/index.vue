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
             v-if="chartConfigs.expenses_vs_incomes.series[0].data.length > 0"
             :options="chartConfigs.expenses_vs_incomes"/>
            <NoChartsData v-else/>
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
             v-if="chartConfigs.top5 && chartConfigs.top5.series[0].data.length > 0"
             :options="chartConfigs.top5"/>
            <NoChartsData v-else/>
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
             v-if="chartConfigs.categories && chartConfigs.categories.series[0].data.length > 0"
             :options="chartConfigs.categories"/>
            <NoChartsData v-else/>
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
             v-if="chartConfigs.total_expenses && chartConfigs.total_expenses.series[0].data.length > 0"
             :options="chartConfigs.total_expenses"/>
            <NoChartsData v-else/>
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
import {generateChartConfigForType} from "~/utils/chartUtils";

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
  chartConfigs[type] = generateChartConfigForType(chartStore.chartDataByType, type);
  chartsLoadingState[type] = true;
};

const fetchChartsData = async (type, date) => {
  const typeMapping = {
    expenses_vs_incomes: 'allTransactions',
    categories: 'allCategories',
    top5: 'topCategories',
    total_expenses: 'cashAndCards',
  };

  const chartType = typeMapping[type];
  if (!chartType) {
    console.error(`Unknown chart type: ${type}`);
    return;
  }

  const dateQuery = `startDate=${date.startDate}&endDate=${date.endDate}&chartType=${chartType}`;

  try {
    const response = await chartStore.getChartsData(`?${dateQuery}`);
    chartStore.chartDataByType[chartType] = response.data;
  } catch (err) {
    console.error(`Error fetching data for ${chartType}:`, err);
  }
};

onMounted(async () => {
  try {
    const {default: component} = await import('~/components/HighchartComponent/HighchartComponent.vue');
    HighchartsComponent = component;

    const dateRange = {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };

    const chartTypes = ['expenses_vs_incomes', 'categories', 'top5', 'total_expenses'];
    const chartDataPromises = chartTypes.map((type) =>
     fetchChartsData(type, dateRange).then(() => {
       chartConfigs[type] = generateChartConfigForType(chartStore.chartDataByType, type);
     })
    );

    await Promise.all(chartDataPromises);
  } catch (err) {
    console.error('Error loading charts:', err);
  } finally {
    isHighchartsLoaded.value = true;
  }
});


</script>

<style
 lang="scss">
.charts-page {
  max-width: 1024px;
  margin: 0 auto;

  @media only screen and (max-width: 1366px) {
    max-width: 860px;
  }

  .charts {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .chart-row {
    width: 100%;
    display: flex;
    gap: 20px;

    @media only screen and (max-width: 767px) {
      flex-wrap: wrap;
    }
  }

  .chart-wrapper {
    display: flex;
    width: 100%;

    &.w50p {
      width: 49%;

      @media only screen and (max-width: 767px) {
        width: 100%;
      }
    }

    & > div:not(.chart-wrapper) {
      width: 100%;
      min-height: 300px;
    }
  }
}
</style>