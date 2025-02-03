<template>
  <div class="auth-form">
    <form @keydown.enter="handleLogin">
      <div class="form-row">
        <FloatLabelInput
         v-model="user.email"
         size="medium"
         type="text"
         label="Email"/>
      </div>
      <div class="form-row">
        <FloatLabelInput
         v-model="user.password"
         size="medium"
         type="password"
         label="Password"/>
      </div>
      <div class="form-row btn-block">
        <BaseButton
         @click="handleLogin"
         size="big">Login
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

const emit = defineEmits(['login']);

const user = reactive({
  email: '',
  password: ''
});

const handleLogin = () => {
  emit('login', user);
};
</script>

<style
 lang="scss">

</style>