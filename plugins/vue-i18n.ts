import { createI18n } from 'vue-i18n';
import { useCookie } from '#app';
import {de} from '~/locales/de';
import {en} from '~/locales/en';
import {ru} from '~/locales/ru';
import {ua} from '~/locales/ua';

export default defineNuxtPlugin(({ vueApp }) => {
  const localeCookie = useCookie('locale');
  const defaultLocale = 'en';

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: localeCookie.value || defaultLocale,
    messages: {
      en,
      ru,
      de,
      ua
    }
  });

  vueApp.use(i18n);
});