<template>
  <form @keydown.enter="handleLogin">
    <div class="w-full mb-4">
      <BaseInput
       v-model="user.email"
       size="medium"
       type="text"
       label="Email"/>
    </div>
    <div class="w-full mb-4">
      <BaseInput
       v-model="user.password"
       size="medium"
       type="password"
       label="Password"/>
    </div>
    <div class="w-full flex justify-start">
      <BaseButton
       size="medium"
       @click="handleLogin">Login
      </BaseButton>
    </div>
  </form>
</template>

<script
 setup
 lang="ts">

import {reactive} from 'vue';
import BaseButton from "~/components/Buttons/BaseButton.vue";
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";

const emit = defineEmits(['login']);

const user = reactive({
  email: '',
  password: ''
});

const handleLogin = () => {
  emit('login', user);
};
</script>

<style>
</style>