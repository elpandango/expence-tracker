export default {
  async getChartsData(query: string = '') {
    try {
      return await $fetch(`api/charts${query}`, {
        method: 'GET',
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Summary fetching failed';
      throw new Error(message);
    }
  },
};
