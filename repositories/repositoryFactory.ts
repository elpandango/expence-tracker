import UserRepository from "~/repositories/UserRepository";
import AuthRepository from "~/repositories/AuthRepository";
import CardRepository from "~/repositories/CardRepository";
import ExpenseRepository from "~/repositories/ExpenseRepository";
import BalanceRepository from "~/repositories/BalanceRepository";
import CategoriesRepository from "~/repositories/CategoriesRepository";

const repositories: Record<string, any> = {
    'Auth': AuthRepository,
    'User': UserRepository,
    'Card': CardRepository,
    'Expense': ExpenseRepository,
    'Balance': BalanceRepository,
    'Category': CategoriesRepository,
}
export default {
    get: (name: keyof typeof repositories) => repositories[name]
};
