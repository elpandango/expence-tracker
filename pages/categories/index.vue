<template>
  <div class="w-full max-w-[1024px] m-auto">
    <h1 class="font-semibold text-3xl mb-4">{{ $t('components.categoriesPage.pageTitleText') }}</h1>

    <div class="flex flex-wrap">
      <Category
       v-for="category in categoryStore.categories"
       :key="category._id"
       :data="category"/>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {onMounted} from 'vue';
import {useCategoryStore} from "~/stores/category";
import {useSeoConfig} from "~/use/useSeoConfig";
import {emitter} from "~/classes/uiEventBus";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const categoryStore = useCategoryStore();

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  await categoryStore.fetchCategoriesIfNeeded();
  emitter.emit('ui:stopLoading', 'default');
});
</script>

<style>
</style>