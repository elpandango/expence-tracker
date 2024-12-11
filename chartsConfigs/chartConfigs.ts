import {useTheme} from "~/use/useTheme";

const getChartColors = () => {
  const {isDark} = useTheme();
  return {
    backgroundColor: isDark.value ? 'rgb(30, 40, 65)' : '#f0f0f0',
    textColor: isDark.value ? '#E0E0E0' : '#0E0E0EFF',
  }
};

export const createBarChartConfig = (categories, data) => {
  const {backgroundColor, textColor} = getChartColors();

  return {
    chart: {
      type: 'column',
      backgroundColor,
    },
    title: {
      text: 'Expenses by Category',
      style: {
        color: textColor,
      },
    },
    xAxis: {
      categories,
      title: {
        text: 'Categories',
        style: {
          color: textColor,
        },
      },
      labels: {
        style: {
          color: textColor,
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Total Amount (€)',
        style: {
          color: textColor,
        },
      },
      labels: {
        style: {
          color: textColor,
        },
      },
    },
    tooltip: {
      pointFormat: 'Total: <b>{point.y:.2f} €</b>',
    },
    legend: {
      itemStyle: {
        color: textColor,
      },
      itemHoverStyle: {
        color: textColor,
      },
      itemHiddenStyle: {
        color: textColor,
      },
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
  };
};

export const createPieChartConfig = (data) => {
  const { backgroundColor, textColor } = getChartColors();

  return {
    chart: {
      type: 'pie',
      backgroundColor,
    },
    title: {
      text: 'Top 5 Expense Categories',
      style: {
        color: textColor,
      },
    },
    plotOptions: {
      pie: {
        innerSize: '0%',
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.y:.2f} €',
          style: {
            color: textColor,
          },
        },
      },
    },
    series: [{
      name: 'Expenses',
      colorByPoint: true,
      data,
    }],
    legend: {
      itemStyle: {
        color: textColor,
      },
      itemHoverStyle: {
        color: textColor,
      },
      itemHiddenStyle: {
        color: textColor,
      },
    },
    credits: {
      enabled: false,
    },
  };
};

export const createIncomeVsExpensesChartConfig = (incomeData, expenseData, title = 'Income vs Expenses') => {
  const { backgroundColor, textColor } = getChartColors();

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
      backgroundColor,
    },
    title: {
      text: title,
      style: {
        color: textColor,
      },
    },
    xAxis: {
      categories: uniqueDates,
      title: {
        text: 'Dates',
        style: {
          color: textColor,
        },
      },
      labels: {
        style: {
          color: textColor,
        },
      },
    },
    yAxis: {
      title: {
        text: 'Amount (€)',
        style: {
          color: textColor,
        },
      },
      labels: {
        style: {
          color: textColor,
        },
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
    legend: {
      itemStyle: {
        color: textColor,
      },
      itemHoverStyle: {
        color: textColor,
      },
      itemHiddenStyle: {
        color: textColor,
      },
    },
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
  const { backgroundColor, textColor } = getChartColors();

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
    chart: {
      type: 'line',
      backgroundColor,
    },
    title: {
      text: title,
      style: {
        color: textColor,
      },
    },
    xAxis: {
      categories: uniqueDates,
      title: {
        text: 'Dates',
        style: {
          color: textColor,
        },
      },
      labels: {
        style: {
          color: textColor,
        },
      },
    },
    yAxis: {
      title: {
        text: 'Amount (€)',
        style: {
          color: textColor,
        },
      },
      labels: {
        style: {
          color: textColor,
        },
      },
    },
    series: [
      {
        name: 'Cash',
        data: cashSeries,
        color: '#ffc107',
      },
      {
        name: 'Card',
        data: cardSeries,
        color: '#007bff',
      },
    ],
    legend: {
      itemStyle: {
        color: textColor,
      },
      itemHoverStyle: {
        color: textColor,
      },
      itemHiddenStyle: {
        color: textColor,
      },
    },
    tooltip: {
      shared: true,
      pointFormat: '{series.name}: <b>{point.y:.2f} €</b>',
    },
    credits: {
      enabled: false,
    },
  };
};