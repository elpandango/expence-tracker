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
import {useUserStore} from '~/stores/user';
import {useSeoConfig} from "~/use/useSeoConfig";
import repositoryFactory from "~/repositories/repositoryFactory";
import Tabs from "~/components/Tabs/Tabs.vue";
import LoginForm from "~/components/Forms/LoginForm/LoginForm.vue";
import RegisterForm from "~/components/Forms/RegisterForm/RegisterForm.vue";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

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