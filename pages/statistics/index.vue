<template>
  <div class="charts-page max-w-4xl lg:max-w-screen-lg m-auto">
    <h1 class="font-semibold text-3xl mb-4">{{ $t('components.statisticsPage.pageTitleText') }}</h1>

    <div class="charts w-full flex flex-wrap gap-5">

      <div class="w-full flex flex-wrap">
        <CardWithDate
         class="chart-wrapper w-full sm:w-1/2"
         @date-changed="handleDateChanged('categoriesTable', $event)">
          <template v-if="sortedCategories">
            <h3 class="text-xl font-semibold my-3 mx-2">Expense categories</h3>
            <div class="w-full py-2 px-3 border-t-[1px] border-stone-200 dark:border-neutral-600"
                 v-for="expenseItem in sortedCategories"
                 :key="expenseItem.category">
              <strong>{{expenseItem.category}}</strong> - {{expenseItem.amount}} EUR
            </div>
          </template>
          <template v-else>
            <Preloader height="300px"/>
          </template>

        </CardWithDate>
      </div>

      <div class="w-full flex gap-5 flex-wrap md:flex-nowrap">
        <CardWithDate
         class="chart-wrapper w-full sm:w-1/2"
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
         class="chart-wrapper w-full sm:w-1/2"
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

      <div class="w-full flex gap-5 flex-wrap md:flex-nowrap">
        <CardWithDate
         class="chart-wrapper w-full sm:w-1/2"
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
         class="chart-wrapper w-full sm:w-1/2"
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
const chartConfigs = reactive({
  expenses_vs_incomes: null,
  categories: null,
  categoriesTable: null,
  top5: null,
  total_expenses: null,
});
const chartsLoadingState = reactive({
  expenses_vs_incomes: true,
  categories: true,
  categoriesTable: true,
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
    categoriesTable: 'allCategoriesTable',
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

    const chartTypes = ['expenses_vs_incomes', 'categories', 'categoriesTable', 'top5', 'total_expenses'];
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

const sortedCategories = computed(() => {
  if (chartStore.chartDataByType.allCategoriesTable?.length > 0) {
    return chartStore.chartDataByType.allCategoriesTable.sort((a, b) => b.amount - a.amount)
  }
  return [];
});
</script>

<style>
</style>