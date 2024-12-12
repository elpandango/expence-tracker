<template>
  <div class="categories-page">
    <h1>{{ $t('components.categoriesPage.pageTitleText') }}</h1>

    <div class="categories-list">
      <Category
       v-for="category in categoryStore.categories"
       :data="category"
       :key="category._id"/>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {onMounted, ref} from 'vue';
import {useCategoryStore} from "~/stores/category";
import {useUIStore} from "~/stores/ui";
import {useSeoConfig} from "~/use/useSeoConfig";
import {emitter} from "~/classes/uiEventBus";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const categoryStore = useCategoryStore();
const uiStore = useUIStore();

const newCategoryName = ref('');

const addCategory = () => {
  if (newCategoryName.value) {
    // categories.value.push({id: Date.now(), name: newCategoryName.value});
    // newCategoryName.value = '';
  }
};

const editCategory = (category) => {
  const newName = prompt('Edit category name', category.name);
  if (newName) {
    category.name = newName;
  }
};

const deleteCategory = (id) => {
  const index = categories.value.findIndex((category) => category.id === id);
  if (index !== -1) {
    categories.value.splice(index, 1);
  }
};

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  await categoryStore.fetchCategoriesIfNeeded();
  emitter.emit('ui:stopLoading', 'default');
});
</script>

<style
 lang="scss"
 src="./styles.scss"></style>