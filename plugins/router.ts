export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:finish', () => {
    window.scrollTo(0, 0);

    const mainContent = document.querySelector('.main-content');
    if (mainContent instanceof HTMLElement) {
      mainContent.scrollTo({top: 0, left: 0, behavior: 'auto'});
    }
  });
});
