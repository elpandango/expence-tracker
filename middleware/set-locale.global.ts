import { useCookie } from '#app';

export default defineNuxtRouteMiddleware(() => {
  const localeCookie = useCookie('locale');
  const defaultLocale = 'en';

  if (!localeCookie.value) {
    localeCookie.value = defaultLocale;
  }
});
