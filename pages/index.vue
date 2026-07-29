<template>
  <div class="index-page flex flex-wrap gap-5 w-full max-w-[1024px] m-auto">
    <Card class="mb-1.5">
      <BalanceDetails/>
    </Card>
    <Card>
      <template v-if="isHighchartsLoaded && topChartIsLoaded">
        <HighchartsComponent
         v-if="chartConfig && chartConfig.series[0].data.length > 0"
         :options="chartConfig"/>
        <NoChartsData v-else/>
      </template>
      <template v-else>
        <Preloader height="300px"/>
      </template>
    </Card>
    <div class="w-full">
      <TransactionsHistory>
        <template #header>
          <div class="title-block flex items-center justify-between mb-5 flex-wrap md:flex-nowrap gap-2">
            <h3 class="text-lg font-semibold">
              {{ $t('components.transactionsHistory.titleText') }}
            </h3>
            <div class="see-all">
              <NuxtLink to="/transactions">
                <BaseButton
                 size="smallest"
                 variant="transparent">{{ $t('components.transactionsHistory.seeAll') }}
                </BaseButton>
              </NuxtLink>
            </div>
          </div>
        </template>
      </TransactionsHistory>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {emitter} from "~/classes/uiEventBus";
import {onMounted, ref, watch} from "vue";
import {useChartStore} from "~/stores/charts";
import {useFinanceStore} from "~/stores/finance";
import {useSeoConfig} from "~/use/useSeoConfig";
import {useI18n} from "vue-i18n";
import {useLocalizatedCategories} from "~/use/useLocalizatedCategories";
import {DATE_RANGE_PRESETS, getDateRangeForPreset} from "~/utils/dateRangePresets";
import BaseButton from "~/components/Buttons/BaseButton.vue";
import Card from "~/components/Card/Card.vue";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const chartStore = useChartStore();
const financeStore = useFinanceStore();
const {locale} = useI18n();
const isHighchartsLoaded = ref(false);
const topChartIsLoaded = ref(false);
// eslint-disable-next-line
let HighchartsComponent: any = null;
const chartConfig = ref({});

const isChartDataLoaded = ref(false);

const fetchChartData = async () => {
  try {
    const {default: component} = await import('~/components/HighchartComponent/HighchartComponent.vue');
    HighchartsComponent = component;
  } catch (err) {
    console.log(err);
  } finally {
    isHighchartsLoaded.value = true;
  }

  try {
    const dateRange = getDateRangeForPreset(DATE_RANGE_PRESETS.currentMonth);

    const dateQuery = `startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&chartType=categoryTotals`;

    const response = await chartStore.getChartsData(`?${dateQuery}`);

    chartStore.chartDataByType.categoryTotals = response.data;

    const allCategoriesChartData = (chartStore.chartDataByType.categoryTotals || [])
      .sort((firstCategory, secondCategory) => secondCategory.amount - firstCategory.amount)
      .map(t => ({
        name: useLocalizatedCategories(t.category, locale.value),
        y: Math.abs(t.amount),
      }));

      chartConfig.value = {
      chart: {
        type: 'pie',
        backgroundColor: '#ffffff',
        height: 520,
        spacingLeft: 0,
        spacingRight: 0,
      },
      title: {
        text: 'Expense Categories',
      },
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
          data: allCategoriesChartData,
        },
      ],
    };

  } catch (err) {
    console.log(err);
  } finally {
    topChartIsLoaded.value = true;
  }
};

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  emitter.emit('ui:stopLoading', 'default');

  if (import.meta.client) {
    await fetchChartData();
    isChartDataLoaded.value = true;
  }
});

watch(
 () => financeStore.accountsList,
 async (newVal, oldVal) => {
   if (
    isChartDataLoaded.value &&
    JSON.stringify(newVal) !== JSON.stringify(oldVal)
   ) {
     await fetchChartData();
   }
 },
 {deep: true}
);
</script>

<style>
</style>
