export default {
  async getCashBalance() {
    try {
      return await $fetch('/api/cash/balance', {
        method: 'GET',
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Balance fetching failed';
      throw new Error(message);
    }
  },
  async updateBalance(cardId: string, payload: { balance: number }) {
    const url = cardId ? `/api/card/balance/${cardId}` : `/api/cash/balance`;

    try {
      return await $fetch(url, {
        method: 'PATCH',
        body: payload,
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Balance update failed';
      throw new Error(message);
    }
  },
};
