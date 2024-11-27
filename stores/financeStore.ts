import {defineStore} from 'pinia';
import {ref} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";

export const useFinanceStore = defineStore('finance', () => {
  const expenses = ref([]);
  const cash = ref({});
  const cardsList = ref([]);

  const fetchCards = async () => {
    const {cards} = await repositoryFactory.get('Card').getAllCards();
    cardsList.value = cards;
  };

  const fetchCash = async () => {
    const response = await repositoryFactory.get('Balance').getCashBalance();
    cash.value = response.cashBalance;
  };

  const fetchExpenses = async (query: string = '') => {

    console.log('query in fetchExpenses action: ', query);

    let queryString = query ? '?' + query : '';

    const response = await repositoryFactory.get('Expense').getExpenses(queryString);
    expenses.value = response.expenses;
  };

  const addExpense = async (payload: { cardId: string | null; description: string; amount: number; date: string; category: string }) => {
    const response = await repositoryFactory.get('Expense').createExpense(payload);

    await fetchCards();
    await fetchCash();
    await fetchExpenses();

    return response;
  };

  const addFunds = async (cardId: string, payload: { balance: number }) => {
    const response = await repositoryFactory.get('Balance').updateBalance(cardId, payload);

    await fetchCards();
    await fetchCash();

    return response;
  };

  return { expenses, cardsList, cash, addExpense, addFunds, fetchCards, fetchCash, fetchExpenses };
});