<template>
  <div class="transactions-history w-full">
    <slot name="header"/>
    <Preloader
     v-if="isInitialLoading"
     height="250px"/>
    <div
     v-else
     class="transactions-block">
      <template v-if="transactionsList.length > 0">
        <Card
         v-for="transactionGroup in transactionsList"
         :key="transactionGroup.date"
         class="shadow-none mb-4 border-[1px] border-stone-200 dark:border-neutral-600"
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
         ref="infiniteScrollTrigger"
         class="h-1"
         aria-hidden="true"
        />
        <Preloader
         v-if="isLoadingMore"
         height="80px"/>
      </template>
      <template v-else>
        <p class="empty-message text-left text-md mt-5 whitespace-pre-wrap text-stone-300">{{ $t('components.transactionsHistory.emptyListText') }}</p>
      </template>
    </div>

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
import {onBeforeUnmount, onMounted, ref} from "vue";
import {emitter} from "~/classes/uiEventBus";
import {useFinanceStore} from "~/stores/finance";
import {useUIStore} from "~/stores/ui";
import {useFormatDate} from "~/use/useFormatDate";
import {useInfiniteScroll} from "~/use/useInfiniteScroll";

const DeleteTransactionModal = defineAsyncComponent(() => import('~/components/Modals/DeleteTransactionModal.vue'));

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
const pageSize = 5;
const transactionsList = ref<TransactionGroup[]>([]);
const currentPage = ref(1);
const hasNextPage = ref(false);
const isInitialLoading = ref(true);
const isLoadingMore = ref(false);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
const isDeleteTransactionModalOpen = ref(false);
const objectToDelete = ref({
  id: null,
});

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
}: {
  page?: number;
  append?: boolean;
} = {}) => {
  const response = await financeStore.fetchTransactions({}, page, pageSize) as TransactionsResponse | null;

  if (!response) {
    return;
  }

  currentPage.value = response.currentPage;
  hasNextPage.value = response.hasNextPage;
  transactionsList.value = append
    ? mergeTransactionGroups(transactionsList.value, response.transactions)
    : response.transactions;
};

const reloadLoadedTransactions = async () => {
  const pagesToRestore = currentPage.value;

  transactionsList.value = [];

  for (let page = 1; page <= pagesToRestore; page++) {
    await loadTransactions({
      page,
      append: page > 1,
    });

    if (!hasNextPage.value && currentPage.value === page) {
      break;
    }
  }
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
    });
  } finally {
    isLoadingMore.value = false;
  }
};

const handleDeleteTransactionOpenModal = async (transaction: object) => {
  isDeleteTransactionModalOpen.value = true;
  objectToDelete.value = {
    id: transaction._id ?? null,
  };
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

  try {
    await loadTransactions();
  } finally {
    isInitialLoading.value = false;
  }
});

onBeforeUnmount(() => {
  emitter.off('transactions:changed', handleTransactionsChanged);
});
</script>

<style>
</style>
