<script
 setup
 lang="ts">
import {computed, ref, reactive, onMounted} from 'vue';
import {useSeoConfig} from "~/use/useSeoConfig";
import {useChartStore} from "~/stores/charts";
import {useI18n} from "vue-i18n";
import {useLocalizatedCategories} from "~/use/useLocalizatedCategories";
import {DATE_RANGE_PRESETS, getDateRangeForPreset} from "~/utils/dateRangePresets";
import {getDateRangeLengthInDays, shiftDateRangeByYears} from "~/utils/dateFormat";

type CategoryTotalItem = {
  category: string;
  categoryId: string | null;
  amount: number;
};

type ComparisonCategoryRow = {
  key: string;
  category: string;
  categoryId: string | null;
  currentAmount: number;
  previousAmount: number;
  canOpenDetails: boolean;
};

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const chartStore = useChartStore();
const {locale} = useI18n();
const CategoryTransactionsModal = defineAsyncComponent(() => import('~/components/Modals/CategoryTransactionsModal.vue'));

const isHighchartsLoaded = ref(false);
const isStatisticsLoading = ref(true);
let HighchartsComponent = null;
const categoryTableDateRange = ref(getDateRangeForPreset(DATE_RANGE_PRESETS.currentMonth));
const previousYearCategoryTotals = ref<CategoryTotalItem[]>([]);
const isCategoryTransactionsModalOpen = ref(false);
const selectedCategoryDetails = reactive({
  category: '',
  categoryId: null,
  startDate: categoryTableDateRange.value.startDate,
  endDate: categoryTableDateRange.value.endDate,
});
const MAX_COMPARISON_RANGE_DAYS = 366;

const formatStatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const localizeCategoryTotals = (items: CategoryTotalItem[]) => {
  return items.map((item) => ({
    ...item,
    category: useLocalizatedCategories(item.category, locale.value),
  }));
};

const shouldShowPreviousYearColumn = computed(() => {
  return getDateRangeLengthInDays(categoryTableDateRange.value) <= MAX_COMPARISON_RANGE_DAYS;
});

const currentPeriodYearLabel = computed(() => {
  return categoryTableDateRange.value.endDate.slice(0, 4);
});

const previousPeriodYearLabel = computed(() => {
  return shiftDateRangeByYears(categoryTableDateRange.value, -1).endDate.slice(0, 4);
});

const handleDateChanged = async (date) => {
  categoryTableDateRange.value = {...date};
  await fetchCategoriesData(date);
};

const openCategoryDetails = (categoryItem) => {
  if (!categoryItem.categoryId) return;

  selectedCategoryDetails.category = categoryItem.category;
  selectedCategoryDetails.categoryId = categoryItem.categoryId;
  selectedCategoryDetails.startDate = categoryTableDateRange.value.startDate;
  selectedCategoryDetails.endDate = categoryTableDateRange.value.endDate;
  isCategoryTransactionsModalOpen.value = true;
};

