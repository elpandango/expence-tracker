<template>
  <div class="cards-page">
    <h1>Transactions</h1>

    <Preloader
     height="50vh"
     v-if="uiStore.state.isLoading"/>
    <template v-else>
      <Card
       class="mar-b-8"
       v-for="expense in financeStore.expenses"
       :key="expense._id">
        <Expense
         :data="expense"
        />
      </Card>
    </template>
  </div>
</template>

<script
 setup
 lang="ts">
import {onMounted} from "vue";
import {useFinanceStore} from "~/stores/financeStore";
import {useUIStore} from "~/stores/ui";
import Expense from "~/components/Expense/Expense.vue";
import {emitter} from "~/classes/uiEventBus";

const financeStore = useFinanceStore();
const uiStore = useUIStore();

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  await financeStore.fetchExpensesIfNeeded();
  emitter.emit('ui:stopLoading', 'default');
});
</script>

<style
 lang="scss">
</style>