import {defineStore} from 'pinia';

export const useStoreUsers = defineStore({
  id: 'storeUsers',
  state: () => ({
    currentUser: {},
  }),
  actions: {
    populateCurrentUser(user: any): void {

      console.log('user in action: ', user);

      this.$patch({currentUser: {...user}});
    },
  },
  getters: {
    getCurrentUser: (state: any) => state.currentUser,
  }
})
