<template>
  <div>
    <transition name="toast-fade">
      <Toast
       v-if="uiStore.state?.toast?.message"
       :message="uiStore.state.toast.message"
       :type="uiStore.state.toast.type"
       :duration="3000"
      />
    </transition>
    <slot></slot>
  </div>
</template>

<script
 setup
 lang="ts">
import { useUserStore } from '~/stores/user';
import {useUIStore} from "~/stores/ui";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

onBeforeMount(async () => {
  if (uiStore.state.isAuthLoading) {
    await userStore.checkAuth();
  }

  await nextTick();

  if (!userStore.isLoggedIn) {
    return router.push('/auth');
  }

  if (userStore.isLoggedIn && route.path === '/auth') {
    return router.push('/');
  }
});
</script>

<style>

</style>