export default {
    async createExpense(payload: { cardId: string; description: string, amount: number, date: string, category: string }) {
        try {
            return await $fetch('/api/expense', {
                method: 'POST',
                body: payload,
            });
        } catch (error: any) {
            const message = error?.response?._data?.message || 'Expense creation failed';
            throw new Error(message);
        }
    },
};
