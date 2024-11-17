<template>
  <div class="auth-page">
    <div class="auth-forms">
      <Card>
        <Tabs :tabs="tabs">
          <template #login>
            <LoginForm/>
          </template>
          <template #signup>
            <form>
              <RegisterForm/>
            </form>
          </template>
        </Tabs>
      </Card>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import Tabs from "~/components/Tabs/Tabs.vue";
import repositoryFactory from "~/repositories/repositoryFactory";
import LoginForm from "~/components/Forms/LoginForm/LoginForm.vue";
import RegisterForm from "~/components/Forms/RegisterForm/RegisterForm.vue";

definePageMeta({
  layout: 'not-authorized'
});

const router = useRouter();
const email = ref('');
const password = ref('');

const tabs = [
  {id: 'login', label: 'Login', slotName: 'login'},
  {id: 'signup', label: 'Sign Up', slotName: 'signup'},
];

const onLogin = async () => {
  try {
    const response = await repositoryFactory.get('Auth').login({email: email.value, password: password.value});
    // localStorage.setItem('userEmail', email.value);
    // localStorage.setItem('token', response.token);
  } catch (error) {
    console.error(error);
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