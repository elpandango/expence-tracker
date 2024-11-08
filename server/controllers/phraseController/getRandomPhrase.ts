import {CustomError} from "~/server/interfaces/error";
import {getAllPhrases} from "~/server/controllers/phraseController/getAllPhrases";

export const getRandomPhrase = async () => {
    try {
        const allPhrases = await getAllPhrases();
        const phrasesCount = allPhrases?.phrases?.length;
        const randomIndex = Math.floor(Math.random() * phrasesCount);
        const phrase = allPhrases?.phrases?.[randomIndex];
        return {
            status: 200,
            message: 'Phrase fetched.',
            phrase: phrase
        };
    } catch (err: any) {
        console.log('error: ', err);
        const error: CustomError = new Error('Internal server error.');
        error.statusCode = 500;
        return error;
    }
};