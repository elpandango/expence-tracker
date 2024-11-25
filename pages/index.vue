<template>
  <div class="index-page">
    <div class="card-details-block">
      <Card class="mar-b-6">
        <BalanceDetails/>
      </Card>
      <Card>
        <TransactionsHistory
         :expenses="expenses"
         :options="transactionsHistoryOptions">
          <template v-slot:header>
            <TitleWithDropdown
             placeholder="See All"
             :options="transactionsHistoryOptions"
             @option-selected="handleDropdownChanged">
              Transactions History
            </TitleWithDropdown>
          </template>
        </TransactionsHistory>
      </Card>
    </div>
    <div class="statistics-block">
      <Card>
        Transactions Statistics
      </Card>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {onMounted, ref} from "vue";
import repositoryFactory from "~/repositories/repositoryFactory";
import Card from "~/components/Card/Card.vue";

const expenses = ref([]);

useHead({
  htmlAttrs: {
    lang: 'en'
  },
});


const transactionsHistoryOptions = ref([]);

const fetchCards = async () => {
  const {cards} = await repositoryFactory.get('Card').getAllCards();
  const cardsArray = cards.map(card => {
    return {
      value: card._id,
      label: card.number,
    }
  });

  return [
    {value: null, label: 'All expenses'},
    {value: null, label: 'Cash'},
    ...cardsArray
  ];
};

const fetchExpenses = async (query = '') => {
  let queryString = query ? '?' + query : '';
  const response = await repositoryFactory.get('Expense').getExpenses(queryString);
  expenses.value = response?.expenses;
};

const handleDropdownChanged = async (option: any) => {
  let query = '';

  if (option.value) {
    query = 'cardId=' + option.value;
  } else if (option.label === 'All expenses') {
    query = '';
  } else {
    query = 'uncategorized=true';
  }

  await fetchExpenses(query);
};

onMounted(async () => {
  transactionsHistoryOptions.value = await fetchCards();
  await fetchExpenses();
});

</script>

<style
 lang="scss"
 src="./styles.scss"></style>