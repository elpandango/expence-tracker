<template>
  <div class="language-switcher">

    <Dropdown
     v-model="currLocale"
     :options="locales"
     type="form-dropdown"
     size="medium"
     placeholder="Select language"
     @update:modelValue="handleLocaleChange"
    />

  </div>
</template>

<script
 setup
 lang="ts">
import {useI18n} from 'vue-i18n';
import {useLocaleSwitcher} from "~/use/useLocaleSwitcher";
import Dropdown from "~/components/Dropdown/Dropdown.vue";

const {locale} = useI18n();

const locales = [
  {label: 'EN 🇺🇸', value: 'en'},
  // {label: 'RU 🇷🇺', value: 'ru'},
  {label: 'DE 🇩🇪', value: 'de'},
];

const localeFlags: Record<string, string> = {
  en: '🇺🇸',
  // ru: '🇷🇺',
  de: '🇩🇪',
};

const currentLocale = ref(locale.value);
const currLocale = ref({
  label: `${locale?.value?.toUpperCase()} ${localeFlags[currentLocale.value] || '🇺🇸'}`,
  value: locale.value
});


const {setLocale} = useLocaleSwitcher();

const handleLocaleChange = (newLocale) => {
  setLocale(newLocale.value);
};
</script>

<style scoped>
.language-switcher {
  width: 90px;
  margin-right: 18px;
}
.language-switcher select {
  padding: 5px;
  font-size: 14px;
}
</style>
