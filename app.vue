<template>
  <SvgSprite/>
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

// useHead({
//   link: [
//     {rel: 'icon', href: '/favicons/favicon-32x32.png', sizes: '32x32'},
//     {rel: 'icon', href: '/favicons/favicon-16x16.png', sizes: '16x16'},
//     {rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png', sizes: '180x180'},
//     {rel: 'manifest', href: '/favicons/site.webmanifest'},
//     {rel: 'mask-icon', href: '/favicons/safari-pinned-tab.svg', color: '#5bbad5'},
//     {rel: 'icon', type: 'image/png', href: '/favicons/android-chrome-192x192.png', sizes: '192x192'},
//     {rel: 'icon', type: 'image/png', href: '/favicons/android-chrome-512x512.png', sizes: '512x512'},
//   ],
//   meta: [
//     {name: 'theme-color', content: '#ffffff'},
//     {name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent'}
//   ]
// })
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