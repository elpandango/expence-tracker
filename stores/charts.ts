import {defineStore} from 'pinia';
import {reactive} from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";

const categories = [
  'Food', 'Transport', 'Home', 'Health', 'Family', 'Fastfood', 'Bar', 'Car',
  'Fuel', 'Travel Transport', 'Shopping', 'Clothing', 'Footwear', 'Technology',
  'Entertainment', 'Rental Income', 'Energy Bill', 'Water Bill', 'Waste Bill',
  'Kids', 'Education', 'Pets', 'Pet Food', 'Gifts', 'Taxes', 'Cigarettes', 'Other (Expenses)'
];

function getRandomAmount() {
  return (Math.random() * 500 + 1).toFixed(2);
}

function generateFakeData(numEntries = 100) {
  const data = [];
  for (let i = 0; i < numEntries; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const amount = getRandomAmount();
    const date = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));

    data.push({
      category,
      totalAmount: parseFloat(amount),
      date,
    });
  }
  return data;
}


export const useChartStore = defineStore('charts', () => {
  const chartDataByType = reactive({
    categories: generateFakeData(50),
    top5: generateFakeData(5),
    totalIncomeAll: generateFakeData(10),
    totalExpensesAll: generateFakeData(10),
    totalCashExpenses: generateFakeData(10),
    totalCardExpenses: generateFakeData(10),
    // categories: null,
    // top5: null,
    // totalExpensesAll: null,
    // totalIncomeAll: null,
    // totalCashExpenses: null,
    // totalCardExpenses: null,
  });

  const getChartsData = async (type: string, query: string) => {
    try {
      // const response = await repositoryFactory.get('Charts').getChartsData(query);
      // chartDataByType[type] = response.transactions;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    chartDataByType,
    getChartsData,
  };
});
