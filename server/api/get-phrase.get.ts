import {getRandomPhrase} from "~/server/controllers/phraseController/getRandomPhrase";

export default defineEventHandler(async (event) => {
    return await getRandomPhrase();
});