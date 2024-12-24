type TransactionType = 'expense' | 'income' | 'transfer';

export interface CreateTransactionPayload {
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  date?: string;
  category?: string;
  relatedAccountId?: string;
}

export interface UpdateTransactionPayload extends Partial<CreateTransactionPayload> {
  id: string;
}

export interface DeleteTransactionPayload {
  id: string;
}