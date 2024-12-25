export const useGenerateTestData = () => {
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.categories) {
        const categoryMap = data.categories.reduce((map, category) => {
          map[category.name] = category._id;
          return map;
        }, {});
        return categoryMap;
      } else {
        throw new Error('No categories found');
      }
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      throw error;
    }
  };

  const createAccount = async (name, type, currency, initialBalance) => {
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        type,
        currency,
        initialBalance,
        cardNumber: type === 'card' ? '1234567812345678' : null,
      }),
    });
    const data = await response.json();
    if (!data.account) {
      throw new Error('Failed to create account');
    }
    return data.account._id;
  };

  const createTransaction = async (transaction) => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }
  };

  const generateTransactions = async (accountId, currency, categoryMap) => {
    const types = ['expense', 'income'];
    const categories = Object.keys(categoryMap);
    const descriptions = ['Groceries', 'Movie', 'Bus ticket', 'Electricity bill'];

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomDate = () => {
      const now = new Date();
      const randomDays = Math.floor(Math.random() * 180);
      now.setDate(now.getDate() - randomDays);
      return now.toISOString();
    };

    const transactions = Array.from({length: 100}).map(() => {
      const categoryName = getRandom(categories);
      return {
        accountId,
        type: getRandom(types),
        amount: Math.floor(Math.random() * 100) + 1,
        currency,
        description: getRandom(descriptions),
        date: getRandomDate(),
        category: categoryMap[categoryName],
      };
    });

    for (const transaction of transactions) {
      await createTransaction(transaction);
    }
  };

  const generateTestData = async () => {
    try {
      const categoryMap = await fetchCategories();
      const account1Id = await createAccount('Test Account EUR', 'card', 'EUR', 1000);
      const account2Id = await createAccount('Test Account USD', 'cash', 'USD', 500);

      await Promise.all([
        generateTransactions(account1Id, 'EUR', categoryMap),
        generateTransactions(account2Id, 'USD', categoryMap),
      ]);

      console.log('Test data generated successfully!');
    } catch (error) {
      console.error('Error generating test data:', error.message);
    }
  };

  return {generateTestData};
};