const fetchCategoriesData = async (date) => {
  isStatisticsLoading.value = true;
  try {
    const previousYearDateRange = shiftDateRangeByYears(date, -1);
    const currentDateQuery = `startDate=${date.startDate}&endDate=${date.endDate}&chartType=categoryTotals`;
    const previousDateQuery = `startDate=${previousYearDateRange.startDate}&endDate=${previousYearDateRange.endDate}&chartType=categoryTotals`;
    const [currentResponse, previousResponse] = await Promise.all([
      chartStore.getChartsData(`?${currentDateQuery}`),
      chartStore.getChartsData(`?${previousDateQuery}`),
    ]);

    chartStore.chartDataByType.categoryTotals = localizeCategoryTotals(currentResponse.data);
    previousYearCategoryTotals.value = localizeCategoryTotals(previousResponse.data);
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

const comparisonRows = computed<ComparisonCategoryRow[]>(() => {
  const categoriesMap = new Map<string, ComparisonCategoryRow>();

  const addRow = (
    items: CategoryTotalItem[],
    amountKey: 'currentAmount' | 'previousAmount'
  ) => {
    items.forEach((item) => {
      const key = item.categoryId || `uncategorized-${item.category}`;
      const existingRow = categoriesMap.get(key);

      if (existingRow) {
        existingRow[amountKey] = item.amount;
        return;
      }

      categoriesMap.set(key, {
        key,
        category: item.category,
        categoryId: item.categoryId,
        currentAmount: amountKey === 'currentAmount' ? item.amount : 0,
        previousAmount: amountKey === 'previousAmount' ? item.amount : 0,
        canOpenDetails: !!item.categoryId,
      });
    });
  };

  addRow(sortedCategories.value, 'currentAmount');
  addRow(previousYearCategoryTotals.value, 'previousAmount');

  return [...categoriesMap.values()].sort((left, right) => {
    if (right.currentAmount !== left.currentAmount) {
      return right.currentAmount - left.currentAmount;
    }

    return right.previousAmount - left.previousAmount;
  });
});

const totalExpensesAmount = computed(() => {
  return comparisonRows.value.reduce((total, category) => total + category.currentAmount, 0);
});

const totalPreviousYearExpensesAmount = computed(() => {
  return comparisonRows.value.reduce((total, category) => total + category.previousAmount, 0);
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
            <div v-if="comparisonRows.length > 0" class="w-full overflow-x-auto">
              <table class="statistics-table w-full border-separate border-spacing-0 md:min-w-[640px]">
                <thead>
                  <tr>
                    <th class="statistics-table__head statistics-table__head--text">Category</th>
                    <th class="statistics-table__head">{{ currentPeriodYearLabel }}</th>
                    <th v-if="shouldShowPreviousYearColumn" class="statistics-table__head">{{ previousPeriodYearLabel }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                   v-for="row in comparisonRows"
                   :key="row.key"
                   class="statistics-table__row"
                   :class="{
                     'is-clickable': row.canOpenDetails,
                   }"
                   @click="row.canOpenDetails && openCategoryDetails(row)">
                    <td class="statistics-table__cell statistics-table__cell--category">
                      {{ row.category }}
                    </td>
                    <td class="statistics-table__cell statistics-table__cell--amount">
                      €{{ formatStatAmount(row.currentAmount) }}
                    </td>
                    <td v-if="shouldShowPreviousYearColumn" class="statistics-table__cell statistics-table__cell--amount">
                      €{{ formatStatAmount(row.previousAmount) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="statistics-table__footer">
                    <td class="statistics-table__cell statistics-table__cell--total-label">Total</td>
                    <td class="statistics-table__cell statistics-table__cell--total-value">
                      €{{ formatStatAmount(totalExpensesAmount) }}
                    </td>
                    <td v-if="shouldShowPreviousYearColumn" class="statistics-table__cell statistics-table__cell--total-value">
                      €{{ formatStatAmount(totalPreviousYearExpensesAmount) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <NoChartsData v-else/>
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
.statistics-table__head {
  padding: 0.875rem 0.75rem;
  border-bottom: 1px solid rgb(231 229 228);
  color: rgb(87 83 78);
  font-size: 1.125rem;
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
}

.statistics-table__head--text {
  text-align: left;
}

.statistics-table__head--actions,
.statistics-table__cell--actions {
  width: 3.5rem;
  text-align: center;
}

.statistics-table__row {
  transition: background-color 120ms ease;
}

.statistics-table__row.is-clickable {
  cursor: pointer;
}

.statistics-table__row.is-clickable:hover {
  background: rgba(37, 99, 235, 0.04);
}

.statistics-table__cell {
  padding: 0.95rem 0.75rem;
  border-bottom: 1px solid rgb(231 229 228);
  vertical-align: middle;
  font-size: 1rem;
}

.statistics-table__cell--category {
  font-weight: 600;
}

.statistics-table__cell--amount,
.statistics-table__cell--total-value {
  text-align: right;
  white-space: nowrap;
}

.statistics-table__footer .statistics-table__cell {
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: 0;
  font-size: 1rem;
  font-weight: 700;
}

.statistics-table__cell--total-label {
  font-weight: 700;
}

:global(.dark) .statistics-table__head,
:global(.dark) .statistics-table__cell {
  border-bottom-color: rgb(82 82 91);
}

:global(.dark) .statistics-table__head {
  color: rgb(168 162 158);
}

:global(.dark) .statistics-table__row.is-clickable:hover {
  background: rgba(59, 130, 246, 0.08);
}

@media (max-width: 767px) {
  .statistics-table {
    width: 100%;
    table-layout: fixed;
  }

  .statistics-table__head {
    padding: 0.625rem 0.375rem;
    font-size: 1rem;
  }

  .statistics-table__head--text,
  .statistics-table__cell--category {
    width: 40%;
  }

  .statistics-table__head:not(.statistics-table__head--text),
  .statistics-table__cell--amount,
  .statistics-table__cell--total-value {
    width: 30%;
  }

  .statistics-table__head--actions,
  .statistics-table__cell--actions {
    width: 2.25rem;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }

  .statistics-table__cell {
    padding: 0.75rem 0.375rem;
    font-size: 1rem;
  }

  .statistics-table__cell--category {
    font-size: 1rem;
    word-break: break-word;
  }

  .statistics-table__footer .statistics-table__cell {
    padding-top: 0.875rem;
    padding-bottom: 0.875rem;
    font-size: 0.9375rem;
  }
}
</style>
