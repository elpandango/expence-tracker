import { ref, computed, watch } from 'vue';

export function useTheme() {
  const theme = ref('light');

  if (import.meta.client) {
    theme.value = localStorage.getItem('theme') || 'light';
  }

  const isDark = computed(() => theme.value === 'dark');

  const toggleTheme = () => {
    theme.value = isDark.value ? 'light' : 'dark';
  };

  watch(theme, (newTheme) => {
    if (import.meta.client) {
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  }, { immediate: true });

  return { theme, isDark, toggleTheme };
}