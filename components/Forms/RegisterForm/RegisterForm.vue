<template>
  <div class="auth-form">
    <form>
      <div class="form-row cols">
        <div class="row-col w50p">
          <FloatLabelInput
           v-model="user.name"
           size="medium"
           label="Name"/>
        </div>
        <div class="row-col w50p">
          <FloatLabelInput
           v-model="user.lastName"
           size="medium"
           label="Last Name"/>
        </div>
      </div>
      <div class="form-row">
        <FloatLabelInput
         v-model="user.email"
         size="medium"
         label="Email"/>
      </div>
      <div class="form-row cols">
        <div class="row-col w50p">
          <FloatLabelInput
           v-model="user.password"
           size="medium"
           label="Password"/>
        </div>
        <div class="row-col w50p">
          <FloatLabelInput
           v-model="user.repeatPassword"
           size="medium"
           label="Repeat Password"/>
        </div>
      </div>
      <div class="form-row btn-block">
        <BaseButton
         @click="handleRegister"
         size="big">Register
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script
 setup
 lang="ts">

import {reactive} from 'vue';
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const user = reactive({
  name: '',
  lastName: '',
  email: '',
  password: '',
  repeatPassword: '',
});

const handleRegister = () => {

};
</script>

<style
 scoped
 lang="scss">
.login-form {
  padding: 24px 0;

  .button {
    min-width: 140px;
  }
}
</style>