import {defineStore} from 'pinia';
import {ref} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";
import {emitter} from "~/classes/uiEventBus";
import type {
  CreateTransactionPayload,
  UpdateTransactionPayload,
  DeleteTransactionPayload
} from "~/server/interfaces/transactionPayload";

import type {
  CreateAccountPayload,
  UpdateAccountPayload,
  DeleteAccountPayload
} from "~/server/interfaces/accountsPayload";

export const useFinanceStore = defineStore('finance', () => {
  const transactionsResponse = ref([]);
  const editingTransaction = ref({});
  const editingAccount = ref({});
  const accountsList = ref([]);

  const loadingStates = ref<Record<string, boolean>>({
    transactions: false,
  });

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

  const fetchAccounts = async () => {
    const {accounts} = await repositoryFactory.get('Accounts').getAllAccounts();
    accountsList.value = accounts;
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
      const response = await repositoryFactory.get('Transactions').getAllTransactions(queryString);

      transactionsResponse.value = response;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const addAccount = async (payload: CreateAccountPayload) => {
    emitter.emit('ui:startLoading', 'default');

    try {
      await repositoryFactory.get('Accounts').createAccount(payload);
      await fetchAccounts();
    } catch (e) {
      emitter.emit('ui:showToast', {
        message: 'Account addition failed.',
        type: 'error',
      });
    } finally {
      emitter.emit('ui:showToast', {
        message: 'Account added successfully.',
        type: 'success',
      });
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const updateAccount = async (payload: UpdateAccountPayload) => {
    emitter.emit('ui:startLoading', 'default');

    try {
      await repositoryFactory.get('Accounts').updateAccount(payload);
      await Promise.all([await fetchAccounts(), await fetchTransactions()]);
    } catch (err) {
      emitter.emit('ui:showToast', {
        message: `Account update failed. ${err?.message}`,
        type: 'error',
      });
    } finally {
      emitter.emit('ui:showToast', {
        message: 'Account updated successfully.',
        type: 'success',
      });
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const deleteAccount = async (accountId: DeleteAccountPayload) => {
    emitter.emit('ui:startLoading', 'default');

    try {
      await repositoryFactory.get('Accounts').deleteAccount(accountId);
      await Promise.all([await fetchAccounts(), await fetchTransactions()]);
    } catch (err) {
      emitter.emit('ui:showToast', {
        message: `Account deletion failed. ${err?.message}`,
        type: 'error',
      });
    } finally {
      emitter.emit('ui:showToast', {
        message: 'Account deleted successfully.',
        type: 'success',
      });
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const addTransaction = async (payload: CreateTransactionPayload) => {
    emitter.emit('ui:startLoading', 'default');

    try {
      await repositoryFactory.get('Transactions').addTransaction(payload);
      await Promise.all([await fetchAccounts(), await fetchTransactions()]);
    } catch (err) {
      emitter.emit('ui:showToast', {
        message: `Transaction creation failed. ${err?.message}`,
        type: 'error',
      });
    } finally {
      emitter.emit('ui:showToast', {
        message: 'Transaction created successfully.',
        type: 'success',
      });
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const deleteTransaction = async (payload: DeleteTransactionPayload) => {
    emitter.emit('ui:startLoading', 'default');

    try {
      await repositoryFactory.get('Transactions').deleteTransaction(payload);
      await Promise.all([await fetchAccounts(), await fetchTransactions()]);
    } catch (err) {
      emitter.emit('ui:showToast', {
        message: `Transaction deletion failed. ${err?.message}`,
        type: 'error',
      });
    } finally {
      emitter.emit('ui:showToast', {
        message: 'Transaction deleted successfully.',
        type: 'success',
      });
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const updateTransaction = async (payload: UpdateTransactionPayload) => {
    emitter.emit('ui:startLoading', 'default');

    try {
      await repositoryFactory.get('Transactions').updateTransaction(payload);
      await Promise.all([await fetchAccounts(), await fetchTransactions()]);
    } catch (err) {
      emitter.emit('ui:showToast', {
        message: `Transaction update failed. ${err?.message}`,
        type: 'error',
      });
    } finally {
      emitter.emit('ui:showToast', {
        message: 'Transaction updated successfully.',
        type: 'success',
      });
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const fetchAccountsIfNeeded = async () => {
    if (isEmpty(accountsList.value)) {
      await fetchAccounts()
    }
  };

  const resetEditingAccount = () => {
    editingAccount.value = {};
  };

  const resetEditingTransaction = () => {
    editingTransaction.value = {};
  };

  return {
    accountsList,
    transactionsResponse,
    editingTransaction,
    editingAccount,
    loadingStates,
    setLoading,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchAccounts,
    fetchTransactions,
    fetchAccountsIfNeeded,
    resetEditingTransaction,
    resetEditingAccount,
  };
});