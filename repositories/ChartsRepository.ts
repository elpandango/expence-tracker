export default {
  async getChartsData(query: string = '') {
    try {
      return await $fetch(`api/charts${query}`, {
        method: 'GET',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error?.message : 'Summary fetching failed';
      throw new Error(message);
    }
  },
};
