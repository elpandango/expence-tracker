<template>
  <div class="transactions-history">
    <slot name="header"></slot>
    <ul
     class="items-list"
     v-if="!financeStore.loadingStates.expenses">
      <Expense
       v-for="expense in financeStore.expenses"
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
import {useFinanceStore} from "~/stores/financeStore";
const financeStore = useFinanceStore();
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>