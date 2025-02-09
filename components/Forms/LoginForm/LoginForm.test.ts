import {mount} from '@vue/test-utils';
import {describe, it, expect} from 'vitest';
import LoginForm from "./LoginForm.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";

describe('LoginForm.vue', () => {
  it('should update email and password on input', async() => {
    const wrapper = mount(LoginForm);

    const emailInput = wrapper.findAllComponents(BaseInput)[0].find('input');
    const passwordInput = wrapper.findAllComponents(BaseInput)[1].find('input');

    await emailInput.setValue('user@user.com');
    await passwordInput.setValue('password');

    expect(wrapper.vm.user.email).toEqual('user@user.com');
    expect(wrapper.vm.user.password).toEqual('password');
  });

  it('should emit login event when clicking login button', async () => {
    const wrapper = mount(LoginForm);

    const button = wrapper.findComponent(BaseButton);

    await button.trigger('click');

    expect(wrapper.emitted('login')).toBeTruthy();
  });
});