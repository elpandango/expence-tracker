import { defineStore } from "pinia";
import {emitter} from "~/classes/uiEventBus";

export const useUIStore = defineStore("ui", () => {
  const modals = reactive({
    isAddExpenseModalOpen: false,
    isAddFundsModalOpen: false,
    isAddAccountModalOpen: false,
  });

  const state = reactive({
    isAuthLoading: true,
    isLoading: true,
    toast: null as { message: string; type: 'success' | 'error' } | null,
  });

  const toggleModal = (modalName: keyof typeof modals, isOpen: boolean) => {
    modals[modalName] = isOpen;
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
    modals,
    setLoading,
    showToast,
    toggleModal,
  };
});
