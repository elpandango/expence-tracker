export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.provide('Dropdown', defineAsyncComponent(() => import('~/components/Dropdown/Dropdown.vue')));
});
