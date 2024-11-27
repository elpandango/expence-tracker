export default {
    async createCard(payload: { name: string; number: string, balance: number, currency: string }) {
        try {
            return await $fetch('/api/card', {
                method: 'POST',
                body: payload,
            });
        } catch (error: any) {
            const message = error?.response?._data?.message || 'Card creation failed';
            throw new Error(message);
        }
    },
    async updateCard(cardId: string, payload: { name: string; number: string, balance: number, currency: string }) {
        try {
            return await $fetch(`/api/card/${cardId}`, {
                method: 'PUT',
                body: payload,
            });
        } catch (error: any) {
            const message = error?.response?._data?.message || 'Card creation failed';
            throw new Error(message);
        }
    },
    async deleteCard(cardId: string) {
        try {
            return await $fetch(`/api/card/${cardId}`, {
                method: 'DELETE',
            });
        } catch (error: any) {
            const message = error?.response?._data?.message || 'Card creation failed';
            throw new Error(message);
        }
    },
    async getAllCards() {
        try {
            return await $fetch('/api/get-cards', {
                method: 'GET',
            });
        } catch (error: any) {
            const message = error?.response?._data?.message || 'No Cards found';
            throw new Error(message);
        }
    },
};
