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
import Tabs from "~/components/Tabs/Tabs.vue";
import {useUserStore} from '~/stores/user';
import repositoryFactory from "~/repositories/repositoryFactory";
import LoginForm from "~/components/Forms/LoginForm/LoginForm.vue";
import RegisterForm from "~/components/Forms/RegisterForm/RegisterForm.vue";

useSeoMeta({
  title: 'Вход и Регистрация - Expendango',
  description: 'Войдите в Expendango, чтобы управлять своими финансами, или зарегистрируйтесь, чтобы начать пользоваться всеми преимуществами сервиса.',
  ogTitle: 'Вход и Регистрация - Expendango',
  ogDescription: 'Создайте аккаунт в Expendango или войдите, чтобы начать отслеживать свои доходы и расходы с помощью удобного инструмента.',
  ogImage: '/images/expendango-auth.webp',
  twitterTitle: 'Вход и Регистрация - Expendango',
  twitterDescription: 'Начните управлять своими финансами уже сегодня. Зарегистрируйтесь или войдите в Expendango.',
  twitterImage: '/images/expendango-auth.webp',
  twitterCard: 'summary'
});

definePageMeta({
  layout: 'not-authorized'
});

const userStore = useUserStore();
const router = useRouter();

const tabs = [
  {id: 'login', label: 'Login', slotName: 'login'},
  {id: 'signup', label: 'Sign Up', slotName: 'signup'},
];

const handleLogin = async (user: { email: string; password: string }) => {
  try {
    const {status, userId} = await repositoryFactory.get('Auth').login(user);

    if (userId && status === 200) {
      userStore.isLoggedIn = true;
      await router.push('/');
    }
  } catch (error: any) {
    console.log(`Login failed: ${error.message}`);
  }
};

const handleRegister = async (user: any) => {
  try {
    const {status} = await repositoryFactory.get('Auth').register(user);

    if (status === 200) {
      userStore.isLoggedIn = true;
      await router.push('/');
    }
  } catch(error) {
    console.log(error);
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
}
</style>