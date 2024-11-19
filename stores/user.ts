import {defineStore} from 'pinia';
import repositoryFactory from "~/repositories/repositoryFactory";

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    loading: true,
  }),
  actions: {
    async checkAuth() {
      try {
        const response = await repositoryFactory.get('Auth').me();
        this.isLoggedIn = !!response;
      } catch (err) {
        console.log('Error checking auth:', err);
        this.isLoggedIn = false;
      } finally {
        this.loading = false;
      }
    },
  },
});
