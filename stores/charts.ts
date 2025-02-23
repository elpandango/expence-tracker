import {defineStore} from 'pinia';
import {reactive} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";

export const useChartStore = defineStore('charts', () => {
  const chartDataByType = reactive({
    allTransactions: null,
    topCategories: null,
    allCategories: null,
    allCategoriesTable: null,
    cashAndCards: null,
  });

  const getChartsData = async (query: string) => {
    return await repositoryFactory.get('Charts').getChartsData(query);
  };

  return {
    chartDataByType,
    getChartsData,
  };
});
