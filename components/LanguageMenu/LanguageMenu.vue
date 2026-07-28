<template>
  <div class="w-full">
    <div
     v-if="showLabel"
     class="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
      {{ $t('components.menuList.language') }}
    </div>

    <div class="flex flex-wrap gap-1">
      <button
       v-for="language in locales"
       :key="language.value"
       class="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-all duration-300 hover:bg-list-item-bg"
       :class="[
         fullWidth ? 'w-full' : 'min-w-[64px]',
         language.value === locale ? 'bg-list-item-bg text-accent' : ''
       ]"
       @click="handleLocaleChange(language.value)"
      >
        <span>{{ language.label }}</span>
        <span
         v-if="language.value === locale"
         class="material-symbols-outlined text-base"
        >check</span>
      </button>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {useI18n} from 'vue-i18n';
import {useLocaleSwitcher} from "~/use/useLocaleSwitcher";

const props = defineProps({
  fullWidth: {
    type: Boolean,
    default: false,
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['changed']);

const {locale} = useI18n();
const {setLocale} = useLocaleSwitcher();

const locales = [
  {label: 'EN', value: 'en'},
  {label: 'RU', value: 'ru'},
  {label: 'DE', value: 'de'},
  {label: 'UA', value: 'ua'},
];

const handleLocaleChange = (newLocale: string) => {
  if (newLocale === locale.value) {
    emit('changed');
    return;
  }

  setLocale(newLocale);
  emit('changed');
};
</script>

<style>
</style>
