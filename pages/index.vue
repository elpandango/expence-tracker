<template>
  <div class="index-page">
    <Card class="mar-b-6">
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
        <template v-slot:header>

          <div class="title-block">
            <h3 class="title">
              {{ $t('components.transactionsHistory.titleText') }}
            </h3>

            <div class="sorting-block">
              <span class="sort-label">{{ $t('components.transactionsHistory.sortByText') }}</span>
              <Dropdown
               v-model="sortBySelected"
               :options="transactionsHistoryOptions"
               :placeholder="$t('components.transactionsHistory.sortPlaceholderText')"
               @update:modelValue="handleDropdownChanged"
              />
            </div>
          </div>

          <div class="period-buttons">
            <div class="period">
              <BaseButton
               size="small"
               :variant="periodSelected === 'day' ? 'default' : 'transparent'"
               @click="changePeriod('day')">{{ $t('components.transactionsHistory.sortingPeriodDay') }}
              </BaseButton>
              <BaseButton
               size="small"
               :variant="periodSelected === 'week' ? 'default' : 'transparent'"
               @click="changePeriod('week')">{{ $t('components.transactionsHistory.sortingPeriodWeek') }}
              </BaseButton>
              <BaseButton
               size="small"
               :variant="periodSelected === 'month' ? 'default' : 'transparent'"
               @click="changePeriod('month')">{{ $t('components.transactionsHistory.sortingPeriodMonth') }}
              </BaseButton>
            </div>
            <div class="see-all">
              <NuxtLink to="/transactions">
                <BaseButton
                 size="small"
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
const transactions = ref([]);
const isHighchartsLoaded = ref(false);
const topChartIsLoaded = ref(false);
let HighchartsComponent: any = null;
const chartConfig = ref({});

const sortBySelected = ref({
  value: null,
  label: 'All Transactions'
});
const periodSelected = ref('week');
const transactionsHistoryOptions = ref([]);
const params = ref<Record<string, string | Date>>({});

const fetchTransactions = async (query = '') => {
  await financeStore.fetchTransactions(query);
  transactions.value = financeStore.transactions;
};

const updateParams = async (newParams: Record<string, any>) => {
  financeStore.setLoading('transactions', true);

  const filteredParams = Object.fromEntries(
   Object.entries(newParams).filter(([_, value]) => value !== '')
  );

  for (const key of Object.keys(params.value)) {
    if (!(key in filteredParams) && key !== 'startDate' && key !== 'endDate') {
      delete params.value[key];
    }
  }

  Object.assign(params.value, filteredParams);

  await fetchTransactions(params.value);
  financeStore.setLoading('transactions', false);
};

const handleDropdownChanged = async (option: any) => {
  const newParams: Record<string, string> = {};

  if (option.value) {
    newParams.accountId = option.accountId;
  } else {
    newParams.accountId = '';
  }

  await updateParams(newParams);
};

const changePeriod = async (period: string) => {
  const startDate = new Date();
  if (period === 'day') {
    startDate.setDate(startDate.getDate() - 1);
  } else if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else {
    startDate.setDate(startDate.getDate() - 30);
  }

  const now = new Date();

  const newParams = {
    startDate: `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`,
    endDate: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
  };
  periodSelected.value = period;
  await updateParams(newParams);
};

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

  await changePeriod('week');
  transactionsHistoryOptions.value = financeStore.accountsList.map(account => ({
    value: account._id,
    accountId: account._id,
    label: `${account.name} (${account.currency})`
  }));

  transactionsHistoryOptions.value.unshift({value: null, label: 'All transactions'});

  emitter.emit('ui:stopLoading', 'default');

  await fetchChartData();
});

watch(
 () => financeStore.accountsList,
 async (newVal, oldVal) => {
   await fetchChartData();
 },
 {deep: true}
);
</script>

<style
 lang="scss">
.index-page {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;

  flex-wrap: wrap;

  .title-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    @media only screen and (max-width: 480px) {
      flex-wrap: wrap;
    }

    .title {
      margin-bottom: 0;

      @media only screen and (max-width: 991px) {
        margin-bottom: 8px;
      }
    }
  }

  .sorting-block {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-left: 8px;

    .sort-label {
      font-size: 14px;
      margin-right: 8px;
      white-space: nowrap;
    }
  }

  .period-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;

    @media only screen and (max-width: 480px) {
      flex-wrap: wrap;
      gap: 8px;
    }

    .period {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>