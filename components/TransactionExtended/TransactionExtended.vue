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
         ref="actions"
         class="action-menu"
         @click="toggleActions">
          <span class="material-symbols-outlined">more_vert</span>
          <div
           v-if="isOpen"
           class="actions-list">
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
 lang="scss">
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  border-bottom: 1px solid var(--input-border-color);
  padding: 10px 0;

  @media only screen and (max-width: 640px) {
    flex-wrap: wrap;
  }

  &.show-actions {
    .right-side {
      padding-right: 20px;

      @media only screen and (max-width: 480px) {
        padding-right: 14px;
      }
    }
  }

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
  }

  .transaction-info {
    font-size: 18px;

    @media only screen and (max-width: 480px) {
      font-size: 16px;
    }
  }

  .content-block {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex: 1;
  }

  .transaction-description {
    max-width: 80%;
    padding-right: 12px;
  }

  .right-side {
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: flex-end;
  }

  .category {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
    flex-wrap: wrap;

    //@media only screen and (max-width: 480px) {
    //  max-width: 70%;
    //}
  }

  .category-wrap {
    display: flex;

  }

  .category-icon {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 4px;
  }

  .category-name {
    font-size: 14px;

    @media only screen and (max-width: 480px) {
      font-size: 11px;
      text-align: right;
    }
  }

  .card-number {
    margin-top: 4px;
    font-size: 12px;
    text-align: right;

    @media only screen and (max-width: 480px) {
      font-size: 11px;
      white-space: nowrap;
    }
  }

  .transaction-amount {
    font-size: 20px;
    text-align: right;
    margin-bottom: 6px;
    white-space: nowrap;

    @media only screen and (max-width: 480px) {
      font-size: 16px;
    }

    &.green {
      color: var(--green-100);
    }

    &.red {
      color: var(--red-100);
      &:before {
        content: '-';
      }
    }
  }

  .action-menu {
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;

    .actions-list {
      position: absolute;
      z-index: 10;
      right: 10px;
      bottom: 100%;
      background-color: var(--card-bg-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      box-shadow: var(--box-shadow);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 4px;

      .action-btn {
        padding: 6px 10px;
        font-size: 16px;
        width: 100%;
        border: none;
        outline: none;
        background-color: transparent;
        cursor: pointer;
        transition: all .3s;
        text-align: left;
        white-space: nowrap;
        color: var(--main-color);

        &:hover {
          background-color: var(--bg-color);
        }
      }
    }
  }
}
</style>