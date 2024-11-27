<template>
  <div class="index-page">
    <div class="card-details-block">
      <Card class="mar-b-6">
        <BalanceDetails/>
      </Card>
      <Card>
        <TransactionsHistory
         :expenses="expenses"
         :is-loading="expensesIsLoading">
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
import Card from "~/components/Card/Card.vue";
import {useFinanceStore} from "~/stores/financeStore";
import {useCardsList} from "~/use/useCardList";

const financeStore = useFinanceStore();

const expenses = ref([]);
const expensesIsLoading = ref(true);

useHead({
  htmlAttrs: {
    lang: 'en'
  },
});

const transactionsHistoryOptions = ref([]);

const fetchExpenses = async (query = '') => {
  expensesIsLoading.value = true;
  await financeStore.fetchExpenses(query);
  expenses.value = financeStore.expenses;
  expensesIsLoading.value = false;
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
  await fetchExpenses();
  const {cardsList} = useCardsList([
     {value: null, label: 'All expenses'},
     {value: null, label: 'Cash'}
   ]
  );
  transactionsHistoryOptions.value = cardsList.value;
});

</script>

<style
 lang="scss"
 src="./styles.scss"></style>