<template>
  <component
   :is="tag"
   class="transaction-item">
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

    <div class="content-block">
      <div class="transaction-description">
        <div class="category-name">{{categoryName}}
        </div>
        <div v-if="isCardTransaction" class="transaction-info">
          Card number <strong>{{ transaction.number }}</strong> was replenished
        </div>
        <div v-if="!transaction?.number && transaction.description" class="transaction-info">
          {{transaction.description}}
        </div>
        <div class="transaction-date">{{ formattedDate }}</div>
      </div>
      <div class="transaction-amount"
           :class="[transaction.type === 'deposit' ? 'green' : 'red']">{{ transaction.amount }} $</div>
    </div>
  </component>
</template>

<script
 setup
 lang="ts">
import {useFormatDate} from "~/use/useFormatDate";

const props = defineProps({
  transaction: {
    type: Object
  },
  tag: {
    type: String,
    default: 'div'
  }
});

const formattedDate = useFormatDate(props.transaction?.date);
const isCardTransaction = computed(() => !!props.transaction?.number);
const categoryName = computed(() => {
  if (props.transaction?.type === 'deposit') {
    return 'Deposit';
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