<template>
  <div class="language-switcher">
    <select
     v-model="currentLocale"
     @change="handleLocaleChange">
      <option
       v-for="locale in locales"
       :key="locale.code"
       :value="locale.code">
        {{ locale.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import {useI18n} from 'vue-i18n';
import {useLocaleSwitcher} from "~/use/useLocaleSwitcher";

const {locale} = useI18n();

const locales = [
  {code: 'en', name: 'English'},
  {code: 'ru', name: 'Русский'},
  {code: 'de', name: 'Deutsch'},
];

const currentLocale = ref(locale.value);

const {setLocale} = useLocaleSwitcher();

const handleLocaleChange = (newLocale) => {
  setLocale(newLocale.target.value);
};
</script>

<style scoped>
.language-switcher select {
  padding: 5px;
  font-size: 14px;
}
</style>
