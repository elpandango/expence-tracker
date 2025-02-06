<template>
  <div class="auth-page flex items-center justify-center flex-wrap w-full min-h-screen bg-[#dae0e0]">
    <Preloader
     v-if="uiStore.state.isLoading"
     height="50vh"/>
    <div
     v-else
     class="intro-block w-full max-w-[700px] min-h-[80vh] text-center pt-5 md:pt-0">
      <div class="block-text px-4">
        <img
         class="main-img m-auto mb-4 w-20 h-20 md:w-36 md:h-36 rounded-lg"
         src="/images/logo_small.png"
         alt="Expendango logo"
         width="150"
         height="150">
        <h1 class="text-2xl md:text-4xl font-semibold mb-4">Welcome to Expendango</h1>
        <h3 class="font-semibold text-md md:text-lg mb-4 text-blue-600">Track your expenses, manage your income, and take control of
          your finances with ease. Empowering your
          financial goals, one step at a time.</h3>
      </div>

      <div class="m-auto p-4 space-y-4">
        <Card class="py-2">
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
          <p v-if="isLogin">Don't have an account? <span
           class="cursor-pointer text-blue-600"
           @click="toggleForm">Sign up!</span></p>
          <p v-else>Already have an account? <span
           class="cursor-pointer text-blue-600"
           @click="toggleForm">Login!</span></p>
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
  h1 {
    transform: translateY(50px);
    animation: slideUp 1s ease forwards;
    opacity: 0;
  }

  h3 {
    transform: translateY(50px);
    animation: slideUp 1s ease forwards;
    animation-delay: 0.2s;
    opacity: 0;
  }

  .card {
    opacity: 0;
    transform: translateY(50px);
    animation: slideUp 1s ease forwards;
    animation-delay: 0.6s;
    margin-bottom: 16px;
  }

  .addition-text {
    opacity: 0;
    transform: translateY(50px);
    animation: slideUp 1s ease forwards;
    animation-delay: 0.8s;
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
