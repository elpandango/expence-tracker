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
  const cash = ref([]);
  const cardsList = ref([]);
  const transactionsResponse = ref([]);

  const loadingStates = ref<Record<string, boolean>>({
    transactions: false,
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
    } finally {
      emitter.emit('ui:stopLoading', 'default');
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
    const {deposits} = await repositoryFactory.get('Balance').getCashBalance();
    cash.value = deposits;
    setLoading('cash', false);
  };

  const fetchTransactions = async (filters: Record<string, any> = {}, page: number = 1, limit: number = 10) => {
    try {
      const queryParams = new URLSearchParams();
      for (const key in filters) {
        if (filters[key] !== null && filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      }
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await repositoryFactory.get('Balance').getAllTransactions(queryString);

      transactionsResponse.value = response;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchFilteredTransactions = async (filters: Record<string, any>, page: number = 1) => {
    const transformedFilters = {
      type: filters.type || null,
      source: filters.source || null,
      cardId: filters.cardId || null,
      startDate: filters.startDate ? new Date(filters.startDate).toISOString() : null,
      endDate: filters.endDate ? new Date(filters.endDate).toISOString() : null,
      minAmount: filters.minAmount || null,
      maxAmount: filters.maxAmount || null,
      description: filters.description || null,
      page: filters.value || 1,
      limit: 10,
    };

    await fetchTransactions(transformedFilters, page);
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
      await Promise.all([await fetchCards(), await fetchCash(), await fetchTransactions()]);
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
      await Promise.all([await fetchCards(), await fetchCash(), await fetchTransactions()]);
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
    transactionsResponse,
    setLoading,
    addExpense,
    addFunds,
    addCard,
    updateCard,
    deleteCard,
    fetchCards,
    fetchCash,
    fetchTransactions,
    fetchCardsIfNeeded,
    fetchCashIfNeeded,
    fetchFilteredTransactions,
    loadingStates
  };
});