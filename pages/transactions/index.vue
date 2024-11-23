<template>
  <div class="cards-page">
    <h1>Transactions</h1>

    <ul>
      <li v-for="expense in expenses">
        description: {{expense.description}}
        amount: {{expense.amount}}
      </li>
    </ul>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";

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