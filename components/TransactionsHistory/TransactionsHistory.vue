<template>
  <div class="transactions-history">
    <slot name="header"></slot>

    <Preloader
     v-if="uiStore.state.isLoading || financeStore.loadingStates.expenses"
     height="250px"/>
    <div
     v-else
     class="transactions-block">
      <ul class="items-list">
        <Expense
         v-for="expense in financeStore.expenses"
         :key="expense._id"
         tag="li"
         :data="expense"/>
      </ul>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {useFinanceStore} from "~/stores/financeStore";
import {useUIStore} from "~/stores/ui";

const financeStore = useFinanceStore();
const uiStore = useUIStore();
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>