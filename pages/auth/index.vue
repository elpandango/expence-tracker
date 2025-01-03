<template>
  <div class="auth-page">
    <div class="intro-block">
      <div class="block-text">
        <h1>Welcome to Expendango</h1>
        <h3>Track your expenses, manage your income, and take control of your finances with ease. <br/>Empowering your
          financial goals, one step at a time.</h3>
      </div>

      <div class="auth-forms">
        <h4>If you have an account, log in below. <br/>New here? Create one to get started!</h4>
        <Card>
          <Tabs :tabs="tabs">
            <template #login>
              <LoginForm @login="handleLogin"/>
            </template>
            <template #signup>
              <Suspense>
                <template #default>
                  <RegisterForm @register="handleRegister"/>
                </template>
                <template #fallback>
                  <div>Loading...</div>
                </template>
              </Suspense>
            </template>
          </Tabs>
        </Card>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {useAuthStore} from "~/stores/auth";
import {useSeoConfig} from "~/use/useSeoConfig";
import Tabs from "~/components/Tabs/Tabs.vue";
import LoginForm from "~/components/Forms/LoginForm/LoginForm.vue";

const RegisterForm = defineAsyncComponent(() => import('~/components/Forms/RegisterForm/RegisterForm.vue'));

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
  flex-wrap: wrap;
  width: 100%;
  min-height: 100vh;
  @media only screen and (max-width: 767px) {
    min-height: 90vh;
  }

  .intro-block {
    width: 100%;
    max-width: 700px;
    text-align: center;

    @media only screen and (max-width: 767px) {
      padding-top: 20px;
    }
  }

  .block-text {
    padding: 0 16px;
  }

  h1 {
    font-size: 36px;
    transform: translateY(50px);
    animation: slideUp 1s ease forwards;
    opacity: 0;

    @media only screen and (max-width: 767px) {
      font-size: 32px;
    }
  }

  h3 {
    transform: translateY(50px);
    animation: slideUp 1s ease forwards;
    animation-delay: 0.3s;
    opacity: 0;

    @media only screen and (max-width: 767px) {
      font-size: 16px;
    }
  }

  .auth-forms {
    margin: 0 auto;
    padding: 16px;

    h4 {
      opacity: 0;
      transform: translateY(50px);
      animation: slideUp 1s ease forwards;
      animation-delay: 0.6s;

      @media only screen and (max-width: 767px) {
        font-size: 14px;
      }
    }

    .card {
      opacity: 0;
      transform: translateY(50px);
      animation: slideUp 1s ease forwards;
      animation-delay: 0.9s;
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

</style>