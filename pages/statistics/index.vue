<script setup>
import {computed, ref, reactive, onMounted} from 'vue';
import {useSeoConfig} from "~/use/useSeoConfig";
import {useChartStore} from "~/stores/charts";
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
const isStatisticsLoading = ref(true);
let HighchartsComponent = null;
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

const handleDateChanged = async (date) => {
  categoryTableDateRange.value = {...date};
  await fetchCategoriesData(date);
};

const openCategoryDetails = (categoryItem) => {
  selectedCategoryDetails.category = categoryItem.category;
  selectedCategoryDetails.categoryId = categoryItem.categoryId;
  selectedCategoryDetails.startDate = categoryTableDateRange.value.startDate;
  selectedCategoryDetails.endDate = categoryTableDateRange.value.endDate;
  isCategoryTransactionsModalOpen.value = true;
};

const fetchCategoriesData = async (date) => {
  isStatisticsLoading.value = true;
  try {
    const dateQuery = `startDate=${date.startDate}&endDate=${date.endDate}&chartType=categoryTotals`;
    const response = await chartStore.getChartsData(`?${dateQuery}`);

    chartStore.chartDataByType.categoryTotals = response.data.map((item) => ({
      ...item,
      category: useLocalizatedCategories(item.category, locale.value),
    }));
  } catch (err) {
    console.error('Error fetching category statistics:', err);
  } finally {
    isStatisticsLoading.value = false;
  }
};

onMounted(async () => {
  try {
    const {default: component} = await import('~/components/HighchartComponent/HighchartComponent.vue');
    HighchartsComponent = component;

    const dateRange = getDateRangeForPreset(DATE_RANGE_PRESETS.currentMonth);
    await fetchCategoriesData(dateRange);
  } catch (err) {
    console.error('Error loading charts:', err);
  } finally {
    isHighchartsLoaded.value = true;
  }
});

const sortedCategories = computed(() => {
  if (chartStore.chartDataByType.categoryTotals?.length > 0) {
    const categories = [...chartStore.chartDataByType.categoryTotals];
    return categories?.sort((a, b) => b.amount - a.amount)
  }
  return [];
});

const totalExpensesAmount = computed(() => {
  return sortedCategories.value.reduce((total, category) => total + category.amount, 0);
});

const allCategoriesChartConfig = computed(() => ({
  chart: {
    type: 'pie',
    backgroundColor: '#ffffff',
    height: 520,
    spacingLeft: 0,
    spacingRight: 0,
  },
  title: {text: 'Expense Categories'},
  tooltip: {
    pointFormat: '<b>{point.percentage:.1f}%</b><br/>{point.y:.2f} EUR',
  },
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    layout: 'horizontal',
    alignColumns: false,
    itemMarginTop: 6,
    itemMarginBottom: 6,
    itemStyle: {
      textOverflow: 'clip',
    },
  },
  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 640,
        },
        chartOptions: {
          chart: {
            height: 620,
            spacingLeft: 0,
            spacingRight: 0,
          },
          legend: {
            itemWidth: 135,
            alignColumns: false,
          },
        },
      },
    ],
  },
  plotOptions: {
    pie: {
      innerSize: '58%',
      showInLegend: true,
      dataLabels: {
        enabled: false,
      },
    },
  },
  series: [
    {
      name: 'Expenses',
      colorByPoint: true,
      data: sortedCategories.value.map(({category, amount}) => ({
        name: category,
        y: amount,
      })),
    },
  ],
}));
</script>

<template>
  <div class="charts-page max-w-4xl lg:max-w-screen-lg m-auto">
    <h1 class="font-semibold text-3xl mb-4">{{ $t('components.statisticsPage.pageTitleText') }}</h1>

    <div class="charts w-full flex flex-wrap gap-5">

      <div class="w-full flex flex-wrap">
             <CardWithDate
         class="chart-wrapper w-full"
         @date-changed="handleDateChanged">
          <template v-if="!isStatisticsLoading">
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
            <div
             v-if="sortedCategories.length > 0"
             class="w-full py-3 px-3 border-t-[1px] border-stone-200 dark:border-neutral-600 flex items-center justify-between gap-3 text-[18px] font-semibold">
              <div>Total</div>
              <div>{{ formatStatAmount(totalExpensesAmount) }} EUR</div>
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
         @date-changed="handleDateChanged">
          <template v-if="isHighchartsLoaded && !isStatisticsLoading">
            <HighchartsComponent
             v-if="allCategoriesChartConfig && allCategoriesChartConfig.series[0].data.length > 0"
             :options="allCategoriesChartConfig"/>
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

<style>
</style>
