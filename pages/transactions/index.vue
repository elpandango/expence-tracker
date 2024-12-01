<template>
  <div class="cards-page">
    <h1>Transactions</h1>

    <div class="filters">
      <div class="filter-item">
        <Dropdown
         v-model="filters.type"
         :options="transactionTypes"
         placeholder="Select transaction type"/>
      </div>

      <div class="filter-item">
        <Dropdown
         v-model="filters.source"
         :options="sources"
         placeholder="Select source"/>
      </div>

      <div class="filter-item">
        <Dropdown
         v-if="filters?.source?.value === 'card'"
         v-model="filters.cardId"
         :options="cards"
         placeholder="Select card"/>
      </div>

      <div class="filter-item">
        <Datepicker v-model="filters.startDate"/>
      </div>

      <div class="filter-item">
        <Datepicker v-model="filters.endDate"/>
      </div>

      <div class="filter-item">
        <input
         v-model="filters.minAmount"
         placeholder="Min amount"/>
      </div>

      <div class="filter-item">
        <input
         v-model="filters.maxAmount"
         placeholder="Max amount"/>
      </div>

      <div class="filter-item">
        <input
         v-model="filters.description"
         placeholder="Search description"/>
      </div>

      <BaseButton @click="updateTransactions">Apply Filters</BaseButton>
      <BaseButton @click="clearFilters">Clear Filters</BaseButton>
    </div>

    <Preloader
     height="50vh"
     v-if="uiStore.state.isLoading"/>
    <template v-else>
      <Card
       class="mar-b-4"
       v-for="transaction in financeStore.transactionsResponse.transactions"
       :key="transaction._id">
        <TransactionExtended
         :transaction="transaction"
        />
      </Card>

      <Pagination
       :data="financeStore.transactionsResponse"
       @page-changed="changePage"/>
    </template>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref, onMounted, watch} from 'vue';
import {useFinanceStore} from "~/stores/financeStore";
import {useUIStore} from "~/stores/ui";
import {emitter} from "~/classes/uiEventBus";
import BaseButton from "~/components/Buttons/BaseButton.vue";
import {useCardsList} from "~/use/useCardList";

const financeStore = useFinanceStore();
const uiStore = useUIStore();
const currentPage = ref(1);
const totalPages = ref(1);

const filters = ref({
  type: null,
  source: null,
  cardId: null,
  startDate: null,
  endDate: null,
  minAmount: null,
  maxAmount: null,
  description: null,
});

const transactionTypes = [
  {value: null, label: 'All Transactions'},
  {value: 'expense', label: 'Expenses'},
  {value: 'deposit', label: 'Deposits'},
];

const sources = [
  {value: null, label: 'All Sources'},
  {value: 'card', label: 'Cards'},
  {value: 'cash', label: 'Cash'},
];

const cards = ref([]);
const paginationData = ref({
  currentPage: 1,
  lastPage: 1,
  hasNextPage: false,
  hasPrevPage: false,
});

const updateTransactions = async () => {
  const updatedFilters = {
    type: filters.value?.type?.value ?? null,
    source: filters.value?.source?.value ?? null,
    cardId: filters.value?.cardId?.value ?? null,
    startDate: filters.value?.startDate ?? null,
    endDate: filters.value?.endDate ?? null,
    minAmount: filters.value?.minAmount ?? null,
    maxAmount: filters.value?.maxAmount ?? null,
    description: filters.value?.description ?? null,
  };

  emitter.emit('ui:startLoading', 'default');
  await financeStore.fetchTransactions(updatedFilters, currentPage.value, 10);
  emitter.emit('ui:stopLoading', 'default');
};

const clearFilters = async () => {
  filters.value = {
    type: null,
    source: null,
    cardId: null,
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null,
    description: null,
  };
  await updateTransactions();
};

const changePage = async (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    await updateTransactions();
  }
};

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  await financeStore.fetchTransactions();
  await financeStore.fetchCardsIfNeeded();
  const {cardsList} = useCardsList();
  cards.value = cardsList.value;
  emitter.emit('ui:stopLoading', 'default');
});

watch(() => financeStore.transactionsResponse, (newTransactions) => {
  const totalItems = newTransactions.totalItems;
  totalPages.value = Math.ceil(totalItems / 10);
  paginationData.value = {
    currentPage: currentPage.value,
    lastPage: totalPages.value,
    hasNextPage: currentPage.value < totalPages.value,
    hasPrevPage: currentPage.value > 1,
  };
});
</script>

<style
 lang="scss">
.filters {
  display: flex;
  flex-wrap: wrap;

  .filter-item {
    width: 50%;
  }
}
</style>