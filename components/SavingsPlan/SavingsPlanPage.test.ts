import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {flushPromises, mount} from '@vue/test-utils';
import {onMounted, onUnmounted, ref} from 'vue';
import {createI18n} from 'vue-i18n';
import SavingsPlanPage from '~/pages/savings-plan/index.vue';
import {en} from '~/locales/en';
import SavingsPlanRepository from '~/repositories/SavingsPlanRepository';
import type {SavingsPlanResponse} from '~/types/savingsPlan';

vi.mock('~/repositories/SavingsPlanRepository', () => ({default: {getPlan: vi.fn(), savePlan: vi.fn()}}));
beforeEach(() => {
  vi.mocked(SavingsPlanRepository.getPlan).mockReset().mockResolvedValue({plan: null});
  vi.mocked(SavingsPlanRepository.savePlan).mockReset().mockResolvedValue({plan: null});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const mountPage = async () => {
  vi.stubGlobal('useHead', vi.fn());
  vi.stubGlobal('useState', () => ref('2026-11'));
  vi.stubGlobal('onMounted', onMounted);
  vi.stubGlobal('onUnmounted', onUnmounted);
  const wrapper = mount(SavingsPlanPage, {
    global: {stubs: {Teleport: true}, plugins: [createI18n({legacy: false, locale: 'en', messages: {en}})]},
  });
  await flushPromises();
  return wrapper;
};

describe('SavingsPlanPage', () => {
  it('opens an independent calculator without changing or saving the plan', async () => {
    const wrapper = await mountPage();
    await wrapper.get('.savings-plan__calculator').trigger('click');
    await wrapper.get('#calculator-initial').setValue('10000');
    await wrapper.get('#calculator-monthly').setValue('500');
    expect(wrapper.get('.savings-calculator__total').text()).toBe('€40,000.00');
    expect(wrapper.get('.savings-plan__save-status').text()).toBe('No unsaved changes');
    expect(SavingsPlanRepository.savePlan).not.toHaveBeenCalled();
    await wrapper.findAll('button').find(button => button.text() === 'Close')!.trigger('click');
    expect(wrapper.find('#calculator-initial').exists()).toBe(false);
    expect(wrapper.findAll('.budget-entries__details')[0].text()).toContain('(0)');
    wrapper.unmount();
  });

  it('collapses income and expense forms independently and ignores clicks inside', async () => {
    const wrapper = await mountPage();
    const headers = wrapper.findAll('.budget-entries .header-block');
    expect(headers.map(header => header.attributes('aria-expanded'))).toEqual(['false', 'false']);
    await headers[0].trigger('click');
    await wrapper.get('#plan-income-name').trigger('click');
    await wrapper.get('#plan-income-name').setValue('Salary');
    await wrapper.get('#plan-income-amount').setValue('100');
    await wrapper.findAll('form')[0].trigger('submit');
    expect(headers.map(header => header.attributes('aria-expanded'))).toEqual(['true', 'false']);
    await headers[1].trigger('click');
    await headers[0].trigger('click');
    expect(headers.map(header => header.attributes('aria-expanded'))).toEqual(['false', 'true']);
    await headers[0].trigger('click');
    await wrapper.findAll('.budget-entries__details')[0].trigger('click');
    expect(wrapper.get('.budget-entries__item-name').text()).toContain('Salary');
    wrapper.unmount();
  });

  it('keeps the saved main account without its settings block and saves explicit account edits', async () => {
    const mainId = '6774569ceeffff409e18df4b';
    const secondId = '6774569ceeffff409e18df4c';
    const usdId = '6774569ceeffff409e18df4d';
    vi.mocked(SavingsPlanRepository.getPlan).mockResolvedValue({
      accounts: [{id: usdId, name: 'Dollar', currency: 'USD'}, {id: mainId, name: 'Card J', currency: 'EUR'}, {id: secondId, name: 'Card O', currency: 'EUR'}],
      plan: {
        startMonth: '2026-11', endMonth: '2026-12', defaultAccountId: mainId, updatedAt: '2026-11-06T12:00:00Z',
        incomes: [{id: 1, name: 'Salary', amountCents: 100000, startMonth: null, endMonth: null}],
        expenses: [{id: 2, name: 'Insurance', amountCents: 10000, startMonth: null, endMonth: null}],
      },
    });
    const wrapper = await mountPage();
    expect(wrapper.find('#plan-default-account').exists()).toBe(false);
    expect(wrapper.get(`option[value="${usdId}"]`).attributes('disabled')).toBeDefined();
    expect(wrapper.get('.savings-plan__save').attributes('disabled')).toBeDefined();
    expect(wrapper.findAll('thead th')[2].text()).toContain('Card J');
    expect(wrapper.findAll('.savings-plan__year')[0].findAll('td')[1].text()).toContain('1,800.00');
    await wrapper.findAll('.budget-entries__details')[1].trigger('click');
    expect(wrapper.get('.budget-entries__item-name').text()).toContain('Main plan account: Card J');
    await wrapper.get('.budget-entries__edit').trigger('click');
    await wrapper.get('#plan-expense-edit-account').setValue(secondId);
    await wrapper.findAll('form').find(form => form.find('#plan-expense-edit-name').exists())!.trigger('submit');
    const values = wrapper.findAll('.savings-plan__year')[0].findAll('td').map(cell => cell.text());
    expect(values).toEqual(['€1,800.00', '€2,000.00', '-€200.00', '€1,800.00']);
    await wrapper.get('.savings-plan__save').trigger('click');
    await flushPromises();
    const saved = vi.mocked(SavingsPlanRepository.savePlan).mock.calls[0][0];
    expect(saved.defaultAccountId).toBe(mainId);
    expect(saved.incomes[0].accountId).toBeNull();
    expect(saved.expenses[0].accountId).toBe(secondId);
    wrapper.unmount();

    vi.mocked(SavingsPlanRepository.getPlan).mockResolvedValue({plan: {...saved, updatedAt: '2026-11-06T13:00:00Z'}, accounts: [
      {id: mainId, name: 'Card J', currency: 'EUR'}, {id: secondId, name: 'Card O', currency: 'EUR'},
    ]});
    const restored = await mountPage();
    expect(restored.get('#plan-income-account').text()).toContain('Main plan account: Card J');
    expect(restored.findAll('.savings-plan__year')[0].findAll('td').map(cell => cell.text())).toEqual(values);
    restored.unmount();
  });

  it('allows choosing an account when adding an entry and resets the next draft to the main account', async () => {
    const accountId = '6774569ceeffff409e18df4b';
    vi.mocked(SavingsPlanRepository.getPlan).mockResolvedValue({plan: null, accounts: [{id: accountId, name: 'Card O', currency: 'EUR'}]});
    const wrapper = await mountPage();
    await wrapper.get('#plan-income-name').setValue('Benefit');
    await wrapper.get('#plan-income-amount').setValue('100');
    await wrapper.get('#plan-income-account').setValue(accountId);
    await wrapper.findAll('form')[0].trigger('submit');
    expect((wrapper.get('#plan-income-account').element as HTMLSelectElement).selectedIndex).toBe(0);
    await wrapper.get('.savings-plan__save').trigger('click');
    await flushPromises();
    expect(vi.mocked(SavingsPlanRepository.savePlan).mock.calls[0][0].incomes[0].accountId).toBe(accountId);
    wrapper.unmount();
  });

  it('keeps missing account references visible without silently falling back', async () => {
    const missingId = '6774569ceeffff409e18df4b';
    const availableId = '6774569ceeffff409e18df4c';
    vi.mocked(SavingsPlanRepository.getPlan).mockResolvedValue({
      accounts: [{id: availableId, name: 'Card J', currency: 'EUR'}],
      plan: {
        startMonth: '2026-11', endMonth: '2026-12', defaultAccountId: availableId, updatedAt: '2026-11-06T12:00:00Z',
        incomes: [{id: 1, name: 'Salary', amountCents: 10000, startMonth: null, endMonth: null, accountId: missingId}], expenses: [],
      },
    });
    const wrapper = await mountPage();
    expect(wrapper.text()).toContain('An assigned account is unavailable');
    expect(wrapper.findAll('.savings-plan__year')[0].findAll('td').map(cell => cell.text())).toEqual(['€200.00', '€0.00', '€200.00', '€200.00']);
    await wrapper.findAll('.budget-entries__details')[0].trigger('click');
    expect(wrapper.get('.budget-entries__item-name').text()).toContain('Unavailable account');
    await wrapper.get('.budget-entries__edit').trigger('click');
    await wrapper.findAll('form').find(form => form.find('#plan-income-edit-name').exists())!.trigger('submit');
    expect(wrapper.get('.budget-entry-form__error').text()).toContain('unavailable');
    await wrapper.get('#plan-income-edit-account').setValue((wrapper.get('#plan-income-edit-account').element as HTMLSelectElement).options[0].value);
    await wrapper.findAll('form').find(form => form.find('#plan-income-edit-name').exists())!.trigger('submit');
    expect(wrapper.text()).not.toContain('An assigned account is unavailable');
    expect(wrapper.get('.savings-plan__save').attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });

  it('loads saved entries, saves cents and restores the saved plan on a new visit', async () => {
    const stored = {
      startMonth: '2027-01', endMonth: '2027-02', updatedAt: '2026-11-06T12:00:00Z',
      incomes: [{id: 42, name: 'Salary', amountCents: 300001, startMonth: null, endMonth: null}], expenses: [],
    };
    vi.mocked(SavingsPlanRepository.getPlan).mockResolvedValue({plan: stored});
    const wrapper = await mountPage();
    expect(wrapper.get('.savings-plan__save').attributes('disabled')).toBeDefined();
    expect(wrapper.get('#plan-start').text()).toContain('January 2027');
    await wrapper.get('#plan-income-name').setValue('Benefit');
    await wrapper.get('#plan-income-amount').setValue('123,45');
    await wrapper.findAll('form')[0].trigger('submit');
    expect(wrapper.get('.savings-plan__save-status').text()).toContain('Unsaved');
    await wrapper.get('.savings-plan__save').trigger('click');
    await flushPromises();
    const sent = vi.mocked(SavingsPlanRepository.savePlan).mock.calls[0][0];
    expect(sent.incomes.map(entry => entry.id)).toEqual([42, 43]);
    expect(sent.incomes[1]).toMatchObject({amountCents: 12345, startMonth: null, endMonth: null});
    expect(wrapper.get('.savings-plan__save-status').text()).toBe('Plan saved');
    wrapper.unmount();
    vi.mocked(SavingsPlanRepository.getPlan).mockResolvedValue({plan: {...sent, updatedAt: stored.updatedAt}});
    const restored = await mountPage();
    expect(restored.findAll('.budget-entries__details')[0].text()).toContain('(2)');
    expect(restored.findAll('.savings-plan__year')[0].text()).toContain('6,246.92');
    restored.unmount();
  });

  it('blocks editing after a failed load and supports a safe retry', async () => {
    vi.mocked(SavingsPlanRepository.getPlan).mockRejectedValueOnce(new Error('offline'));
    const wrapper = await mountPage();
    expect(wrapper.get('.savings-plan__load-error').text()).toContain('Could not load');
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.find('.savings-plan__save').exists()).toBe(false);
    await wrapper.get('.savings-plan__load-error button').trigger('click');
    await flushPromises();
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('.savings-plan__load-error').exists()).toBe(false);
    expect(SavingsPlanRepository.savePlan).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('keeps unsaved changes after a failed save and allows retrying', async () => {
    const wrapper = await mountPage();
    await wrapper.get('#plan-income-name').setValue('Salary');
    await wrapper.get('#plan-income-amount').setValue('100');
    await wrapper.findAll('form')[0].trigger('submit');
    vi.mocked(SavingsPlanRepository.savePlan).mockRejectedValueOnce(new Error('offline'));
    await wrapper.get('.savings-plan__save').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('Could not save');
    expect(wrapper.get('.savings-plan__save-status').text()).toContain('Unsaved');
    expect(wrapper.findAll('.budget-entries__details')[0].text()).toContain('(1)');
    await wrapper.get('.savings-plan__save').trigger('click');
    await flushPromises();
    expect(wrapper.text()).not.toContain('Could not save');
    expect(wrapper.get('.savings-plan__save-status').text()).toBe('Plan saved');
    wrapper.unmount();
  });

  it('does not mark changes made during an in-flight save as saved', async () => {
    const wrapper = await mountPage();
    const addIncome = async (name: string) => {
      await wrapper.get('#plan-income-name').setValue(name);
      await wrapper.get('#plan-income-amount').setValue('100');
      await wrapper.findAll('form')[0].trigger('submit');
    };
    await addIncome('Salary');
    let completeSave!: (response: SavingsPlanResponse) => void;
    vi.mocked(SavingsPlanRepository.savePlan).mockImplementationOnce(() => new Promise(resolve => { completeSave = resolve; }));
    await wrapper.get('.savings-plan__save').trigger('click');
    expect(wrapper.get('.savings-plan__save').attributes('disabled')).toBeDefined();
    await addIncome('New entry');
    completeSave({plan: null});
    await flushPromises();
    expect(wrapper.get('.savings-plan__save-status').text()).toContain('Unsaved');
    expect(wrapper.get('.savings-plan__save').attributes('disabled')).toBeUndefined();
    expect(vi.mocked(SavingsPlanRepository.savePlan).mock.calls[0][0].incomes).toHaveLength(1);
    expect(wrapper.findAll('.budget-entries__details')[0].text()).toContain('(2)');
    wrapper.unmount();
  });

  it('applies a limited benefit and allows editing or cancelling its period in details', async () => {
    const wrapper = await mountPage();
    expect(wrapper.find('.savings-plan__notice').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Interest and inflation');
    const chooseMonth = async (id: string, year: number, monthIndex: number) => {
      await wrapper.get(`#${id}`).trigger('click');
      await wrapper.get(`#${id}-popup .month-picker__year`).setValue(String(year));
      await wrapper.findAll(`#${id}-popup .month-picker__month`)[monthIndex].trigger('click');
    };
    await wrapper.get('#plan-income-name').setValue('Elterngeld');
    await wrapper.get('#plan-income-amount').setValue('100');
    await wrapper.get('#plan-income-has-end').setValue(true);
    await chooseMonth('plan-income-end', 2026, 11);
    await wrapper.findAll('form')[0].trigger('submit');
    expect(wrapper.findAll('.savings-plan__year')[0].findAll('td')[1].text()).toContain('200.00');
    expect(wrapper.findAll('.savings-plan__year')[5].findAll('td')[1].text()).toContain('200.00');
    await wrapper.findAll('.budget-entries__details')[0].trigger('click');
    expect(wrapper.get('.budget-entries__item-name').text()).toContain('Dec 2026');
    await wrapper.get('.budget-entries__edit').trigger('click');
    await wrapper.get('#plan-income-edit-name').setValue('Do not save');
    await wrapper.findAll('button').find(button => button.text() === 'Cancel')!.trigger('click');
    expect(wrapper.get('.budget-entries__item-name').text()).toContain('Elterngeld');
    await wrapper.get('.budget-entries__edit').trigger('click');
    await chooseMonth('plan-income-edit-end', 2027, 0);
    await wrapper.get('#plan-income-edit-amount').setValue('200');
    await wrapper.findAll('form').find(form => form.find('#plan-income-edit-name').exists())!.trigger('submit');
    expect(wrapper.find('#plan-income-edit-name').exists()).toBe(false);
    expect(wrapper.get('.budget-entries__item-name').text()).toContain('Jan 2027');
    expect(wrapper.findAll('.savings-plan__year')[5].findAll('td')[1].text()).toContain('600.00');
    wrapper.unmount();
  });

  it('rejects reversed entry periods without adding an entry', async () => {
    const wrapper = await mountPage();
    await wrapper.get('#plan-income-name').setValue('Invalid period');
    await wrapper.get('#plan-income-amount').setValue('100');
    await wrapper.get('#plan-income-has-start').setValue(true);
    await wrapper.get('#plan-income-has-end').setValue(true);
    await wrapper.get('#plan-income-end').trigger('click');
    await wrapper.get('#plan-income-end-popup .month-picker__year').setValue('2026');
    await wrapper.findAll('#plan-income-end-popup .month-picker__month')[9].trigger('click');
    await wrapper.findAll('form')[0].trigger('submit');
    expect(wrapper.get('.budget-entry-form__error').text()).toContain('last month must not precede');
    expect(wrapper.findAll('.budget-entries__details')[0].text()).toContain('(0)');
    wrapper.unmount();
  });

  it('uses income/expense button colors and hides success three seconds after each addition', async () => {
    vi.useFakeTimers();
    const wrapper = await mountPage();
    expect(wrapper.find('.budget-entries__feedback').exists()).toBe(false);
    const buttons = wrapper.findAll('button[type="submit"]');
    expect(buttons[0].classes()).toContain('bg-green-600');
    expect(buttons[1].classes()).toContain('bg-red-600');
    const addIncome = async () => {
      await wrapper.get('#plan-income-name').setValue('Salary');
      await wrapper.get('#plan-income-amount').setValue('100');
      await wrapper.findAll('form')[0].trigger('submit');
    };
    await addIncome();
    await vi.advanceTimersByTimeAsync(2000);
    expect(wrapper.find('.budget-entries__success').exists()).toBe(true);
    await addIncome();
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.find('.budget-entries__success').exists()).toBe(true);
    await vi.advanceTimersByTimeAsync(2000);
    expect(wrapper.find('.budget-entries__success').exists()).toBe(false);
    expect(wrapper.find('.budget-entries__feedback').exists()).toBe(false);
    await addIncome();
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('starts with collapsed years and recalculates only after adding or removing entries', async () => {
    const wrapper = await mountPage();
    expect(wrapper.findAll('.savings-plan__year')).toHaveLength(6);
    expect(wrapper.findAll('thead th').map(cell => cell.text().replace(/\s+/g, ' ').trim())).toEqual([
      expect.stringContaining('Period'), 'Saved during the period', 'Total accumulated',
    ]);
    expect(wrapper.findAll('.savings-plan__year')[0].findAll('td')).toHaveLength(2);
    expect(wrapper.findAll('.savings-plan__month')).toHaveLength(0);
    expect(wrapper.findAll('.savings-plan__year-toggle')[0].attributes('aria-expanded')).toBe('false');
    await wrapper.get('#plan-income-name').setValue('Salary');
    await wrapper.get('#plan-income-amount').setValue('4000');
    expect(wrapper.findAll('.savings-plan__year')[0].text()).not.toContain('8,000.00');
    await wrapper.findAll('form')[0].trigger('submit');
    expect((wrapper.get('#plan-income-name').element as HTMLInputElement).value).toBe('');
    expect((wrapper.get('#plan-income-amount').element as HTMLInputElement).value).toBe('');
    expect(wrapper.findAll('.budget-entries__success')).toHaveLength(1);
    await wrapper.get('#plan-expense-name').setValue('Rent and bills');
    await wrapper.get('#plan-expense-amount').setValue('3200,50');
    await wrapper.findAll('form')[1].trigger('submit');
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('€');
    expect(wrapper.findAll('.savings-plan__year')[0].text()).toContain('1,599.00');
    expect(wrapper.findAll('.savings-plan__year')[5].text()).toContain('47,970.00');

    await wrapper.findAll('.savings-plan__year-toggle')[0].trigger('click');
    expect(wrapper.findAll('.savings-plan__month')).toHaveLength(2);
    expect(wrapper.findAll('.savings-plan__month')[0].text()).toContain('799.50');
    expect(wrapper.findAll('.savings-plan__year-toggle')[0].attributes('aria-expanded')).toBe('true');

    await wrapper.get('#plan-income-name').setValue('Benefit');
    await wrapper.get('#plan-income-amount').setValue('100');
    await wrapper.findAll('form')[0].trigger('submit');
    expect(wrapper.findAll('.budget-entries__row')).toHaveLength(2);
    expect(wrapper.find('.budget-entries__list').exists()).toBe(false);
    expect(wrapper.findAll('.savings-plan__month')[0].text()).toContain('899.50');
    expect(wrapper.findAll('.savings-plan__year')[0].text()).toContain('1,799.00');
    await wrapper.findAll('.budget-entries__details')[0].trigger('click');
    expect(wrapper.findAll('.budget-entries__item')).toHaveLength(2);
    expect(wrapper.find('.budget-entries__list input').exists()).toBe(false);
    await wrapper.findAll('.budget-entries__remove')[1].trigger('click');
    expect(wrapper.findAll('.budget-entries__item')).toHaveLength(1);
    expect(wrapper.findAll('.savings-plan__month')[0].text()).toContain('799.50');

    await wrapper.get('#plan-end').trigger('click');
    await wrapper.get('#plan-end-popup .month-picker__year').setValue('2026');
    await wrapper.findAll('#plan-end-popup .month-picker__month')[10].trigger('click');
    expect(wrapper.findAll('.savings-plan__year')).toHaveLength(1);
    expect(wrapper.findAll('.savings-plan__month')).toHaveLength(1);
    await wrapper.findAll('.savings-plan__year-toggle')[0].trigger('click');
    expect(wrapper.findAll('.savings-plan__month')).toHaveLength(0);
    wrapper.unmount();
  });

  it('expands years independently and supports clicking the entire summary row', async () => {
    const wrapper = await mountPage();
    await wrapper.findAll('.savings-plan__year')[0].trigger('click');
    await wrapper.findAll('.savings-plan__year')[1].trigger('click');
    expect(wrapper.findAll('.savings-plan__month')).toHaveLength(14);
    await wrapper.findAll('.savings-plan__year')[0].trigger('click');
    expect(wrapper.findAll('.savings-plan__month')).toHaveLength(12);
    expect(wrapper.findAll('.savings-plan__year-toggle')[1].attributes('aria-expanded')).toBe('true');
    wrapper.unmount();
  });

  it('rejects invalid drafts without changing the forecast and validates the period', async () => {
    const wrapper = await mountPage();
    await wrapper.findAll('form')[0].trigger('submit');
    expect(wrapper.get('#plan-income-name').attributes('aria-invalid')).toBe('true');
    await wrapper.get('#plan-income-name').setValue('Salary');
    await wrapper.get('#plan-income-amount').setValue('-100');
    await wrapper.findAll('form')[0].trigger('submit');
    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.get('#plan-income-amount').attributes('aria-invalid')).toBe('true');
    expect(wrapper.find('.budget-entries__success').exists()).toBe(false);
    await wrapper.get('#plan-income-amount').setValue('100');
    await wrapper.findAll('form')[0].trigger('submit');
    expect(wrapper.find('.budget-entries__success').exists()).toBe(true);
    expect(wrapper.find('table').exists()).toBe(true);
    await wrapper.get('#plan-end').trigger('click');
    await wrapper.get('#plan-end-popup .month-picker__year').setValue('2026');
    await wrapper.findAll('#plan-end-popup .month-picker__month')[9].trigger('click');
    expect(wrapper.find('table').exists()).toBe(false);
    wrapper.unmount();
  });

  it('shows an empty details list and resets the total after removing the last entry', async () => {
    const wrapper = await mountPage();
    const incomeDetails = wrapper.findAll('.budget-entries__details')[0];
    await incomeDetails.trigger('click');
    expect(wrapper.find('.budget-entries__empty').exists()).toBe(true);
    await wrapper.findAll('button').find(button => button.text() === 'Close')!.trigger('click');
    expect(wrapper.find('.budget-entries__empty').exists()).toBe(false);
    await wrapper.get('#plan-income-name').setValue('Salary');
    await wrapper.get('#plan-income-amount').setValue('100');
    await wrapper.findAll('form')[0].trigger('submit');
    await incomeDetails.trigger('click');
    await wrapper.get('.budget-entries__remove').trigger('click');
    expect(wrapper.find('.budget-entries__empty').exists()).toBe(true);
    expect(wrapper.findAll('.savings-plan__year')[0].text()).not.toContain('200.00');
    wrapper.unmount();
  });
});
