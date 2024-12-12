<template>
  <div class="transactions-page">
    <h1 class="page-title">{{ $t('components.transactionsPage.pageTitleText') }}</h1>

    <Card class="mar-b-6">
      <BalanceDetails/>
    </Card>

    <div class="page-filters">
      <div class="filters-row">
        <div class="filter-item">
          <div class="dropdown-label">{{ $t('components.transactionsPage.filters.transactionLabelText') }}</div>
          <Dropdown
           v-model="filters.type"
           :options="transactionTypes"
           type="form-dropdown"
           placeholder="Select transaction type"/>
        </div>

        <div class="filter-item">
          <div class="dropdown-label">{{ $t('components.transactionsPage.filters.sourceLabelText') }}</div>
          <Dropdown
           v-model="filters.source"
           :options="sources"
           type="form-dropdown"
           placeholder="Select source"/>
        </div>

        <div
         class="filter-item"
         v-if="filters?.source?.value === 'card'">
          <div class="dropdown-label">{{ $t('components.transactionsPage.filters.cardLabelText') }}</div>
          <Dropdown
           v-model="filters.cardId"
           :options="cards"
           type="form-dropdown"
           placeholder="Select card"/>
        </div>
      </div>
      <div class="filters-row">

        <div class="filter-item">
          <div class="dropdown-label">{{ $t('components.transactionsPage.filters.startDataLabelText') }}</div>
          <Datepicker
           v-model="filters.startDate"
           placeholder="Select start date"/>
        </div>

        <div class="filter-item">
          <div class="dropdown-label">{{ $t('components.transactionsPage.filters.endDataLabelText') }}</div>
          <Datepicker
           v-model="filters.endDate"
           placeholder="Select end date"/>
        </div>
      </div>
      <div class="filters-row">
        <div class="filter-item">
          <BaseInput
           v-model="filters.minAmount"
           type="number"
           :placeholder="$t('components.transactionsPage.filters.minAmountPlaceholderText')"
           :label="$t('components.transactionsPage.filters.minAmountLabelText')"/>
        </div>

        <div class="filter-item">
          <BaseInput
           v-model="filters.maxAmount"
           type="number"
           :placeholder="$t('components.transactionsPage.filters.maxAmountPlaceholderText')"
           :label="$t('components.transactionsPage.filters.maxAmountLabelText')"/>
        </div>
      </div>
      <div class="filters-row full-length">
        <div class="filter-item">
          <BaseInput
           v-model="filters.description"
           :placeholder="$t('components.transactionsPage.filters.searchDescriptionPlaceholderText')"
           :label="$t('components.transactionsPage.filters.searchDescriptionLabelText')"/>
        </div>
      </div>
      <div class="filters-row btn-block">
        <BaseButton
         @click="updateTransactions"
         size="medium">{{ $t('components.buttons.applyFilters') }}
        </BaseButton>
        <BaseButton
         @click="clearFilters"
         size="medium"
         variant="transparent">{{ $t('components.buttons.clearFilters') }}
        </BaseButton>
      </div>
    </div>

    <Preloader
     height="50vh"
     v-if="uiStore.state.isLoading"/>
    <template v-else>
      <Card
       class="mar-b-4"
       v-for="transactionsList in financeStore.transactionsResponse.transactions"
       :key="transactionsList.date"
       :with-header="true">
        <template v-slot:header>{{ useFormatDate(transactionsList.date) }}</template>
        <TransactionExtended
         v-for="dateTransaction in transactionsList.transactions"
         :key="dateTransaction._id"
         :transaction="dateTransaction"
         :show-actions="true"
        />
      </Card>

      <div
       class="no-results"
       v-if="financeStore.transactionsResponse?.transactions?.length === 0">
        <Card
        >{{ $t('components.transactionsPage.emptyListText') }}
        </Card>
      </div>

      <Pagination
       v-if="financeStore.transactionsResponse?.lastPage > 1"
       :data="financeStore.transactionsResponse"
       @page-changed="changePage"/>
    </template>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref, onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useSeoConfig} from "~/use/useSeoConfig";
import {useFinanceStore} from "~/stores/finance";
import {useUIStore} from "~/stores/ui";
import {useCardsList} from "~/use/useCardList";
import {emitter} from "~/classes/uiEventBus";
import BaseButton from "~/components/Buttons/BaseButton.vue";
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";
import {useFormatDate} from "~/use/useFormatDate";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const financeStore = useFinanceStore();
const uiStore = useUIStore();
const currentPage = ref(1);
const totalPages = ref(1);
const route = useRoute();

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
    startDate: filters.value?.startDate ?? null,
    endDate: filters.value?.endDate ?? null,
    minAmount: filters.value?.minAmount ?? null,
    maxAmount: filters.value?.maxAmount ?? null,
    description: filters.value?.description ?? null,
  };

  if (filters.value?.source?.value === 'card') {
    updatedFilters.cardId = filters.value?.cardId?.value ?? null;
  }

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

  if (route.query.description) {
    filters.value.description = route.query.description;
  }

  await financeStore.fetchTransactions();
  await financeStore.fetchCardsIfNeeded();
  const {cardsList} = useCardsList();
  cards.value = cardsList.value;

  if (filters.value.description) {
    await updateTransactions();
  }

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
 lang="scss"
 src="./styles.scss">

</style>