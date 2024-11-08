<template>
  <div>
    <NavBar/>
    <div class="container">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from "~/components/Navbar/NavBar.vue";

const router = useRouter();

onMounted(async() => {
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    router.push('/admin/auth')
  }
});
</script>

<style>

</style>