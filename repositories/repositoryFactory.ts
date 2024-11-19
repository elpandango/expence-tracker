import UserRepository from "~/repositories/UserRepository";
import AuthRepository from "~/repositories/AuthRepository";

const repositories: Record<string, any> = {
    'Auth': AuthRepository,
    'User': UserRepository,
}
export default {
    get: (name: keyof typeof repositories) => repositories[name]
};
