<template>
  <div>
    <h1>Manage Categories</h1>

    <form @submit.prevent="addCategory">
      <input
       v-model="newCategoryName"
       placeholder="New Category"
       required/>
      <button type="submit">Add Category</button>
    </form>

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
import {emitter} from "~/classes/uiEventBus";
import {useCategoryStore} from "~/stores/category";
import {useUIStore} from "~/stores/ui";

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
