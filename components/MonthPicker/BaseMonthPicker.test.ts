import {afterEach, describe, expect, it, vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {nextTick} from 'vue';
import {createI18n} from 'vue-i18n';
import BaseMonthPicker from './BaseMonthPicker.vue';
import {en} from '~/locales/en';
import {ru} from '~/locales/ru';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const mountPicker = (props = {}) => mount(BaseMonthPicker, {
  attachTo: document.body,
  props: {id: 'test-month', label: 'First month', modelValue: '2026-11', ...props},
  global: {plugins: [createI18n({legacy: false, locale: 'en', messages: {en, ru}})]},
});
const openPicker = async (wrapper: ReturnType<typeof mountPicker>) => {
  await wrapper.get('#test-month').trigger('click');
  await nextTick();
  await nextTick();
};
const getMonths = () => [...document.querySelectorAll<HTMLButtonElement>('.month-picker__month')];

describe('BaseMonthPicker', () => {
  it('does not open from its caption and dismisses an open popup when the caption is clicked', async () => {
    const wrapper = mountPicker();
    expect(wrapper.find('label').exists()).toBe(false);
    expect(wrapper.get('#test-month').attributes('aria-labelledby')).toBe('test-month-label test-month-value');
    await wrapper.get('#test-month-label').trigger('click');
    expect(document.querySelector('.month-picker__popup')).toBeNull();
    await openPicker(wrapper);
    await wrapper.get('#test-month-label').trigger('pointerdown');
    await wrapper.get('#test-month-label').trigger('click');
    expect(document.querySelector('.month-picker__popup')).toBeNull();
    wrapper.unmount();
  });

  it('teleports twelve months and emits a date-only month on selection', async () => {
    const wrapper = mountPicker();
    expect(wrapper.get('#test-month').text()).toContain('November 2026');
    await openPicker(wrapper);
    expect(wrapper.find('.month-picker__popup').exists()).toBe(false);
    expect(getMonths()).toHaveLength(12);
    expect(getMonths()[10].getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(getMonths()[10]);
    getMonths()[11].click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-12']]);
    expect(document.querySelector('.month-picker__popup')).toBeNull();
    expect(document.activeElement).toBe(wrapper.get('#test-month').element);
    wrapper.unmount();
  });

  it('navigates and directly changes years, including future years', async () => {
    const wrapper = mountPicker();
    await openPicker(wrapper);
    document.querySelector<HTMLButtonElement>('[aria-label="Next year"]')!.click();
    await nextTick();
    expect(document.querySelector<HTMLInputElement>('.month-picker__year')!.value).toBe('2027');
    const input = document.querySelector<HTMLInputElement>('.month-picker__year')!;
    input.value = '2035';
    input.dispatchEvent(new Event('change', {bubbles: true}));
    await nextTick();
    getMonths()[0].click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toEqual([['2035-01']]);
    wrapper.unmount();
  });

  it('respects month limits and year navigation boundaries', async () => {
    const wrapper = mountPicker({minMonth: '2026-03', maxMonth: '2026-11'});
    await openPicker(wrapper);
    expect(getMonths()[0].disabled).toBe(true);
    expect(getMonths()[11].disabled).toBe(true);
    expect(getMonths()[2].disabled).toBe(false);
    expect(document.querySelector<HTMLButtonElement>('[aria-label="Previous year"]')!.disabled).toBe(true);
    expect(document.querySelector<HTMLButtonElement>('[aria-label="Next year"]')!.disabled).toBe(true);
    wrapper.unmount();
  });

  it('supports arrow keys, Escape and outside dismissal without changing the value', async () => {
    const wrapper = mountPicker();
    await openPicker(wrapper);
    getMonths()[10].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}));
    expect(document.activeElement).toBe(getMonths()[9]);
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await nextTick();
    expect(document.querySelector('.month-picker__popup')).toBeNull();
    await openPicker(wrapper);
    document.body.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    await nextTick();
    expect(document.querySelector('.month-picker__popup')).toBeNull();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    wrapper.unmount();
  });

  it('localizes both the field and the month grid', async () => {
    const wrapper = mountPicker();
    await wrapper.setProps({modelValue: '2028-02'});
    const i18n = wrapper.vm.$i18n;
    i18n.locale = 'ru';
    await nextTick();
    expect(wrapper.get('#test-month').text()).toContain('февраль');
    await openPicker(wrapper);
    expect(getMonths()[1].textContent).toContain('февр');
    wrapper.unmount();
  });

  it('fits the viewport and flips above a trigger near the bottom', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: window.innerHeight - 80, bottom: window.innerHeight - 34,
      left: window.innerWidth - 100, right: window.innerWidth + 140, width: 240, height: 46,
      x: 0, y: 0, toJSON: () => ({}),
    });
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(300);
    const wrapper = mountPicker();
    await openPicker(wrapper);
    const panel = document.querySelector<HTMLElement>('.month-picker__popup')!;
    expect(Number.parseFloat(panel.style.top)).toBeLessThan(window.innerHeight - 80);
    expect(Number.parseFloat(panel.style.left) + Number.parseFloat(panel.style.width)).toBeLessThanOrEqual(window.innerWidth - 12);
    wrapper.unmount();
    expect(document.querySelector('.month-picker__popup')).toBeNull();
  });
});
