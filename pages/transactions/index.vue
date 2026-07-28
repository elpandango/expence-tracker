<template>
  <div class="transactions-page flex flex-wrap w-full max-w-[960px] m-auto">
    <h1 class="w-full font-semibold text-3xl mb-4">{{ $t('components.transactionsPage.pageTitleText') }}</h1>
    <Card class="mb-6">
      <BalanceDetails/>
    </Card>

    <Accordion
     v-if="financeStore.accountsList && financeStore.accountsList.length > 0"
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
       v-for="transactionGroup in transactionsList"
       :key="transactionGroup.date"
       class="mb-4"
       :with-header="true">
        <template #header>{{ useFormatDate(transactionGroup.date) }}</template>
        <TransactionExtended
         v-for="dateTransaction in transactionGroup.transactions"
         :key="dateTransaction._id"
         :transaction="dateTransaction"
         :show-actions="true"
         @delete-clicked="handleDeleteTransactionOpenModal(dateTransaction)"
         @edit-clicked="handleEditTransactionOpenModal(dateTransaction)"
        />
      </Card>

      <div
       v-if="transactionsList.length === 0"
       class="w-full text-lg">
        <Card class="flex items-center justify-center h-[120px]"
        >{{ $t('components.transactionsPage.emptyListText') }}
        </Card>
      </div>

      <div
       v-if="transactionsList.length > 0"
       class="w-full">
        <div
         ref="infiniteScrollTrigger"
         class="h-1"
         aria-hidden="true"
        />

        <Preloader
         v-if="isLoadingMore"
         height="80px"/>
      </div>
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
import {ref, onBeforeUnmount, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {useSeoConfig} from "~/use/useSeoConfig";
import {useFinanceStore} from "~/stores/finance";
import {useUIStore} from "~/stores/ui";
import {useFormatDate} from "~/use/useFormatDate";
import {emitter} from "~/classes/uiEventBus";
import {useInfiniteScroll} from "~/use/useInfiniteScroll";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const DeleteTransactionModal = defineAsyncComponent(() => import('~/components/Modals/DeleteTransactionModal.vue'));
const BaseInput = defineAsyncComponent(() => import('~/components/Forms/Inputs/BaseInput.vue'));

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

type TransactionGroup = {
  date: string;
  transactions: any[];
};

type TransactionsResponse = {
  transactions: TransactionGroup[];
  currentPage: number;
  hasNextPage: boolean;
};

const financeStore = useFinanceStore();
const uiStore = useUIStore();
const currentPage = ref(1);
const pageSize = 5;
const transactionsList = ref<TransactionGroup[]>([]);
const hasNextPage = ref(false);
const isLoadingMore = ref(false);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
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

const getTransactionFilters = () => {
  return {
    type: filters.value?.type?.value ?? null,
    source: filters.value?.source?.value ?? null,
    startDate: filters.value?.startDate ?? null,
    endDate: filters.value?.endDate ?? null,
    minAmount: filters.value?.minAmount ?? null,
    maxAmount: filters.value?.maxAmount ?? null,
    description: filters.value?.description ?? null,
    accountId: sortBySelected.value.value ?? null,
  };
};

const mergeTransactionGroups = (existingGroups: TransactionGroup[], newGroups: TransactionGroup[]) => {
  const groupsByDate = new Map(
   existingGroups.map(group => [group.date, {...group, transactions: [...group.transactions]}])
  );

  for (const group of newGroups) {
    const existingGroup = groupsByDate.get(group.date);

    if (!existingGroup) {
      groupsByDate.set(group.date, {...group, transactions: [...group.transactions]});
      continue;
    }

    existingGroup.transactions.push(...group.transactions);
  }

  return Array.from(groupsByDate.values());
};

const loadTransactions = async ({
  page = 1,
  append = false,
  showLoader = true,
}: {
  page?: number;
  append?: boolean;
  showLoader?: boolean;
} = {}) => {
  const updatedFilters = getTransactionFilters();

  if (showLoader) {
    emitter.emit('ui:startLoading', 'default');
  }

  try {
    const response = await financeStore.fetchTransactions(updatedFilters, page, pageSize) as TransactionsResponse | null;

    if (!response) {
      return;
    }

    currentPage.value = response.currentPage;
    hasNextPage.value = response.hasNextPage;
    transactionsList.value = append
      ? mergeTransactionGroups(transactionsList.value, response.transactions)
      : response.transactions;
  } finally {
    if (showLoader) {
      emitter.emit('ui:stopLoading', 'default');
    }
  }
};

const reloadLoadedTransactions = async () => {
  const pagesToRestore = currentPage.value;

  transactionsList.value = [];

  for (let page = 1; page <= pagesToRestore; page++) {
    await loadTransactions({
      page,
      append: page > 1,
      showLoader: page === 1,
    });

    if (!hasNextPage.value && currentPage.value === page) {
      break;
    }
  }
};

const updateTransactions = async () => {
  await loadTransactions({
    page: 1,
    append: false,
    showLoader: true,
  });
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

const loadMoreTransactions = async () => {
  if (isLoadingMore.value || !hasNextPage.value) {
    return;
  }

  isLoadingMore.value = true;

  try {
    await loadTransactions({
      page: currentPage.value + 1,
      append: true,
      showLoader: false,
    });
  } finally {
    isLoadingMore.value = false;
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

const handleTransactionsChanged = async () => {
  await reloadLoadedTransactions();
};

useInfiniteScroll({
  target: infiniteScrollTrigger,
  canLoadMore: hasNextPage,
  isLoading: isLoadingMore,
  onLoadMore: loadMoreTransactions,
});

onMounted(async () => {
  emitter.on('transactions:changed', handleTransactionsChanged);

  if (route.query.description) {
    filters.value.description = route.query.description;
  }

  await loadTransactions({
    page: 1,
    append: false,
    showLoader: true,
  });

  transactions.value = financeStore.accountsList.map(account => ({
    value: account._id,
    accountId: account._id,
    label: `${account.name} (${account.currency})`
  }));

  transactions.value.unshift({
    value: null, label: 'All transactions'
  });
});

onBeforeUnmount(() => {
  emitter.off('transactions:changed', handleTransactionsChanged);
});
</script>

<style>
</style>
