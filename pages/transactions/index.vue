<template>
  <div class="cards-page">
    <h1>Transactions</h1>

    <Card
     class="mar-b-8"
     v-for="expense in expenses"
     :key="expense._id">
      <Expense
       :data="expense"
      />
    </Card>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";
import Expense from "~/components/Expense/Expense.vue";

const expenses = ref([]);

onMounted(async () => {
  const response = await repositoryFactory.get('Expense').getExpenses();

  console.log('expenses: ', expenses);

  expenses.value = response?.expenses;
});
</script>

<style
 lang="scss">
</style>