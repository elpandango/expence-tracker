import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export const useSeoConfig = () => {
  const domain = 'https://expence-tracker-nu.vercel.app';
  const { t } = useI18n();
  const route = useRoute();
  const currentUrl = computed(() => {
    if (process.client) {
      return `${window.location.origin}${route.fullPath}`;
    }
    return `${domain}${route.fullPath}`;
  });

  return computed(() => {
    const routeName = route.name?.toString() || 'index';

    return {
      title: t(`seo.${routeName}.title`),
      description: t(`seo.${routeName}.description`),
      ogTitle: t(`seo.${routeName}.ogTitle`),
      ogDescription: t(`seo.${routeName}.ogDescription`),
      ogImage: domain + t(`seo.${routeName}.ogImage`),
      ogUrl: currentUrl.value,
      twitterTitle: t(`seo.${routeName}.twitterTitle`),
      twitterDescription: t(`seo.${routeName}.twitterDescription`),
      twitterImage: domain + t(`seo.${routeName}.twitterImage`),
      twitterCard: t(`seo.${routeName}.twitterCard`),
    };
  });
};
