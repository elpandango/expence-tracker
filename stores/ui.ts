import {defineStore} from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    isAddExpenseModalOpen: false,
  }),
  actions: {
    openAddExpenseModal() {
      this.isAddExpenseModalOpen = true;
    },
    closeAddExpenseModal() {
      this.isAddExpenseModalOpen = false;
    },
  },
});
