<template>
  <component
   :is="tag"
   class="transaction-item flex justify-between items-start w-full py-2.5 border-b-[1px] border-stone-200 dark:border-neutral-600 sm:flex-wrap group first:pt-0 last:border-b-0"
   :class="[showActions ? 'show-actions' : '']">

    <div class="content-block flex items-start justify-between flex-1">
      <div class="transaction-description max-w-[80%] pr-3">
        <div
         v-if="transaction.description"
         class="transaction-info text-lg max-sm:text-md">
          {{ transaction.description }}
        </div>
      </div>

      <div class="right-side flex flex-col items-end relative group-[.show-actions]:pr-5 max-sm:group-[.show-actions]:pr-3.5">
        <div
         class="transaction-amount text-md sm:text-xl text-right whitespace-nowrap mb-1.5 "
         :class="[transaction.type === 'income' ? 'text-green-600' : 'text-red-600']">
          {{transaction.type === 'income' ? '' : '-'}}{{ formatCurrency(transaction.amount, transaction.currency) }}
        </div>
        <div class="category flex flex-col justify-end items-end flex-wrap">
          <div class="flex">
            <template v-if="transaction?.type !== 'income' && transaction?.category?.icon">
              <div
               class="category-icon material-symbols-outlined flex items-center justify-center w-5 h-5 text-sm mr-1 rounded-md"
               :style="{ backgroundColor: transaction?.category?.color }">{{ transaction.category.icon }}
              </div>
            </template>
            <template v-else-if="transaction?.type === 'income'">
              <div
               class="category-icon material-symbols-outlined flex items-center justify-center w-5 h-5 text-sm mr-1 rounded-md"
               :style="{ backgroundColor: '#4CAF50' }">payments
              </div>
            </template>
            <div class="category-name text-xs text-right sm:text-sm">{{ categoryName }}</div>
          </div>
          <div class="card-number mt-1 whitespace-nowrap text-right text-xs">{{ transaction.accountId.name }}</div>
        </div>
        <div
         v-if="showActions"
         ref="actions"
         class="action-menu absolute right-[-15px] top-1/2 transform -translate-y-1/2 cursor-pointer"
         @click="toggleActions">
          <span class="material-symbols-outlined">more_vert</span>
          <div
           v-if="isOpen"
           class="actions-list flex flex-col items-start rounded-md absolute z-10 right-[10px] bottom-full bg-card-bg dark:border-[1px] border-stone-200 dark:border-neutral-600 shadow-xl p-1">
            <button
             class="action-btn py-1.5 px-2.5 w-full cursor-pointer text-left whitespace-nowrap transition-all duration-300 hover:bg-bg"
             @click="$emit('edit-clicked')">
              {{ $t(`components.modalsContent.addEditTransactionModal.transactionEditText`) }}
            </button>
            <button
             class="action-btn py-1.5 px-2.5 w-full cursor-pointer text-left whitespace-nowrap transition-all duration-300 hover:bg-bg"
             @click="$emit('delete-clicked')">
              {{ $t(`components.modalsContent.addEditTransactionModal.transactionDeleteText`) }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </component>
</template>

<script
 setup
 lang="ts">
import {ref} from "vue";
import {useCurrencyFormatter} from "~/use/useCurrencyFormatter";

const props = defineProps({
  transaction: {
    type: Object
  },
  tag: {
    type: String,
    default: 'div'
  },
  showActions: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['delete-clicked', 'edit-clicked']);

const {formatCurrency} = useCurrencyFormatter();
const isOpen = ref(false);
const actions = ref(null);
const handleClickOutside = (event: any) => {
  if (actions.value && !actions.value.contains(event.target)) {
    isOpen.value = false;
  }
};

const categoryName = computed(() => {
  if (props.transaction?.type === 'income') {
    return 'Deposit';
  } else {
    return props.transaction?.category?.name;
  }
});

const toggleActions = () => {
  isOpen.value = !isOpen.value;
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style>
</style>