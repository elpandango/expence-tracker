export const createBarChartConfig = (categories, data) => ({
  chart: {
    type: 'column',
  },
  title: {
    text: 'Expenses by Category',
  },
  xAxis: {
    categories,
    title: {
      text: 'Categories',
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Total Amount (€)',
    },
  },
  tooltip: {
    pointFormat: 'Total: <b>{point.y:.2f} €</b>',
  },
  series: [
    {
      name: 'Expenses',
      data,
      color: '#FF6F61',
    },
  ],
  credits: {
    enabled: false,
  },
});

export const createPieChartConfig = (data) => ({
  chart: {
    type: 'pie',
  },
  title: {
    text: 'Top 5 Expense Categories',
  },
  plotOptions: {
    pie: {
      innerSize: '0%',
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.y:.2f} €',
        // connectorWidth: 0
      },
    },
  },
  series: [{
    name: 'Expenses',
    colorByPoint: true,
    data: data,
  }],
  credits: {
    enabled: false,
  },
});

export const createIncomeVsExpensesChartConfig = (incomeData, expenseData, title = 'Income vs Expenses') => {
  const uniqueDates = [...new Set([...incomeData.map(item => item.name), ...expenseData.map(item => item.name)])].sort();

  const incomeSeries = uniqueDates.map(date => {
    const dataPoint = incomeData.find(item => item.name === date);
    return dataPoint ? dataPoint.y : 0;
  });

  const expenseSeries = uniqueDates.map(date => {
    const dataPoint = expenseData.find(item => item.name === date);
    return dataPoint ? Math.abs(dataPoint.y) : 0;
  });

  return {
    chart: {
      type: 'line',
    },
    title: {
      text: title,
    },
    xAxis: {
      categories: uniqueDates,
      title: {
        text: 'Dates',
      },
    },
    yAxis: {
      title: {
        text: 'Amount (€)',
      },
    },
    series: [
      {
        name: 'Income',
        data: incomeSeries,
        color: '#28a745',
      },
      {
        name: 'Expenses',
        data: expenseSeries,
        color: '#dc3545',
      },
    ],
    tooltip: {
      shared: true,
      pointFormat: '{series.name}: <b>{point.y:.2f} €</b>',
    },
    credits: {
      enabled: false,
    },
  };
};

export const createCashVsCardsChartConfig = (cashData, cardData, title = 'Cash vs Card Expenses') => {
  const uniqueDates = [...new Set([...cashData.map(item => item.name), ...cardData.map(item => item.name)])].sort();

  const cashSeries = uniqueDates.map(date => {
    const dataPoint = cashData.find(item => item.name === date);
    return dataPoint ? dataPoint.y : 0;
  });

  const cardSeries = uniqueDates.map(date => {
    const dataPoint = cardData.find(item => item.name === date);
    return dataPoint ? Math.abs(dataPoint.y) : 0;
  });

  return {
    chart: { type: 'line' },
    title: { text: title },
    xAxis: { categories: uniqueDates, title: { text: 'Dates' } },
    yAxis: { title: { text: 'Amount (€)' } },
    series: [
      { name: 'Cash', data: cashSeries, color: '#ffc107' },
      { name: 'Card', data: cardSeries, color: '#007bff' },
    ],
    tooltip: { shared: true, pointFormat: '{series.name}: <b>{point.y:.2f} €</b>' },
    credits: { enabled: false },
  };
};

