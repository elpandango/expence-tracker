import {defineStore} from 'pinia';
import {reactive} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";

export const useChartStore = defineStore('charts', () => {
  const chartDataByType = reactive({
    categories: null,
    top5: null,
    totalExpensesAll: null,
    totalIncomeAll: null,
    totalCashExpenses: null,
    totalCardExpenses: null,
  });

  const getChartsData = async (type: string, query: string) => {
    try {
      const response = await repositoryFactory.get('Charts').getChartsData(query);
      chartDataByType[type] = response.transactions;
    } catch (error) {
      console.log(error);
    }
  };

  const getAllChartsData = async () => {
    try {
      await Promise.all([
        getChartsData('categories', '?type=expense&groupBy=category'),
        getChartsData('totalIncomeAll', '?type=deposit'),
        getChartsData('totalExpensesAll', '?type=expense'),
        getChartsData('top5', '?type=expense&top=5&groupBy=category'),
        getChartsData('totalCashExpenses', '?type=expense&source=cash'),
        getChartsData('totalCardExpenses', '?type=expense&source=card'),
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    chartDataByType,
    getChartsData,
    getAllChartsData,
  };
});
