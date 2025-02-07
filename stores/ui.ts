import { defineStore } from "pinia";
import {emitter} from "~/classes/uiEventBus";

export const useUIStore = defineStore("ui", () => {
  const modals = reactive({
    isAddExpenseModalOpen: false,
    isAddFundsModalOpen: false,
    isAddAccountModalOpen: false,
    isCalculatorModalOpen: false,
  });

  const calculatorValue = ref(null);

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

  const setCalculatorValue = (value: string | number) => {
    calculatorValue.value = value;
  };

  const clearCalculatorValue = () => {
    calculatorValue.value = null;
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
    calculatorValue,
    setLoading,
    showToast,
    toggleModal,
    setCalculatorValue,
    clearCalculatorValue,
  };
});
