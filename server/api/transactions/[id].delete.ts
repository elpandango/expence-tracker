import {CardModel} from "~/server/models/CardModel";
import {CashDepositModel} from "~/server/models/CashDepositModel";
import {CardDepositModel} from "~/server/models/CardDepositModel";
import {CashBalanceModel} from "~/server/models/CashBalanceModel";
import {ExpenseModel} from "~/server/models/ExpenseModel";

export default defineEventHandler(async (event) => {
  const {id} = event.context.params;
  const {source, sourceCategory} = getQuery(event);
  if (!id || !source) {
    throw createError({statusCode: 400, message: 'Missing required parameters'});
  }

  let deletedTransaction;

  switch (source) {
    case 'cash':
      switch (sourceCategory) {
        case 'cash deposit':
          deletedTransaction = await CashDepositModel.findByIdAndDelete(id);
          if (!deletedTransaction) {
            throw createError({statusCode: 404, message: 'Transaction not found'});
          }

          await CashBalanceModel.findOneAndUpdate(
            {userId: deletedTransaction.userId, currency: deletedTransaction.currency || 'USD'},
            {$inc: {amount: -deletedTransaction.amount}}
          );
          break;

        case 'expense':
          deletedTransaction = await ExpenseModel.findByIdAndDelete(id);
          if (!deletedTransaction) {
            throw createError({statusCode: 404, message: 'Transaction not found'});
          }

          await CashBalanceModel.findOneAndUpdate(
            {userId: deletedTransaction.userId, currency: deletedTransaction.currency || 'USD'},
            {$inc: {amount: Math.abs(deletedTransaction.amount)}}
          );
          break;

        default:
          throw createError({statusCode: 400, message: 'Invalid sourceCategory for cash'});
      }

      break;

    case 'card':
      switch (sourceCategory) {
        case 'card deposit':
          deletedTransaction = await CardDepositModel.findByIdAndDelete(id);
          if (!deletedTransaction) {
            throw createError({statusCode: 404, message: 'Transaction not found'});
          }
          await CardModel.findByIdAndUpdate(deletedTransaction.cardId, {
            $inc: {balance: -deletedTransaction.amount},
          });
          break;

        case 'expense':
          deletedTransaction = await ExpenseModel.findByIdAndDelete(id);
          if (!deletedTransaction) {
            throw createError({statusCode: 404, message: 'Transaction not found'});
          }
          await CardModel.findByIdAndUpdate(deletedTransaction.cardId, {
            $inc: {balance: Math.abs(deletedTransaction.amount)},
          });
          break;

        default:
          throw createError({statusCode: 400, message: 'Invalid sourceCategory for card'});
      }
      break;

    default:
      throw createError({statusCode: 400, message: 'Invalid transaction source'});
  }

  if (!deletedTransaction) {
    throw createError({statusCode: 404, message: 'Transaction not found'});
  }

  return {
    status: 200,
    message: 'Transaction deleted successfully',
  };
});