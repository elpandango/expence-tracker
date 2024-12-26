<template>
  <PreloaderBrand v-if="uiStore.state.isAuthLoading"/>
  <div>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<script
 setup
 lang="ts">
import {useUIStore} from "~/stores/ui";
import {useSeoConfig} from "~/use/useSeoConfig";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

useHead({
  link: [
    {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined'},
    {rel: 'icon', type: 'image/png', href: '/favicons/favicon-96x96.png', sizes: '96x96'},
    {rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg'},
    {rel: 'shortcut icon', href: '/favicons/favicon.ico'},
    {rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png', sizes: '180x180'},
    {rel: 'manifest', href: '/favicons/site.webmanifest'}
  ],
  meta: [
    {name: 'msapplication-TileColor', content: '#ffffff'},
    {name: 'msapplication-TileImage', content: '/ms-icon-144x144.png'},
    {name: 'theme-color', content: '#ffffff'}
  ]
});

const uiStore = useUIStore();

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