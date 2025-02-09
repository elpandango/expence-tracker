import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Card from './Card.vue';

describe('Card.vue', () => {
  it('should render with default styles', () => {
    const wrapper = mount(Card);
    const card = wrapper.find('div');

    expect(card.classes()).toContain('card');
    expect(card.classes()).toContain('w-full');
    expect(card.classes()).toContain('flex');
    expect(card.classes()).toContain('flex-wrap');
    expect(card.classes()).toContain('shadow-xl');
    expect(card.classes()).toContain('rounded-xl');
    expect(card.classes()).toContain('bg-card-bg');
  });

  it('should render with additional custom class', () => {
    const wrapper = mount(Card, {
      props: { class: 'custom-class' }
    });
    const card = wrapper.find('div');

    expect(card.classes()).toContain('custom-class');
  });

  it('should apply maxWidth style', () => {
    const wrapper = mount(Card, {
      props: { maxWidth: '500px' }
    });
    const card = wrapper.find('div');

    expect(card.attributes('style')).toContain('max-width: 500px');
  });

  it('should render with scroll when withScroll is true', () => {
    const wrapper = mount(Card, {
      props: { withScroll: true }
    });
    const card = wrapper.find('div');

    expect(card.classes()).toContain('overflow-auto');
  });

  it('should not render header when withHeader is false', () => {
    const wrapper = mount(Card, {
      props: { withHeader: false }
    });

    const header = wrapper.find('.w-full.font-semibold');
    expect(header.exists()).toBe(false);
  });

  it('should render header when withHeader is true', () => {
    const wrapper = mount(Card, {
      props: { withHeader: true }
    });

    const header = wrapper.find('.w-full.font-semibold');
    expect(header.exists()).toBe(true);
  });

  it('should render slot content correctly', () => {
    const wrapper = mount(Card, {
      slots: {
        default: 'Card content'
      }
    });

    expect(wrapper.text()).toContain('Card content');
  });

  it('should render header slot content correctly', () => {
    const wrapper = mount(Card, {
      props: { withHeader: true },
      slots: {
        header: 'Header content'
      }
    });

    const header = wrapper.find('.w-full.font-semibold');
    expect(header.text()).toContain('Header content');
  });

});
