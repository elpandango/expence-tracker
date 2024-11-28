import {defineStore} from 'pinia';
import {ref} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";

export const useFinanceStore = defineStore('finance', () => {
  const expenses = ref([]);
  const cash = ref({});
  const cardsList = ref([]);
  const loadingStates = ref<Record<string, boolean>>({
    expenses: false,
    cash: false,
    cards: false,
  });

  const setLoading = (key: string, state: boolean) => {
    if (key in loadingStates.value) {
      loadingStates.value[key] = state;
    } else {
      console.warn(`Unknown loading key: ${key}`);
    }
  };

  const fetchCards = async () => {
    setLoading('cards', true);
    const {cards} = await repositoryFactory.get('Card').getAllCards();
    cardsList.value = cards;
    setLoading('cards', false);
  };

  const fetchCash = async () => {
    setLoading('cash', true);
    const response = await repositoryFactory.get('Balance').getCashBalance();
    cash.value = response.cashBalance;
    setLoading('cash', false);
  };

  const fetchExpenses = async (query: string = '') => {
    const queryString = query ? '?' + query : '';
    setLoading('expenses', true);
    const response = await repositoryFactory.get('Expense').getExpenses(queryString);
    expenses.value = response.expenses;
    setLoading('expenses', false);
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

  return { expenses, cardsList, cash, addExpense, addFunds, fetchCards, fetchCash, fetchExpenses, loadingStates };
});