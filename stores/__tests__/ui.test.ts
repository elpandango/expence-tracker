import {describe, it, expect, beforeEach, vi} from 'vitest';
import {setActivePinia, createPinia} from 'pinia';
import {useUIStore} from '~/stores/ui';

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should toggle modal state correctly', () => {
    const store = useUIStore();

    store.toggleModal('isAddExpenseModalOpen', true);
    expect(store.modals.isAddExpenseModalOpen).toBe(true);

    store.toggleModal('isAddExpenseModalOpen', false);
    expect(store.modals.isAddExpenseModalOpen).toBe(false);
  });

  it('should set loading state correctly', () => {
    const store = useUIStore();

    store.setLoading(true, 'default');
    expect(store.state.isLoading).toBe(true);

    store.setLoading(false, 'auth');
    expect(store.state.isAuthLoading).toBe(false);
  });

  it('should show toast and clears it after 3 seconds', async () => {
    vi.useFakeTimers();
    const store = useUIStore();

    store.showToast('Test message', 'success');
    expect(store.state.toast).toEqual({ message: 'Test message', type: 'success' });

    vi.advanceTimersByTime(3000);
    expect(store.state.toast).toBeNull();
  });

  it('should set and clear calculator value', () => {
    const store = useUIStore();

    store.setCalculatorValue(100);

    expect(store.calculatorValue).toBe(100);

    store.clearCalculatorValue();
    expect(store.calculatorValue).toBeNull();
  });
});