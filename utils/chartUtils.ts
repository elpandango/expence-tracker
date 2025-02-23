export const generateChartConfigForType = (chartData, type) => {
  switch (type) {
    case 'expenses_vs_incomes':
      return {
        chart: { type: 'line' },
        title: { text: 'Expenses vs Incomes' },
        xAxis: {
          type: 'datetime',
          title: { text: 'Date' },
          labels: {
            formatter: function() {
              const date = new Date(this.value);
              const day = date.getDate();
              const month = date.getMonth() + 1;
              const year = date.getFullYear();
              return `${month}/${day}/${year}`;
            }
          }
        },
        series: [
          { name: 'Incomes', data: chartData.allTransactions.income.map(({ date, amount }) => [new Date(date).getTime(), amount]) },
          { name: 'Expenses', data: chartData.allTransactions.expense.map(({ date, amount }) => [new Date(date).getTime(), amount]) },
        ],
      };
    case 'top5':
      return {
        chart: { type: 'pie' },
        title: { text: 'Top 5 Categories' },
        series: [
          {
            name: 'Categories',
            data: chartData.topCategories.map(({ category, amount }) => ({
              name: category,
              y: amount,
            })),
          },
        ],
      };
    case 'categories':
      return {
        chart: { type: 'column' },
        title: { text: 'All Categories' },
        series: [
          {
            name: 'Categories',
            data: chartData.allCategories.map(({ category, amount }) => ({
              name: category,
              y: amount,
            })),
          },
        ],
      };
    case 'categoriesTable':
      return chartData.allCategories;
    case 'total_expenses':
      return {
        chart: { type: 'line' },
        title: { text: 'Total Expenses' },
        xAxis: {
          type: 'datetime',
          title: { text: 'Date' },
          labels: {
            formatter: function() {
              const date = new Date(this.value);
              const day = date.getDate();
              const month = date.getMonth() + 1;
              const year = date.getFullYear();
              return `${month}/${day}/${year}`;
            }
          }
        },
        series: [
          { name: 'Cash', data: chartData.cashAndCards.cash.map(({ date, amount }) => [new Date(date).getTime(), amount]) },
          { name: 'Card', data: chartData.cashAndCards.card.map(({ date, amount }) => [new Date(date).getTime(), amount]) },
        ],
      };

    default:
      return null;
  }
};

