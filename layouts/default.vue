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

const router = useRouter();

onMounted(async() => {
  const userEmail = localStorage.getItem('userEmail');

  if (!userEmail) {
    router.push('/auth');
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
