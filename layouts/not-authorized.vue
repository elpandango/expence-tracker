<template>
  <div>
    <slot></slot>
  </div>
</template>

<script
 setup
 lang="ts">
import { useUserStore } from '~/stores/user';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/');
  }
});
</script>

<style>

</style>