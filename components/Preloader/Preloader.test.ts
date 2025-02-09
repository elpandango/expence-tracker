import {mount} from '@vue/test-utils';
import {describe, it, expect} from 'vitest';
import Preloader from './Preloader.vue';

describe('Preloader.vue', () => {
  it('should render correctly', async () => {
    const wrapper = mount(Preloader);
    const svg = wrapper.find('svg');

    expect(svg.exists()).toBe(true);
  });

  it('should apply height from props if provided', async () => {
    const height = '300px';
    const wrapper = mount(Preloader, {
      props: {
        height: height
      }
    });

    expect(wrapper.attributes('style')).toContain(`height: ${height}`);
  });

  it('should apply full-page class if prop isFullSize is provided', async () => {
    const wrapper = mount(Preloader, {
      props: {
        isFullSize: true
      }
    });

    expect(wrapper.classes()).toContain('full-page');
  });

  it('should not apply full-page class if prop isFullSize is not provided', async () => {
    const wrapper = mount(Preloader, {
      props: {
        isFullSize: false
      }
    });

    expect(wrapper.classes()).not.toContain('full-page');
  });
});