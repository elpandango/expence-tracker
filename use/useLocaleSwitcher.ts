import { useCookie } from '#app';
import { useI18n } from 'vue-i18n';

export function useLocaleSwitcher() {
  const { locale } = useI18n();
  const localeCookie = useCookie('locale');

  const setLocale = (newLocale: string) => {
    locale.value = newLocale;
    localeCookie.value = newLocale;
  };

  return { setLocale };
}
