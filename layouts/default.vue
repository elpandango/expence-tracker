<template>
  <div class="page-content">
    <Sidebar/>
    <div class="main-content">
      <div class="content">
        <SiteHeader/>
        <main></main>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import '~/assets/scss/global.scss';
import {useUserStore} from '~/stores/user';

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  if (userStore.loading) {
    await userStore.checkAuth();
  }

  if (!userStore.isLoggedIn) {
    await router.push('/auth');
  }
});
</script>

<style
 scoped
 lang="scss">
.page-content {
  display: flex;
  flex-wrap: wrap;
}
</style>
