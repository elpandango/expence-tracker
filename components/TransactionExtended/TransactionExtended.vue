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
        </div>
        <div
         v-if="showActions"
         class="action-menu">
          <span class="material-symbols-outlined">more_vert</span>
        </div>
      </div>

    </div>
  </component>
</template>

<script
 setup
 lang="ts">

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

const categoryName = computed(() => {
  if (props.transaction?.type === 'deposit') {
    const type = props.transaction.source === 'card' ? '(Card)' : '(Cash)';
    return 'Deposit ' + type;
  } else {
    return props.transaction?.category?.name;
  }
});
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>