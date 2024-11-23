import UserRepository from "~/repositories/UserRepository";
import AuthRepository from "~/repositories/AuthRepository";
import CardRepository from "~/repositories/CardRepository";
import ExpenseRepository from "~/repositories/ExpenseRepository";

const repositories: Record<string, any> = {
    'Auth': AuthRepository,
    'User': UserRepository,
    'Card': CardRepository,
    'Expense': ExpenseRepository,
}
export default {
    get: (name: keyof typeof repositories) => repositories[name]
};
