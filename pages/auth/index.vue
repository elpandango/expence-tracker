<template>
  <div class="auth-page">
    <div class="auth-forms">
      <Card>
        <Tabs :tabs="tabs">
          <template #login>
            <LoginForm @login="handleLogin"/>
          </template>
          <template #signup>
            <form>
              <RegisterForm @register="handleRegister"/>
            </form>
          </template>
        </Tabs>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useAuthStore} from "~/stores/auth";
import {useSeoConfig} from "~/use/useSeoConfig";
import Tabs from "~/components/Tabs/Tabs.vue";
import LoginForm from "~/components/Forms/LoginForm/LoginForm.vue";
import RegisterForm from "~/components/Forms/RegisterForm/RegisterForm.vue";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

definePageMeta({
  layout: 'not-authorized'
});

const authStore = useAuthStore();

const tabs = [
  {id: 'login', label: 'Login', slotName: 'login'},
  {id: 'signup', label: 'Sign Up', slotName: 'signup'},
];

const handleLogin = async (user: { email: string; password: string }) => {
  try {
    await authStore.login(user);
  } catch (error) {
    console.log(`Login failed: ${error.message}`);
  }
};

const handleRegister = async (user: any) => {
  try {
    await authStore.register(user);
  } catch (error) {
    console.log(`Registration failed: ${error.message}`);
  }
};
</script>

<style lang="scss">
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
}

.auth-forms {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}
</style>