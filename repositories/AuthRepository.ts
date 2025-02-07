export default {
    async login(payload: { email: string; password: string }) {
        try {
            return await $fetch('/api/login', {
                method: 'POST',
                body: payload,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error?.response?._data?.message : 'Login failed';
            throw new Error(message);
        }
    },

    async logout() {
        try {
            return await $fetch('/api/logout', {
                method: 'POST',
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error?.response?._data?.message : 'Logout failed';
            throw new Error(message);
        }
    },

    async register(payload: { name: string; lastName: string; email: string; password: string }) {
        try {
            return await $fetch('/api/register', {
                method: 'POST',
                body: payload,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error?.response?._data?.message : 'Registration failed';
            throw new Error(message);
        }
    },

    async me() {
        try {
            return await $fetch('/api/me', {
                method: 'GET',
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error?.response?._data?.message : 'Not Authorized';
            throw new Error(message);
        }
    },
};
