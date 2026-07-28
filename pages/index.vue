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
    <Card :with-scroll="true">
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
    </Card>
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
import BaseButton from "~/components/Buttons/BaseButton.vue";
import Card from "~/components/Card/Card.vue";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const chartStore = useChartStore();
const financeStore = useFinanceStore();
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
    const dateRange = {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };

    const dateQuery = `startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&chartType=topCategories`;

    const response = await chartStore.getChartsData(`?${dateQuery}`);

    chartStore.chartDataByType.topCategories = response.data;

    const top5ChartData = chartStore.chartDataByType.topCategories?.map(t => ({
      name: t.category,
      y: Math.abs(t.amount),
    })) || [];

    chartConfig.value = {
      chart: {
        type: 'pie',
        backgroundColor: '#f9f9f9',
      },
      title: {
        text: 'Top 5 Expense Categories',
      },
      series: [
        {
          name: 'Expenses',
          colorByPoint: true,
          data: top5ChartData,
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
