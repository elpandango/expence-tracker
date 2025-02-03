<template>
  <form @keydown.enter="handleRegister">
    <div class="flex flex-wrap md:flex-nowrap gap-2 mb-4">
      <div class="w-full md:w-1/2 mb-2 md:mb-0">
        <BaseInput
         v-model="user.name"
         size="medium"
         label="Name"/>
      </div>
      <div class="w-full md:w-1/2">
        <BaseInput
         v-model="user.lastName"
         size="medium"
         label="Last Name"/>
      </div>
    </div>
    <div class="w-full">
      <BaseInput
       v-model="user.email"
       size="medium"
       label="Email"/>
    </div>
    <div class="flex flex-wrap md:flex-nowrap gap-2 mb-4">
      <div class="w-full md:w-1/2 mb-2 md:mb-0">
        <BaseInput
         v-model="user.password"
         size="medium"
         label="Password"/>
      </div>
      <div class="w-full md:w-1/2 mb-2 md:mb-0">
        <BaseInput
         v-model="user.repeatPassword"
         size="medium"
         label="Repeat Password"/>
      </div>
    </div>
    <div class="form-row btn-block">
      <BaseButton
       size="medium"
       @click="handleRegister">Register
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

const emit = defineEmits(['register']);

const user = reactive({
  name: '',
  lastName: '',
  email: '',
  password: '',
  repeatPassword: '',
});

const handleRegister = () => {
  emit('register', user);
};
</script>

<style>
</style>