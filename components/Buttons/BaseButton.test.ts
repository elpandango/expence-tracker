import {mount} from '@vue/test-utils';
import {describe, it, expect} from 'vitest';
import BaseButton from "./BaseButton.vue";

describe('BaseButton.vue', () => {
  it('should render with default classes when no props provided', async () => {
    const wrapper = mount(BaseButton);

    expect(wrapper.classes()).toContain('font-semibold');
    expect(wrapper.classes()).toContain('text-sm');
    expect(wrapper.classes()).toContain('rounded');
    expect(wrapper.classes()).toContain('transition-all');
  });

  it('should apply correct size classes', async () => {
    const wrapperSmall = mount(BaseButton, {
      props: {size: 'small'},
    });

    const buttonSmall = wrapperSmall.find('button');
    expect(buttonSmall.classes()).toContain('px-2');
    expect(buttonSmall.classes()).toContain('py-1');

    const wrapperBig = mount(BaseButton, {
      props: {size: 'big'},
    });
    const buttonBig = wrapperBig.find('button');
    expect(buttonBig.classes()).toContain('px-2');
    expect(buttonBig.classes()).toContain('py-2');
  });

  it('should apply correct variant classes', async () => {
    const wrapperRed = mount(BaseButton, {
      props: {variant: 'red'},
    });
    const buttonRed = wrapperRed.find('button');
    expect(buttonRed.classes()).toContain('bg-red-600');

    const wrapperPrimary = mount(BaseButton, {
      props: {variant: 'primary'},
    });
    const buttonPrimary = wrapperPrimary.find('button');
    expect(buttonPrimary.classes()).toContain('bg-blue-600');
  });

  it('should apply disabled when disabled prop provided', async () => {
    const wrapperDisabled = mount(BaseButton, {
      props: {disabled: true},
    });
    const buttonDisabled = wrapperDisabled.find('button');
    expect(buttonDisabled.attributes('disabled')).toBeDefined();
  });

  it('should render the button with the correct type attribute', () => {
    const wrapper = mount(BaseButton, {
      props: { type: 'submit' },
    });
    const button = wrapper.find('button');
    expect(button.attributes('type')).toBe('submit');
  });
});