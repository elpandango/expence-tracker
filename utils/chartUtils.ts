import {createBarChartConfig, createPieChartConfig, createIncomeVsExpensesChartConfig, createCashVsCardsChartConfig} from '~/chartsConfigs/chartConfigs.ts';

export const processChartData = (data, isAbsolute = false) => {
  if (!data) {
    return [];
  }
  return data.map(t => ({
    name: t.category,
    y: isAbsolute ? Math.abs(t.totalAmount) : t.totalAmount,
  }));
};

export const processChartDataByDate = (data) => {
  if (!data) {
    return [];
  }

  const groupedData = data.reduce((acc, transaction) => {
    const dateKey = new Date(transaction.date).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = 0;
    }
    acc[dateKey] += transaction.amount || transaction.totalAmount;
    return acc;
  }, {});

  return Object.entries(groupedData).map(([name, y]) => ({
    name,
    y,
  }));
};

export const generateChartConfigs = (chartStore) => {
  let categories;

  if (chartStore.chartDataByType?.categories) {
    categories = chartStore.chartDataByType.categories.map(t => t.category);
  }

  const incomeDataByDate = processChartDataByDate(chartStore.chartDataByType.totalIncomeAll);
  const expenseDataByDate = processChartDataByDate(chartStore.chartDataByType.totalExpensesAll);

  const incomeCashDataByDate = processChartDataByDate(chartStore.chartDataByType.totalCashExpenses);
  const incomeCardDataByDate = processChartDataByDate(chartStore.chartDataByType.totalCardExpenses);

  const barChartData = processChartData(chartStore.chartDataByType.categories, true);
  const top5ChartData = processChartData(chartStore.chartDataByType.top5, true);

  return {
    top5: createPieChartConfig(top5ChartData),
    categories: createBarChartConfig(categories, barChartData),
    expenses_vs_incomes: createIncomeVsExpensesChartConfig(incomeDataByDate, expenseDataByDate, 'Income vs Expenses'),
    total_expenses: createCashVsCardsChartConfig(incomeCashDataByDate, incomeCardDataByDate, 'Cash vs Card'),
  };
};

export const generateChartConfigForType = (chartStore, type) => {
  switch (type) {
    case 'expenses_vs_incomes': {
      const incomeDataByDate = processChartDataByDate(chartStore.chartDataByType.totalIncomeAll);
      const expenseDataByDate = processChartDataByDate(chartStore.chartDataByType.totalExpensesAll);
      return createIncomeVsExpensesChartConfig(incomeDataByDate, expenseDataByDate, 'Income vs Expenses');
    }
    case 'categories': {
      const categories = chartStore.chartDataByType.categories.map(t => t.category);
      const barChartData = processChartData(chartStore.chartDataByType.categories, true);
      return createBarChartConfig(categories, barChartData);
    }
    case 'top5': {
      const top5ChartData = processChartData(chartStore.chartDataByType.top5, true);
      return createPieChartConfig(top5ChartData);
    }
    case 'total_expenses': {
      const incomeCashDataByDate = processChartDataByDate(chartStore.chartDataByType.totalCashExpenses);
      const incomeCardDataByDate = processChartDataByDate(chartStore.chartDataByType.totalCardExpenses);
      return createCashVsCardsChartConfig(incomeCashDataByDate, incomeCardDataByDate, 'Cash vs Card Expenses');
    }
    default:
      return null;
  }
};