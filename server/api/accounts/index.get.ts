import { defineEventHandler, getCookie  } from "h3";
import { AccountModel } from "~/server/models/AccountModel";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, "userId");
  if (!userId) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  try {
    const accounts = await AccountModel.find({ userId });

    return {
      status: 200,
      accounts,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to fetch accounts",
      data: error
    });
  }
});
