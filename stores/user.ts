import {defineStore} from 'pinia';
import repositoryFactory from "~/repositories/repositoryFactory";

interface User {
  name: string;
  lastName: string;
  email: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    loading: true,
    avatarLoading: true,
    user: {} as User,
    avatar: '',
    userId: null,
  }),
  actions: {
    async checkAuth() {
      this.loading = true;
      try {
        const response = await repositoryFactory.get('Auth').me();
        this.user = response?.user || {};
        this.userId = response?.user?.userId || null;
        this.isLoggedIn = !!response;
      } catch (err) {
        console.error('Error checking auth:', err);
        this.user = {
          name: '',
          lastName: '',
          email: ''
        };
        this.isLoggedIn = false;
      } finally {
        this.loading = false;
      }
    },
    async getUserAvatar() {
      this.avatarLoading = true;
      try {
        const {avatar} = await repositoryFactory.get('User').getAvatar();
        this.avatar = avatar || '';
      } catch (err) {
        console.error('Error fetching avatar:', err);
        this.avatar = '';
      } finally {
        this.avatarLoading = false;
      }
    },
  },
  getters: {
    getUser: (state) => state.user,
    getUserID: (state) => state.userId,
    getAvatar: (state) => state.avatar,
  }
});
