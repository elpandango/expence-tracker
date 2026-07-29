<template>
  <div class="charts-page max-w-4xl lg:max-w-screen-lg m-auto">
    <h1 class="font-semibold text-3xl mb-4">{{ $t('components.statisticsPage.pageTitleText') }}</h1>

    <div class="charts w-full flex flex-wrap gap-5">

      <div class="w-full flex flex-wrap">
        <CardWithDate
         class="chart-wrapper w-full"
         @date-changed="handleDateChanged('categoriesTable', $event)">
          <template v-if="sortedCategories">
            <h3 class="text-xl font-semibold my-3 mx-2">Expense categories</h3>
            <div
             v-for="expenseItem in sortedCategories"
             :key="`${expenseItem.category}-${expenseItem.categoryId || 'uncategorized'}`"
             class="w-full py-2 px-3 border-t-[1px] border-stone-200 dark:border-neutral-600 flex items-center justify-between gap-3">
              <div>
                <strong>{{ expenseItem.category }}</strong> - {{ formatStatAmount(expenseItem.amount) }} EUR
              </div>
              <BaseButton
               v-if="expenseItem.categoryId"
               size="smallest"
               variant="transparent"
               @click="openCategoryDetails(expenseItem)">
                Details
              </BaseButton>
            </div>
          </template>
          <template v-else>
            <Preloader height="300px"/>
          </template>

        </CardWithDate>
      </div>

      <div class="w-full flex gap-5 flex-wrap md:flex-nowrap">
        <CardWithDate
         class="chart-wrapper w-full"
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
    </div>

    <CategoryTransactionsModal
     :is-open="isCategoryTransactionsModalOpen"
     :category-id="selectedCategoryDetails.categoryId"
     :category-name="selectedCategoryDetails.category"
     :start-date="selectedCategoryDetails.startDate"
     :end-date="selectedCategoryDetails.endDate"
     @close="isCategoryTransactionsModalOpen = false"
    />
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue';
import {useSeoConfig} from "~/use/useSeoConfig";
import {useChartStore} from "~/stores/charts";
import {generateChartConfigForType} from "~/utils/chartUtils";
import {useI18n} from "vue-i18n";
import {useLocalizatedCategories} from "~/use/useLocalizatedCategories";
import {DATE_RANGE_PRESETS, getDateRangeForPreset} from "~/utils/dateRangePresets";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const chartStore = useChartStore();
const {locale} = useI18n();
const CategoryTransactionsModal = defineAsyncComponent(() => import('~/components/Modals/CategoryTransactionsModal.vue'));

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
const categoryTableDateRange = ref(getDateRangeForPreset(DATE_RANGE_PRESETS.currentMonth));
const isCategoryTransactionsModalOpen = ref(false);
const selectedCategoryDetails = reactive({
  category: '',
  categoryId: null,
  startDate: categoryTableDateRange.value.startDate,
  endDate: categoryTableDateRange.value.endDate,
});

const formatStatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const handleDateChanged = async (type, date) => {
  if (type === 'categoriesTable') {
    categoryTableDateRange.value = {...date};
  }

  chartsLoadingState[type] = false;
  await fetchChartsData(type, date);
  chartConfigs[type] = generateChartConfigForType(chartStore.chartDataByType, type);
  chartsLoadingState[type] = true;
};

const openCategoryDetails = (categoryItem) => {
  selectedCategoryDetails.category = categoryItem.category;
  selectedCategoryDetails.categoryId = categoryItem.categoryId;
  selectedCategoryDetails.startDate = categoryTableDateRange.value.startDate;
  selectedCategoryDetails.endDate = categoryTableDateRange.value.endDate;
  isCategoryTransactionsModalOpen.value = true;
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
    chartStore.chartDataByType[chartType] = ['topCategories', 'allCategories', 'allCategoriesTable'].includes(chartType)
      ? response.data.map((item) => ({
          ...item,
          category: useLocalizatedCategories(item.category, locale.value),
        }))
      : response.data;
  } catch (err) {
    console.error(`Error fetching data for ${chartType}:`, err);
  }
};

onMounted(async () => {
  try {
    const {default: component} = await import('~/components/HighchartComponent/HighchartComponent.vue');
    HighchartsComponent = component;

    const dateRange = getDateRangeForPreset(DATE_RANGE_PRESETS.currentMonth);

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
    const categories = [...chartStore.chartDataByType.allCategoriesTable];
    return categories?.sort((a, b) => b.amount - a.amount)
  }
  return [];
});
</script>

<style>
</style>
