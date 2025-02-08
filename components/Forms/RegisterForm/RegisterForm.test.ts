import {mount} from '@vue/test-utils';
import {describe, it, expect} from 'vitest';
import RegisterForm from "./RegisterForm.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";

describe('RegisterForm.vue', () => {
  it('should update email and password on input', async() => {
    const wrapper = mount(RegisterForm);

    const nameInput = wrapper.findAllComponents(BaseInput)[0].find('input');
    const lastNameInput = wrapper.findAllComponents(BaseInput)[1].find('input');
    const emailInput = wrapper.findAllComponents(BaseInput)[2].find('input');
    const passwordInput = wrapper.findAllComponents(BaseInput)[3].find('input');
    const repeatPasswordInput = wrapper.findAllComponents(BaseInput)[4].find('input');

    await nameInput.setValue('user');
    await lastNameInput.setValue('lastname');
    await emailInput.setValue('user@user.com');
    await passwordInput.setValue('password');
    await repeatPasswordInput.setValue('password');

    expect(wrapper.vm.user.name).toEqual('user');
    expect(wrapper.vm.user.lastName).toEqual('lastname');
    expect(wrapper.vm.user.email).toEqual('user@user.com');
    expect(wrapper.vm.user.password).toEqual('password');
    expect(wrapper.vm.user.repeatPassword).toEqual('password');
  });

  it('should emit register event when clicking login button', async () => {
    const wrapper = mount(RegisterForm);

    const button = wrapper.findComponent(BaseButton);

    await button.trigger('click');

    expect(wrapper.emitted('register')).toBeTruthy();
  });
});