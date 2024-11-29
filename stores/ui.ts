import { defineStore } from "pinia";
import { ref } from "vue";
import {emitter} from "~/classes/uiEventBus";

export const useUIStore = defineStore("ui", () => {
  const isAddExpenseModalOpen = ref(false);
  const isAddFundsModalOpen = ref(false);
  const state = reactive({
    isAuthLoading: true,
    isLoading: true,
    toast: null as { message: string; type: 'success' | 'error' } | null,
  });

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

  const setLoading = (value: boolean, type: 'auth' | 'default') => {
    if (type === 'auth') {
      state.isAuthLoading = value;
    } else {
      state.isLoading = value;
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    state.toast = { message, type };

    setTimeout(() => {
      state.toast = null;
    }, 3000);
  };

  emitter.on('ui:startLoading', (type: 'auth' | 'default') => {
    setLoading(true, type);
  });

  emitter.on('ui:stopLoading', (type: 'auth' | 'default') => {
    setLoading(false, type);
  });

  emitter.on('ui:showToast', ({ message, type }: { message: string; type: 'success' | 'error' }) => {
    showToast(message, type);
  });

  return {
    state,
    isAddExpenseModalOpen,
    isAddFundsModalOpen,
    openAddExpenseModal,
    closeAddExpenseModal,
    openAddFundsModal,
    closeAddFundsModal,
    setLoading,
    showToast,
  };
});
