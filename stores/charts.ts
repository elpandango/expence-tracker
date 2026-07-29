import {defineStore} from 'pinia';
import {reactive} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";

export const useChartStore = defineStore('charts', () => {
  const chartDataByType = reactive({
    categoryTotals: null,
  });

  const getChartsData = async (query: string) => {
    return await repositoryFactory.get('Charts').getChartsData(query);
  };

  return {
    chartDataByType,
    getChartsData,
  };
});
