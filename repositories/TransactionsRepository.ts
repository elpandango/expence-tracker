export default {
  async deleteTransaction(id: string, source: string, sourceCategory: string) {
    try {
      return await $fetch(`/api/transactions/${id}?source=${source}&sourceCategory=${sourceCategory}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Transaction delete failed';
      throw new Error(message);
    }
  },
  async updateTransaction(id: string, payload: any) {
    try {
      return await $fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        body: payload
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Transaction update failed';
      throw new Error(message);
    }
  },
};
