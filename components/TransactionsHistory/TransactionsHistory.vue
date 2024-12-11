<template>
  <div class="transactions-history">
    <slot name="header"></slot>
    <Preloader
     v-if="uiStore.state.isLoading || financeStore.loadingStates.transactions"
     height="250px"/>
    <div
     v-else
     class="transactions-block">
      <template v-if="financeStore.transactionsResponse?.transactions?.length > 0">
        <ul class="items-list">
          <Transaction
           v-for="expense in financeStore.transactionsResponse.transactions"
           :key="expense._id"
           tag="li"
           :transaction="expense"
          />
        </ul>
      </template>
      <template v-else>
        <p class="empty-message">{{ $t('components.transactionsHistory.emptyListText') }}</p>
      </template>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {useFinanceStore} from "~/stores/finance";
import {useUIStore} from "~/stores/ui";

const financeStore = useFinanceStore();
const uiStore = useUIStore();
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>