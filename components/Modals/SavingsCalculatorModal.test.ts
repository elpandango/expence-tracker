import {afterEach, describe, expect, it, vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {onMounted, onUnmounted} from 'vue';
import {createI18n} from 'vue-i18n';
import SavingsCalculatorModal from './SavingsCalculatorModal.vue';
import {en} from '~/locales/en';

afterEach(() => vi.unstubAllGlobals());
const mountCalculator = () => {
  vi.stubGlobal('onMounted', onMounted);
  vi.stubGlobal('onUnmounted', onUnmounted);
  return mount(SavingsCalculatorModal, {
    global: {stubs: {Teleport: true}, plugins: [createI18n({legacy: false, locale: 'en', messages: {en}})]},
  });
};

describe('SavingsCalculatorModal', () => {
  it('defaults to 60 months and synchronizes sliders and inputs', async () => {
    const wrapper = mountCalculator();
    expect((wrapper.get('#calculator-months').element as HTMLInputElement).value).toBe('60');
    await wrapper.get('#calculator-initial').setValue('1000,25');
    await wrapper.get('#calculator-monthly-slider').setValue('500');
    expect((wrapper.get('#calculator-monthly').element as HTMLInputElement).value).toBe('500');
    await wrapper.get('#calculator-months-slider').setValue('24');
    expect((wrapper.get('#calculator-months').element as HTMLInputElement).value).toBe('24');
    expect(wrapper.get('.savings-calculator__total').text()).toBe('€13,000.25');
    expect(wrapper.get('.savings-calculator__added').text()).toBe('€12,000.00');
    await wrapper.get('#calculator-monthly').setValue('800');
    expect((wrapper.get('#calculator-monthly-slider').element as HTMLInputElement).value).toBe('800');
    wrapper.unmount();
  });

  it('does not clamp manual values to slider limits and hides invalid results', async () => {
    const wrapper = mountCalculator();
    await wrapper.get('#calculator-monthly').setValue('5000');
    await wrapper.get('#calculator-months').setValue('500');
    expect(wrapper.get('.savings-calculator__total').text()).toBe('€2,500,000.00');
    expect((wrapper.get('#calculator-monthly-slider').element as HTMLInputElement).value).toBe('3000');
    expect((wrapper.get('#calculator-months-slider').element as HTMLInputElement).value).toBe('360');
    await wrapper.get('#calculator-months').setValue('0');
    expect(wrapper.find('.savings-calculator__result').exists()).toBe(false);
    expect(wrapper.get('#calculator-error').text()).toContain('1 to 1,200');
    await wrapper.get('#calculator-months').setValue('60');
    await wrapper.get('#calculator-monthly').setValue('-100');
    expect(wrapper.find('.savings-calculator__result').exists()).toBe(false);
    await wrapper.get('#calculator-monthly-slider').setValue('100');
    expect(wrapper.find('.savings-calculator__result').exists()).toBe(true);
    wrapper.unmount();
  });

  it('closes through the existing modal controls', async () => {
    const wrapper = mountCalculator();
    await wrapper.findAll('button').find(button => button.text() === 'Close')!.trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(wrapper.emitted('close')).toHaveLength(2);
    wrapper.unmount();
    expect(document.body.classList.contains('no-scroll')).toBe(false);
  });
});
