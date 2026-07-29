export type TransactionCategory = {
  _id?: string | null;
  name?: string;
  color?: string;
  icon?: string;
};

export type TransactionAccountRef = {
  _id?: string | null;
  name?: string;
  currency?: string;
};

export type TransactionType = 'expense' | 'income' | 'transfer';

export type TransactionListItem = {
  _id?: string | null;
  type?: TransactionType;
  amount?: number;
  currency?: string;
  description?: string;
  date?: string | Date;
  accountId?: string | TransactionAccountRef | null;
  relatedAccountId?: string | TransactionAccountRef | null;
  category?: TransactionCategory | null;
};

export type TransactionGroup = {
  date: string;
  transactions: TransactionListItem[];
};

export type TransactionsResponse = {
  transactions: TransactionGroup[];
  currentPage: number;
  hasNextPage: boolean;
};
