<template>
  <div class="auth-page">
    <Preloader
     v-if="uiStore.state.isLoading"
     height="50vh"/>
    <div
     v-else
     class="intro-block">
      <div class="block-text">
        <img
         class="main-img"
         src="/images/logo.png"
         alt="Expendango logo"
         width="150"
         height="150">
        <h1>Welcome to Expendango</h1>
        <h3>Track your expenses, manage your income, and take control of your finances with ease. Empowering your
          financial goals, one step at a time.</h3>
      </div>

      <div class="auth-forms">
        <Card>
          <div v-if="isLogin">
            <LoginForm @login="handleLogin"/>
          </div>
          <div v-else>
            <Suspense>
              <template #default>
                <RegisterForm @register="handleRegister"/>
              </template>
              <template #fallback>
                <div>Loading...</div>
              </template>
            </Suspense>
          </div>
        </Card>

        <div class="addition-text">
          <p v-if="isLogin">Don't have an account? <span @click="toggleForm">Sign up!</span></p>
          <p v-else>Already have an account? <span @click="toggleForm">Login!</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import {useAuthStore} from "~/stores/auth";
import {useUIStore} from "~/stores/ui";
import {useSeoConfig} from "~/use/useSeoConfig";
import {emitter} from "~/classes/uiEventBus";
import LoginForm from "~/components/Forms/LoginForm/LoginForm.vue";

const RegisterForm = defineAsyncComponent(() => import('~/components/Forms/RegisterForm/RegisterForm.vue'));

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

definePageMeta({
  layout: 'not-authorized'
});

emitter.emit('ui:stopLoading', 'default');
const authStore = useAuthStore();
const uiStore = useUIStore();

const isLogin = ref(true);

const toggleForm = () => {
  isLogin.value = !isLogin.value;
};

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
  background-color: #dae0e0;
  @media only screen and (max-width: 767px) {
    //min-height: 90vh;
  }

  .main-img {
    border-radius: var(--border-radius);
    margin-bottom: 16px;

    @media only screen and (max-width: 767px) {
      width: 80px;
      height: 80px;
      margin-bottom: 10px;
    }
  }

  .intro-block {
    width: 100%;
    max-width: 700px;
    min-height: 80vh;
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
      font-size: 28px;
    }
  }

  h3 {
    transform: translateY(50px);
    animation: slideUp 1s ease forwards;
    animation-delay: 0.2s;
    opacity: 0;
    color: var(--hover-color);

    @media only screen and (max-width: 767px) {
      font-size: 14px;
    }
  }

  .auth-forms {
    margin: 0 auto;
    padding: 16px;

    h4 {
      opacity: 0;
      transform: translateY(50px);
      animation: slideUp 1s ease forwards;
      animation-delay: 0.4s;

      @media only screen and (max-width: 767px) {
        font-size: 14px;
      }
    }

    .card {
      opacity: 0;
      transform: translateY(50px);
      animation: slideUp 1s ease forwards;
      animation-delay: 0.6s;
      margin-bottom: 16px;
    }
  }

  .addition-text {
    opacity: 0;
    transform: translateY(50px);
    animation: slideUp 1s ease forwards;
    animation-delay: 0.8s;

    span {
      cursor: pointer;
      color: var(--accent-color);
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
</style>
