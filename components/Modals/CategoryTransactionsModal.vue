<template>
  <Modal
   v-model="modalValue"
   @update:model-value="closeModal">
    <template #header>
      <div class="pr-6">
        {{ categoryName }}
      </div>
    </template>
    <template #body>
      <div class="text-sm text-stone-500 mb-4">
        {{ formattedPeriod }}
      </div>

      <Preloader
       v-if="isInitialLoading"
       height="220px"/>

      <template v-else-if="transactionsList.length > 0">
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
          />
        </Card>

        <div class="w-full">
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

      <div
       v-else
       class="flex items-center justify-center min-h-[160px] text-center text-stone-500">
        No transactions found for this category.
      </div>
    </template>
    <template #footer>
      <BaseButton
       variant="transparent"
       size="big"
       @click="closeModal">
        Close
      </BaseButton>
    </template>
  </Modal>
</template>

<script
 setup
 lang="ts">
import {computed, ref, watch} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";
import {useInfiniteScroll} from "~/use/useInfiniteScroll";
import {useFormatDate} from "~/use/useFormatDate";
import Modal from './Modal.vue';
import BaseButton from "~/components/Buttons/BaseButton.vue";
import Card from "~/components/Card/Card.vue";

type TransactionGroup = {
  date: string;
  transactions: any[];
};

type TransactionsResponse = {
  transactions: TransactionGroup[];
  currentPage: number;
  hasNextPage: boolean;
};

const props = defineProps({
  isOpen: {type: Boolean, required: true},
  categoryId: {type: String, default: null},
  categoryName: {type: String, default: ''},
  startDate: {type: String, default: null},
  endDate: {type: String, default: null},
});

const emit = defineEmits(['close']);

const modalValue = ref(props.isOpen);
const currentPage = ref(1);
const pageSize = 5;
const transactionsList = ref<TransactionGroup[]>([]);
const hasNextPage = ref(false);
const isInitialLoading = ref(false);
const isLoadingMore = ref(false);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);

const formattedPeriod = computed(() => {
  if (!props.startDate || !props.endDate) return '';
  return `${useFormatDate(props.startDate)} - ${useFormatDate(props.endDate)}`;
});

const closeModal = () => {
  emit('close');
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

const buildQuery = (page: number) => {
  const queryParams = new URLSearchParams();
  queryParams.append('type', 'expense');
  queryParams.append('page', page.toString());
  queryParams.append('limit', pageSize.toString());

  if (props.categoryId) queryParams.append('categoryId', props.categoryId);
  if (props.startDate) queryParams.append('startDate', props.startDate);
  if (props.endDate) queryParams.append('endDate', props.endDate);

  return `?${queryParams.toString()}`;
};

const loadTransactions = async ({
  page = 1,
  append = false,
}: {
  page?: number;
  append?: boolean;
} = {}) => {
  const response = await repositoryFactory.get('Transactions').getAllTransactions(buildQuery(page)) as TransactionsResponse;

  currentPage.value = response.currentPage;
  hasNextPage.value = response.hasNextPage;
  transactionsList.value = append
    ? mergeTransactionGroups(transactionsList.value, response.transactions)
    : response.transactions;
};

const loadFirstPage = async () => {
  if (!props.categoryId || !modalValue.value) return;

  isInitialLoading.value = true;
  currentPage.value = 1;
  hasNextPage.value = false;
  transactionsList.value = [];

  try {
    await loadTransactions({page: 1, append: false});
  } finally {
    isInitialLoading.value = false;
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

useInfiniteScroll({
  target: infiniteScrollTrigger,
  canLoadMore: hasNextPage,
  isLoading: isLoadingMore,
  onLoadMore: loadMoreTransactions,
});

watch(() => props.isOpen, (newValue) => {
  modalValue.value = newValue;

  if (newValue) {
    void loadFirstPage();
    return;
  }

  transactionsList.value = [];
  currentPage.value = 1;
  hasNextPage.value = false;
}, {immediate: true});
</script>
