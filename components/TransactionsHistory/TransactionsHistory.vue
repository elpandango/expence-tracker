<template>
  <div class="transactions-history w-full">
    <slot name="header"/>
    <Preloader
     v-if="uiStore.state.isLoading || financeStore.loadingStates.transactions"
     height="250px"/>
    <div
     v-else
     class="transactions-block">
      <template v-if="financeStore.transactionsResponse?.transactions?.length > 0">
        <Card
         v-for="transactionsList in financeStore.transactionsResponse.transactions"
         :key="transactionsList.date"
         class="shadow-none mb-4 border-[1px] border-stone-200 dark:border-neutral-600"
         :with-header="true">
          <template #header>{{ useFormatDate(transactionsList.date) }}</template>
          <TransactionExtended
           v-for="dateTransaction in transactionsList.transactions"
           :key="dateTransaction._id"
           :transaction="dateTransaction"
          />
        </Card>
      </template>
      <template v-else>
        <p class="empty-message text-left text-md mt-5 whitespace-pre-wrap text-stone-300">{{ $t('components.transactionsHistory.emptyListText') }}</p>
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

<style>
</style>