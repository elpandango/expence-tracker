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
         :class="[transaction.type === 'deposit' ? 'green' : 'red']">{{ transaction.amount.toFixed(2) }} $
        </div>
        <div class="category">
          <template v-if="transaction?.category?.icon">
      <span
       class="category-icon material-symbols-outlined"
       :style="{ backgroundColor: transaction?.category?.color }">{{ transaction.category.icon }}</span>
          </template>
          <template v-else-if="transaction?.type === 'deposit'">
      <span
       class="category-icon material-symbols-outlined"
       :style="{ backgroundColor: '#4CAF50' }">payments</span>
          </template>
          <div class="category-name">{{ categoryName }}</div>
          <div class="card-number" v-if="transaction.number">{{transaction.number}}</div>
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
            <button class="action-btn"
                    @click="handleEditTransaction">Edit Transaction</button>
            <button
             class="action-btn"
             @click="handleDeleteTransaction">Delete Transaction
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

const isOpen = ref(false);
const actions = ref(null);
const handleClickOutside = (event: any) => {
  if (actions.value && !actions.value.contains(event.target)) {
    isOpen.value = false;
  }
};

const categoryName = computed(() => {
  if (props.transaction?.type === 'deposit') {
    const type = props.transaction.source === 'card' ? '(Card)' : '(Cash)';
    return 'Deposit ' + type;
  } else {
    return props.transaction?.category?.name;
  }
});

const toggleActions = () => {
  isOpen.value = !isOpen.value;
};

const handleDeleteTransaction = () => {
  emit('delete-clicked');
};

const handleEditTransaction = () => {
  emit('edit-clicked');
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>