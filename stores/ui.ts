import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("ui", () => {
  const isAddExpenseModalOpen = ref(false);
  const isAddFundsModalOpen = ref(false);

  const openAddExpenseModal = () => {
    isAddExpenseModalOpen.value = true;
  };

  const closeAddExpenseModal = () => {
    isAddExpenseModalOpen.value = false;
  };

  const openAddFundsModal = () => {
    isAddFundsModalOpen.value = true;
  };

  const closeAddFundsModal = () => {
    isAddFundsModalOpen.value = false;
  };

  return {
    isAddExpenseModalOpen,
    isAddFundsModalOpen,
    openAddExpenseModal,
    closeAddExpenseModal,
    openAddFundsModal,
    closeAddFundsModal,
  };
});
