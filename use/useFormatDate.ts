import { useI18n } from 'vue-i18n';

export function useFormatDate(date) {
  const { locale } = useI18n();
  const dateObj = new Date(date);

  return dateObj.toLocaleString(locale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
