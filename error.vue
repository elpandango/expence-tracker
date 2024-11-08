<template>
  <NuxtLayout>
    <section>
      <h1>Oops!</h1>
      <h3>{{ props.error.message }}</h3>
    </section>
  </NuxtLayout>
</template>

<script setup>
const props = defineProps({error: Object});
</script>