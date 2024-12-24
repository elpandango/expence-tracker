import { useI18n } from 'vue-i18n';

export const useCurrencyFormatter = () => {
  const { locale } = useI18n();

  const formatCurrency = (amount: number, currencyCode: string): string => {
    const formatter = new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: currencyCode,
    });

    return formatter.format(amount);
  };

  return { formatCurrency };
};
