import {mount} from '@vue/test-utils';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {nextTick} from 'vue';
import Toast from './Toast.vue';

describe('Toast.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a message', () => {
    const wrapper = mount(Toast, {
      props: {message: 'Test message'}
    });

    expect(wrapper.text()).toContain('Test message');
  });

  it('should add right class depends on type', async () => {
    const wrapper = mount(Toast, {
      props: {
        type: 'success',
        message: 'Test message'
      }
    });

    await nextTick();

    const toastDiv = wrapper.find('div');

    expect(toastDiv.classes()).toContain('bg-green-500');
  });

  it('should disappear after a time', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Toast, {
      props: { duration: 3000 }
    });

    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.toast').exists()).toBe(false);
  });

  it('should close on click', async () => {
    const wrapper = mount(Toast);

    const toastDiv = wrapper.find('div');

    await toastDiv.trigger('click');

    await nextTick();

    expect(wrapper.find('div.fixed').exists()).toBe(false);
  });
});
