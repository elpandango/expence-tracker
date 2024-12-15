import UserRepository from "~/repositories/UserRepository";
import AuthRepository from "~/repositories/AuthRepository";
import CardRepository from "~/repositories/CardRepository";
import ExpenseRepository from "~/repositories/ExpenseRepository";
import BalanceRepository from "~/repositories/BalanceRepository";
import CategoriesRepository from "~/repositories/CategoriesRepository";
import ChartsRepository from "~/repositories/ChartsRepository";
import TransactionsRepository from "~/repositories/TransactionsRepository";

const repositories: Record<string, any> = {
    'Auth': AuthRepository,
    'User': UserRepository,
    'Card': CardRepository,
    'Expense': ExpenseRepository,
    'Balance': BalanceRepository,
    'Category': CategoriesRepository,
    'Charts': ChartsRepository,
    'Transactions': TransactionsRepository,
}
export default {
    get: (name: keyof typeof repositories) => repositories[name]
};
