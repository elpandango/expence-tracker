import UserRepository from "~/repositories/UserRepository";
import AuthRepository from "~/repositories/AuthRepository";
import PostsRepository from "~/repositories/PostsRepository";
import PhraseRepository from "~/repositories/PhraseRepository";

const repositories: Record<string, any> = {
    'Phrase': PhraseRepository,
    'Post': PostsRepository,
    'Auth': AuthRepository,
    'User': UserRepository,
}
export default {
    get: (name: keyof typeof repositories) => repositories[name]
};
