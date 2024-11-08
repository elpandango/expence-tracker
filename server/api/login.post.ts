import {authLogin} from "~/server/controllers/authController/authLogin";

export default defineEventHandler(async (event) => {
    const {email, password} = await readBody(event);
    return await authLogin({email, password});
});