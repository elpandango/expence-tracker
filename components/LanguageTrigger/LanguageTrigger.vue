<template>
  <div class="language-switcher">

    <Dropdown
     v-model="currLocale"
     :options="locales"
     type="form-dropdown"
     size="medium"
     placeholder="Select language"
     @update:model-value="handleLocaleChange"
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
  {label: 'RU 🇷🇺', value: 'ru'},
  {label: 'DE 🇩🇪', value: 'de'},
  {label: 'UA 🇺🇦', value: 'ua'},
];

const localeFlags: Record<string, string> = {
  en: '🇺🇸',
  ru: '🇷🇺',
  de: '🇩🇪',
  ua: '🇺🇦',
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

<style lang="scss">
.language-switcher {
  width: 90px;
  margin-right: 18px;

  select {
    padding: 5px;
    font-size: 14px;
  }

  .dropdown-toggle {
    @media only screen and (max-width: 767px) {
      height: 40px!important;
    }
  }
}
</style>
