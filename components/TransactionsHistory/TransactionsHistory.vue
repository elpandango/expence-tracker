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
        <Card
         class="mar-b-4"
         v-for="transactionsList in financeStore.transactionsResponse.transactions"
         :key="transactionsList.date"
         :with-header="true">
          <template v-slot:header>{{ useFormatDate(transactionsList.date) }}</template>
          <TransactionExtended
           v-for="dateTransaction in transactionsList.transactions"
           :key="dateTransaction._id"
           :transaction="dateTransaction"
           :show-actions="true"
          />
        </Card>
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
import {useFormatDate} from "~/use/useFormatDate";

const financeStore = useFinanceStore();
const uiStore = useUIStore();
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>