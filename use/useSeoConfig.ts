import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export const useSeoConfig = () => {
  const { t } = useI18n();
  const route = useRoute();

  const currentUrl = computed(() => {
    const baseUrl = process.client ? window.location.origin : 'https://expence-tracker-nu.vercel.app';
    return `${baseUrl}${route.fullPath}`;
  });

  return computed(() => {
    const routeName = route.name?.toString() || 'index';

    const ogImageUrl = t(`seo.${routeName}.ogImage`);
    const twitterImageUrl = t(`seo.${routeName}.twitterImage`);

    return {
      title: t(`seo.${routeName}.title`),
      description: t(`seo.${routeName}.description`),
      ogTitle: t(`seo.${routeName}.ogTitle`),
      ogDescription: t(`seo.${routeName}.ogDescription`),
      ogImage: ogImageUrl ? `${window.location.origin}${ogImageUrl}` : null,
      ogUrl: currentUrl.value,
      twitterTitle: t(`seo.${routeName}.twitterTitle`),
      twitterDescription: t(`seo.${routeName}.twitterDescription`),
      twitterImage: twitterImageUrl ? `${window.location.origin}${twitterImageUrl}` : null,
      twitterCard: 'summary_large_image',
    };
  });
};
