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
import {emitter} from "~/classes/uiEventBus";

const Toast = defineAsyncComponent(() => import('~/components/Toast/Toast.vue'));
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();
const isAuthenticated = useCookie('isAuthenticated');

onBeforeMount(async () => {
  if (isAuthenticated.value && uiStore.state.isAuthLoading) {
    await userStore.checkAuth();
  }

  emitter.emit('ui:stopLoading', 'auth');

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