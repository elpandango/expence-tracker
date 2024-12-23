import {defineEventHandler, readBody, getCookie} from 'h3';
import {AccountModel} from "~/server/models/AccountModel";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  const { id } = event.context.params;
  if (!userId) {
    throw createError({statusCode: 401, message: 'Unauthorized'});
  }

  const { name, currency} = await readBody(event);

  if (!id) {
    throw createError({statusCode: 400, message: 'Account ID is required'});
  }

  const account = await AccountModel.findOne({_id: id, userId});
  if (!account) {
    throw createError({statusCode: 404, message: 'Account not found'});
  }

  if (name) account.name = name;
  if (currency) account.currency = currency;

  await account.save();

  return {
    status: 200,
    message: 'Account updated successfully',
    account,
  };
});
