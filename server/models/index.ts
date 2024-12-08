import mongoose from 'mongoose';

import './CardModel';
import './CardDepositModel';
import './CashDepositModel';
import './CashBalanceModel';
import './ExpenseModel';
import './CategoryModel';
import './UserModel';

if (!mongoose.models.Card) {
  mongoose.model('Card', require('./CardModel').CardSchema);
}