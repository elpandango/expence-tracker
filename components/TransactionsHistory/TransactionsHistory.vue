<template>
  <div class="transactions-history">
    <slot name="header"></slot>
    <ul
     class="items-list"
     v-if="!isLoading">
      <Expense
       v-for="expense in expenses"
       :key="expense._id"
       tag="li"
       :data="expense"/>
    </ul>

    <Preloader
     v-else
     height="250px"/>
  </div>
</template>

<script
 setup
 lang="ts">
const props = defineProps({
  expenses: {
    type: Array
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

</script>

<style
 lang="scss"
 src="./styles.scss">
</style>