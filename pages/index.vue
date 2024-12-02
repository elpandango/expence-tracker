<template>
  <div class="index-page">
    <div class="card-details-block">
      <Card class="mar-b-6">
        <BalanceDetails/>
      </Card>
      <Card :with-scroll="true">
        <TransactionsHistory>
          <template v-slot:header>

            <div class="title-block">
              <h3 class="title">
                Transactions History
              </h3>

              <div class="sorting-block">
                <span class="sort-label">Sort by</span>
                <Dropdown
                 v-model="sortBySelected"
                 :options="transactionsHistoryOptions"
                 placeholder="Choose an option"
                 @update:modelValue="handleDropdownChanged"
                />
              </div>
            </div>

            <div class="period-buttons">
              <div class="period">
                <BaseButton
                 size="small"
                 :variant="periodSelected === 'day' ? 'default' : 'transparent'"
                 @click="changePeriod('day')">Day
                </BaseButton>
                <BaseButton
                 size="small"
                 :variant="periodSelected === 'week' ? 'default' : 'transparent'"
                 @click="changePeriod('week')">Week
                </BaseButton>
                <BaseButton
                 size="small"
                 :variant="periodSelected === 'month' ? 'default' : 'transparent'"
                 @click="changePeriod('month')">Month
                </BaseButton>
              </div>
              <div class="see-all">
                <NuxtLink to="/transactions">
                  <BaseButton
                   size="small"
                   variant="transparent">See All
                  </BaseButton>
                </NuxtLink>
              </div>
            </div>
          </template>
        </TransactionsHistory>
      </Card>
    </div>
    <div class="statistics-block">
      <Card>
        Transactions Statistics
      </Card>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {onMounted, ref} from "vue";
import Card from "~/components/Card/Card.vue";
import {useFinanceStore} from "~/stores/financeStore";
import {useCardsList} from "~/use/useCardList";
import {emitter} from "~/classes/uiEventBus";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const financeStore = useFinanceStore();
const transactions = ref([]);

useHead({
  htmlAttrs: {
    lang: 'en'
  },
});

const sortBySelected = ref(null);
const periodSelected = ref('week');
const transactionsHistoryOptions = ref([]);
const params = ref<Record<string, string | Date>>({});

const fetchTransactions = async (query = '') => {
  await financeStore.fetchTransactions(query);
  transactions.value = financeStore.transactions;
};

const updateParams = async (newParams: Record<string, any>) => {
  financeStore.setLoading('transactions', true);
  Object.assign(params.value, newParams);
  await fetchTransactions(params.value);
  financeStore.setLoading('transactions', false);
};

const handleDropdownChanged = async (option: any) => {
  const newParams: Record<string, string> = {};
  if (option.label === 'Cash') {
    newParams.source = 'cash';
    newParams.cardId = '';
  } else if (option.label === 'All transactions') {
    newParams.source = '';
    newParams.cardId = '';
  } else if (option.value) {
    newParams.cardId = option.value;
    newParams.source = 'card';
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

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');

  const {cardsList} = useCardsList([
     {value: null, label: 'All transactions'},
     {value: null, label: 'Cash'}
   ]
  );

  await changePeriod('week');
  transactionsHistoryOptions.value = cardsList.value;
  emitter.emit('ui:stopLoading', 'default');
});

</script>

<style
 lang="scss"
 src="./styles.scss"></style>