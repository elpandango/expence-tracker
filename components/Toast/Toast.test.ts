import { mount } from '@vue/test-utils';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import Toast from './Toast.vue';

describe('Toast.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a message', () => {
    const wrapper = mount(Toast, {
      props: { message: 'Test message' }
    });

    expect(wrapper.text()).toContain('Test message');
  });

  // it('should add right class depends on type', () => {
  //   const wrapper = mount(Toast, {
  //     props: { type: 'success' }
  //   });
  //
  //   console.log('wrapper.classes(): ', wrapper.classes());
  //
  //   expect(wrapper.classes()).toContain('bg-green-500');
  // });

  // it('should disappear after a time', async () => {
  //   vi.useFakeTimers();
  //   const wrapper = mount(Toast, {
  //     props: { duration: 3000 }
  //   });
  //
  //   vi.advanceTimersByTime(1000);
  //   await wrapper.vm.$nextTick();
  //
  //   expect(wrapper.find('.toast').exists()).toBe(false);
  // });
  //
  // it('закрывается при клике', async () => {
  //   const wrapper = mount(Toast);
  //
  //   await wrapper.trigger('click');
  //
  //   expect(wrapper.isVisible()).toBe(false);
  // });
});
