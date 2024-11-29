<template>
  <SvgSprite/>
  <PreloaderBrand v-if="!isLoaded"/>
  <div>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<script
 setup
 lang="ts">
import SvgSprite from "~/components/svgComponents/SvgSprite.vue";
import {ref} from "vue";

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
    },
  ],
});

const isLoaded = ref(false);

setTimeout(() => {
  isLoaded.value = true;
}, 1600);

</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0.3;
  filter: grayscale(1);
}
</style>