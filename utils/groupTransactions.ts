export const groupTransactions = (transactions, groupBy, top) => {
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const groupKey = transaction[groupBy] || 'No Group';
    if (!acc[groupKey]) {
      acc[groupKey] = {
        category: groupKey,
        totalAmount: 0,
      };
    }
    acc[groupKey].totalAmount += parseFloat(transaction.amount);
    return acc;
  }, {});

  let groupedArray = Object.values(groupedTransactions);

  if (top) {
    groupedArray = groupedArray
      .sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount))
      .slice(0, parseInt(top, 10));
  }

  return groupedArray;
};
