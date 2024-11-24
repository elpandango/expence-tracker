<template>
  <div class="transactions-history">
    <slot name="header"></slot>
    <ul class="items-list">
      <Expense
       v-for="expense in expenses"
       :key="expense._id"
       tag="li"
       :data="expense"/>
    </ul>
  </div>
</template>

<script
 setup
 lang="ts">
const props = defineProps({
  expenses: {
    type: Array
  },
});

</script>

<style
 lang="scss">
.transactions-history {
  .items-list {
    li {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>