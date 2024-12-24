<template>
  <component
   :is="tag"
   class="transaction-item"
   :class="[showActions ? 'show-actions' : '']">

    <div class="content-block">
      <div class="transaction-description">
        <div
         v-if="transaction.description"
         class="transaction-info">
          {{ transaction.description }}
        </div>
      </div>

      <div class="right-side">
        <div
         class="transaction-amount"
         :class="[transaction.type === 'income' ? 'green' : 'red']">
          {{ formatCurrency(transaction.amount, transaction.currency) }}
        </div>
        <div class="category">
          <div class="category-wrap">
            <template v-if="transaction?.type !== 'income' && transaction?.category?.icon">
              <div
               class="category-icon material-symbols-outlined"
               :style="{ backgroundColor: transaction?.category?.color }">{{ transaction.category.icon }}
              </div>
            </template>
            <template v-else-if="transaction?.type === 'income'">
              <div
               class="category-icon material-symbols-outlined"
               :style="{ backgroundColor: '#4CAF50' }">payments
              </div>
            </template>
            <div class="category-name">{{ categoryName }}</div>
          </div>
          <div class="card-number">{{ transaction.accountId.name }}</div>
        </div>
        <div
         v-if="showActions"
         @click="toggleActions"
         ref="actions"
         class="action-menu">
          <span class="material-symbols-outlined">more_vert</span>
          <div
           class="actions-list"
           v-if="isOpen">
            <button
             class="action-btn"
             @click="$emit('edit-clicked')">
              {{ $t(`components.modalsContent.addEditTransactionModal.transactionEditText`) }}
            </button>
            <button
             class="action-btn"
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

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>