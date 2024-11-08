import {PhraseModel} from "~/server/models/phraseModel";
import {CustomError} from "~/server/interfaces/error";

export const getAllPhrases = async () => {
  try {
    const phrases = await PhraseModel.find();
    return {
      status: 200,
      phrases: phrases,
    }
  } catch (err) {
    console.log('error: ', err);
    const error: CustomError = new Error('Internal server error.');
    error.statusCode = 500;
    return error;
  }
};