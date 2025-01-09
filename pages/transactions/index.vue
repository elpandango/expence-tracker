<template>
  <div class="transactions-page">
    <h1 class="page-title">{{ $t('components.transactionsPage.pageTitleText') }}</h1>

    <Card class="mar-b-6">
      <BalanceDetails/>
    </Card>

    <Accordion
     v-if="financeStore.accountsList && financeStore.accountsList.length > 0"
     type="basic"
     class="mar-b-6">
      <template v-slot:header>
        <div class="link-text">{{ $t('components.transactionsPage.filtersTitle') }}</div>
      </template>
      <template v-slot:accordion-body>
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
              <div class="dropdown-label">{{ $t('components.transactionsPage.filters.accountsLabelText') }}</div>
              <Dropdown
               v-model="sortBySelected"
               :options="transactions"
               type="form-dropdown"
               placeholder="Select account"/>
            </div>
          </div>
          <div class="filters-row">

            <div class="filter-item">
              <div class="dropdown-label">{{ $t('components.transactionsPage.filters.startDataLabelText') }}</div>
              <Datepicker
               v-model="filters.startDate"
               placeholder="Select start date"
               :max-date="filters.endDate"
              />
            </div>

            <div class="filter-item">
              <div class="dropdown-label">{{ $t('components.transactionsPage.filters.endDataLabelText') }}</div>
              <Datepicker
               v-model="filters.endDate"
               placeholder="Select end date"
               :max-date="new Date().toISOString().substring(0, 10)"
               :min-date="filters.startDate"
              />
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
      </template>
    </Accordion>

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
         @delete-clicked="handleDeleteTransactionOpenModal(dateTransaction)"
         @edit-clicked="handleEditTransactionOpenModal(dateTransaction)"
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

    <template v-if="isDeleteTransactionModalOpen">
      <DeleteTransactionModal
       :isOpen="isDeleteTransactionModalOpen"
       @delete="handleDeleteTransaction"
       @update:isOpen="isDeleteTransactionModalOpen = $event"
      />
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
import {useFormatDate} from "~/use/useFormatDate";
import {emitter} from "~/classes/uiEventBus";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const DeleteTransactionModal = defineAsyncComponent(() => import('~/components/Modals/DeleteTransactionModal.vue'));
const Pagination = defineAsyncComponent(() => import('~/components/Pagination/Pagination.vue'));
const BaseInput = defineAsyncComponent(() => import('~/components/Forms/Inputs/BaseInput.vue'));

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const financeStore = useFinanceStore();
const uiStore = useUIStore();
const currentPage = ref(1);
const totalPages = ref(1);
const route = useRoute();

const isDeleteTransactionModalOpen = ref(false);
const objectToDelete = ref({
  id: null,
});

const filters = ref({
  type: null,
  source: null,
  startDate: null,
  endDate: null,
  minAmount: null,
  maxAmount: null,
  description: null,
});

const transactionTypes = [
  {value: null, label: 'All Transactions'},
  {value: 'expense', label: 'Expenses'},
  {value: 'income', label: 'Deposits'},
];

const sortBySelected = ref({
  value: null,
  label: 'All Transactions'
});
const transactions = ref([]);
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
    accountId: sortBySelected.value.value ?? null,
  };

  emitter.emit('ui:startLoading', 'default');
  await financeStore.fetchTransactions(updatedFilters, currentPage.value, 5);
  emitter.emit('ui:stopLoading', 'default');
};

const clearFilters = async () => {
  filters.value = {
    type: null,
    source: null,
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

const handleDeleteTransactionOpenModal = async (transaction: object) => {
  isDeleteTransactionModalOpen.value = true;

  objectToDelete.value = {
    id: transaction._id ?? null,
  }
};

const handleDeleteTransaction = async () => {
  isDeleteTransactionModalOpen.value = false;
  await financeStore.deleteTransaction(objectToDelete.value.id);
};

const handleEditTransactionOpenModal = async (transaction: object) => {
  financeStore.editingTransaction.value = {...transaction};
  if (transaction.type === 'income') {
    uiStore.toggleModal('isAddFundsModalOpen', true);
  } else {
    uiStore.toggleModal('isAddExpenseModalOpen', true);
  }
};

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');

  if (route.query.description) {
    filters.value.description = route.query.description;
  }

  await financeStore.fetchTransactions();

  transactions.value = financeStore.accountsList.map(account => ({
    value: account._id,
    accountId: account._id,
    label: `${account.name} (${account.currency})`
  }));

  transactions.value.unshift({
    value: null, label: 'All transactions'
  });

  if (filters.value.description) {
    await updateTransactions();
  }

  emitter.emit('ui:stopLoading', 'default');
});

watch(() => financeStore.transactionsResponse, (newTransactions) => {
  const totalItems = newTransactions.totalItems;
  totalPages.value = Math.ceil(totalItems / 5);

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
.transactions-page {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;

  .page-title {
    width: 100%;
  }

  .page-filters {
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;

    @media only screen and (max-width: 1366px) {
      //max-width: 860px;
    }
  }

  .dropdown-label {
    margin-bottom: 8px;
  }

  .filters-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    width: 100%;
    margin-bottom: 16px;

    &.full-length {
      .filter-item {
        width: 100%;
      }
    }
  }

  .filter-item {
    width: calc(50% - 6px);

    @media only screen and (max-width: 540px) {
      width: 100%;
    }
  }

  .no-results {
    width: 100%;
    font-size: 18px;

    .card {
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
  }
}
</style>