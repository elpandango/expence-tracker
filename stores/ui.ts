import {defineStore} from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    isAddExpenseModalOpen: false,
    isAddFundsModalOpen: false,
  }),
  actions: {
    openAddExpenseModal() {
      this.isAddExpenseModalOpen = true;
    },
    closeAddExpenseModal() {
      this.isAddExpenseModalOpen = false;
    },
    openAddFundsModal() {
      this.isAddFundsModalOpen = true;
    },
    closeAddFundsModal() {
      this.isAddFundsModalOpen = false;
    },
  },
});
