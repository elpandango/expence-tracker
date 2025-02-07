import UserRepository from "~/repositories/UserRepository";
import AuthRepository from "~/repositories/AuthRepository";
import CategoriesRepository from "~/repositories/CategoriesRepository";
import ChartsRepository from "~/repositories/ChartsRepository";
import TransactionsRepository from "~/repositories/TransactionsRepository";
import AccountRepository from "~/repositories/AccountRepository";

// eslint-disable-next-line
const repositories: Record<string, any> = {
    'Auth': AuthRepository,
    'User': UserRepository,
    'Category': CategoriesRepository,
    'Charts': ChartsRepository,
    'Transactions': TransactionsRepository,
    'Accounts': AccountRepository,
}
export default {
    get: (name: keyof typeof repositories) => repositories[name]
};
