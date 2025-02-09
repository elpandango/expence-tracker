import {mount} from '@vue/test-utils';
import {describe, it, expect} from 'vitest';
import BaseInput from './BaseInput.vue';

describe('BaseInput.vue', () => {
  it('should emit update:modelValue when typing', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
      },
    });

    const input = wrapper.find('input');
    await input.setValue('Hello');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Hello']);
  });

  it('should show error message when errorMessage is provided', () => {
    const errorMessage = 'Invalid input';
    const wrapper = mount(BaseInput, {
      props: {errorMessage},
    });

    expect(wrapper.text()).toContain(errorMessage);
  });
});
