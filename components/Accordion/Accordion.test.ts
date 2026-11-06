import {afterEach, describe, expect, it, vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {nextTick} from 'vue';
import Accordion from './Accordion.vue';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Accordion', () => {
  it('toggles only from the header, including keyboard controls', async () => {
    const wrapper = mount(Accordion, {slots: {header: 'Income', 'accordion-body': '<input><button>Inside</button>'}});
    const header = wrapper.get('.header-block');
    expect(header.attributes('aria-expanded')).toBe('false');
    expect(wrapper.get('.content-block').attributes('inert')).toBeDefined();
    await header.trigger('click');
    expect(header.attributes('aria-expanded')).toBe('true');
    expect(wrapper.get('.content-block').attributes('inert')).toBeUndefined();
    await wrapper.get('input').trigger('click');
    await wrapper.get('button').trigger('click');
    expect(header.attributes('aria-expanded')).toBe('true');
    await header.trigger('keydown', {key: 'Enter'});
    expect(header.attributes('aria-expanded')).toBe('false');
    await header.trigger('keydown', {key: ' '});
    expect(header.attributes('aria-expanded')).toBe('true');
    wrapper.unmount();
  });

  it('remeasures dynamic content and disconnects its observer', async () => {
    let resize!: () => void;
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { resize = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(120);
    const wrapper = mount(Accordion, {props: {isActiveOnInit: true}, slots: {'accordion-body': 'Content'}});
    await nextTick();
    expect(wrapper.get('.content-block').attributes('style')).toContain('120px');
    height.mockReturnValue(240);
    resize();
    await nextTick();
    expect(wrapper.get('.content-block').attributes('style')).toContain('240px');
    expect(observe).toHaveBeenCalled();
    wrapper.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
