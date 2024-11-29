import {defineStore} from 'pinia';
import {ref} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";
import {emitter} from "~/classes/uiEventBus";

const errorMessages = {
  createCard: 'Card creation failed. Please try again.',
  updateCard: 'Card update failed. Please check the data.',
  deleteCard: 'Card deletion failed. Could not find the card.',
  default: 'Something went wrong during the process.',
};

export const useFinanceStore = defineStore('finance', () => {
  const expenses = ref([]);
  const cash = ref({});
  const cardsList = ref([]);
  const loadingStates = ref<Record<string, boolean>>({
    expenses: false,
    cash: false,
    cards: false,
  });

  const handleCardOperation = async (
    operation: () => Promise<void>,
    successMessage: string,
    errorMessageKey: keyof typeof errorMessages
  ) => {
    emitter.emit('ui:startLoading', 'default');
    try {
      await operation();
      await fetchCards();
      emitter.emit('ui:showToast', {
        message: successMessage,
        type: 'success',
      });
    } catch (e) {
      const errorMessage = errorMessages[errorMessageKey] || errorMessages.default;
      emitter.emit('ui:stopLoading', 'default');
      emitter.emit('ui:showToast', {
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const isEmpty = (data: any) => {
    if (Array.isArray(data)) {
      return data.length === 0;
    } else if (typeof data === 'object' && data !== null) {
      return Object.keys(data).length === 0;
    }
    return false;
  };

  const setLoading = (key: string, state: boolean) => {
    if (key in loadingStates.value) {
      loadingStates.value[key] = state;
    } else {
      console.warn(`Unknown loading key: ${key}`);
    }
  };

  const fetchCards = async () => {
    const {cards} = await repositoryFactory.get('Card').getAllCards();
    cardsList.value = cards;
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

  const addExpense = async (payload: {
    cardId: string | null;
    description: string;
    amount: number;
    date: string;
    category: string
  }) => {
    emitter.emit('ui:startLoading', 'default');

    try {
      await repositoryFactory.get('Expense').createExpense(payload);
      await Promise.all([await fetchCards(), await fetchCash(), await fetchExpenses()]);
      emitter.emit('ui:showToast', {
        message: 'Expense added successfully.',
        type: 'success',
      });
    } catch (err) {
      emitter.emit('ui:showToast', {
        message: `Expense addition failed. ${err?.message}`,
        type: 'error',
      });
    } finally {
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const addFunds = async (cardId: string, payload: { balance: number }) => {
    emitter.emit('ui:startLoading', 'default');

    try {
      await repositoryFactory.get('Balance').updateBalance(cardId, payload);
      await Promise.all([await fetchCards(), await fetchCash()]);
      emitter.emit('ui:showToast', {
        message: 'Funds added successfully.',
        type: 'success',
      });
    } catch (e) {
      emitter.emit('ui:showToast', {
        message: 'Funds addition failed.',
        type: 'error',
      });
    } finally {
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const addCard = async (payload: { name: string; number: string; balance: number; currency: string }) => {
    await handleCardOperation(
      () => repositoryFactory.get('Card').createCard(payload),
      'New card added successfully.',
      'createCard'
    );
  };

  const updateCard = async (cardId: string, payload: {
    name: string;
    number: string;
    balance: number;
    currency: string
  }) => {
    await handleCardOperation(
      () => repositoryFactory.get('Card').updateCard(cardId, payload),
      'Card updated successfully.',
      'updateCard'
    );
  };

  const deleteCard = async (cardId: string) => {
    await handleCardOperation(
      () => repositoryFactory.get('Card').deleteCard(cardId),
      'Card deleted successfully.',
      'deleteCard'
    );
  };

  const fetchDataIfNeeded = async (data: any, fetchFunction: any) => {
    if (isEmpty(data)) {
      await fetchFunction();
    }
  };

  const fetchExpensesIfNeeded = async () => {
    await fetchDataIfNeeded(expenses.value, fetchExpenses);
  };

  const fetchCardsIfNeeded = async () => {
    await fetchDataIfNeeded(cardsList.value, fetchCards);
  };

  const fetchCashIfNeeded = async () => {
    await fetchDataIfNeeded(cash.value, fetchCash);
  };

  return {
    expenses,
    cardsList,
    cash,
    addExpense,
    addFunds,
    addCard,
    updateCard,
    deleteCard,
    fetchCards,
    fetchCash,
    fetchExpenses,
    fetchExpensesIfNeeded,
    fetchCardsIfNeeded,
    fetchCashIfNeeded,
    loadingStates
  };
});