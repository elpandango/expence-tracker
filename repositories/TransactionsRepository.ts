import type {
  CreateTransactionPayload,
  UpdateTransactionPayload,
  DeleteTransactionPayload
} from "~/server/interfaces/transactionPayload";

export default {
  async deleteTransaction(id: DeleteTransactionPayload) {
    try {
      return await $fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Transaction delete failed';
      throw new Error(message);
    }
  },

  async addTransaction(payload: CreateTransactionPayload) {
    try {
      return await $fetch(`/api/transactions`, {
        method: 'POST',
        body: payload,
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Transaction creation failed';
      throw new Error(message);
    }
  },

  async updateTransaction(payload: UpdateTransactionPayload) {
    const { id, ...data } = payload;
    try {
      return await $fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Transaction update failed';
      throw new Error(message);
    }
  },

  async getAllTransactions(query: string = '') {
    const url = `/api/transactions${query}`;
    try {
      return await $fetch(url, {
        method: 'GET',
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Transactions fetching failed';
      throw new Error(message);
    }
  }
};
