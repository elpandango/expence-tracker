<template>
  <div class="transactions-page flex flex-wrap w-full max-w-[960px] m-auto">
    <h1 class="w-full font-semibold">{{ $t('components.transactionsPage.pageTitleText') }}</h1>
    <Card class="mb-6">
      <BalanceDetails/>
    </Card>

    <Accordion
     v-if="financeStore.accountsList && financeStore.accountsList.length > 0"
     type="basic"
     class="mb-6">
      <template #header>
        <div class="link-text">{{ $t('components.transactionsPage.filtersTitle') }}</div>
      </template>
      <template #accordion-body>
        <div class="w-full max-w-[1024px] m-auto">
          <div class="flex flex-wrap md:flex-nowrap w-full mb-4 gap-3">
            <div class="w-full md:w-1/2">
              <div class="dropdown-label mb-2">{{ $t('components.transactionsPage.filters.transactionLabelText') }}</div>
              <Dropdown
               v-model="filters.type"
               :options="transactionTypes"
               type="form-dropdown"
               size="h-[40px]"
               placeholder="Select transaction type"/>
            </div>

            <div class="w-full md:w-1/2">
              <div class="mb-2">{{ $t('components.transactionsPage.filters.accountsLabelText') }}</div>
              <Dropdown
               v-model="sortBySelected"
               :options="transactions"
               type="form-dropdown"
               size="h-[40px]"
               placeholder="Select account"/>
            </div>
          </div>
          <div class="flex flex-wrap md:flex-nowrap w-full mb-4 gap-3">
            <div class="w-full md:w-1/2">
              <div class="mb-2">{{ $t('components.transactionsPage.filters.startDataLabelText') }}</div>
              <Datepicker
               v-model="filters.startDate"
               placeholder="Select start date"
               :max-date="filters.endDate"
              />
            </div>

            <div class="w-full md:w-1/2">
              <div class="mb-2">{{ $t('components.transactionsPage.filters.endDataLabelText') }}</div>
              <Datepicker
               v-model="filters.endDate"
               placeholder="Select end date"
               :max-date="new Date().toISOString().substring(0, 10)"
               :min-date="filters.startDate"
              />
            </div>
          </div>
          <div class="flex flex-wrap md:flex-nowrap w-full mb-4 gap-3">
            <div class="w-full md:w-1/2">
              <BaseInput
               v-model="filters.minAmount"
               type="number"
               size="h-[40px]"
               :placeholder="$t('components.transactionsPage.filters.minAmountPlaceholderText')"
               :label="$t('components.transactionsPage.filters.minAmountLabelText')"/>
            </div>

            <div class="w-full md:w-1/2">
              <BaseInput
               v-model="filters.maxAmount"
               type="number"
               size="h-[40px]"
               :placeholder="$t('components.transactionsPage.filters.maxAmountPlaceholderText')"
               :label="$t('components.transactionsPage.filters.maxAmountLabelText')"/>
            </div>
          </div>
          <div class="flex flex-wrap md:flex-nowrap w-full mb-4 gap-3">
            <div class="w-full">
              <BaseInput
               v-model="filters.description"
               size="h-[40px]"
               class="w-full"
               :placeholder="$t('components.transactionsPage.filters.searchDescriptionPlaceholderText')"
               :label="$t('components.transactionsPage.filters.searchDescriptionLabelText')"/>
            </div>
          </div>
          <div class="flex flex-wrap w-full mb-4 gap-3">
            <BaseButton
             size="medium"
             @click="updateTransactions">{{ $t('components.buttons.applyFilters') }}
            </BaseButton>
            <BaseButton
             size="medium"
             variant="transparent"
             @click="clearFilters">{{ $t('components.buttons.clearFilters') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </Accordion>

    <Preloader
     v-if="uiStore.state.isLoading"
     height="50vh"/>
    <template v-else>
      <Card
       v-for="transactionsList in financeStore.transactionsResponse.transactions"
       :key="transactionsList.date"
       class="mb-4"
       :with-header="true">
        <template #header>{{ useFormatDate(transactionsList.date) }}</template>
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
       v-if="financeStore.transactionsResponse?.transactions?.length === 0"
       class="w-full text-lg">
        <Card class="flex items-center justify-center h-[120px]"
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
       :is-open="isDeleteTransactionModalOpen"
       @delete="handleDeleteTransaction"
       @update:is-open="isDeleteTransactionModalOpen = $event"
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

<style>
</style>