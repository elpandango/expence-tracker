import { defineStore } from 'pinia';
import { ref } from 'vue';
import repositoryFactory from "~/repositories/repositoryFactory";

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<{ id: string, name: string, icon: string }[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchCategoriesIfNeeded = async () => {
    if (categories.value.length === 0) {
      await fetchCategories();
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await repositoryFactory.get('Category').getAllCategories();
      categories.value = response.categories;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories';
    }
  };

  const addCategory = async (name: string, icon: string) => {
    try {
      const newCategory = await repositoryFactory.get('Category').createCategory({ name, icon });
      categories.value.push(newCategory);
    } catch (err: any) {
      error.value = err.message || 'Failed to add category';
    }
  };

  const updateCategory = async (id: string, name: string, icon: string) => {
    try {
      const updatedCategory = await repositoryFactory.get('Category').updateCategory(id, { name, icon });
      const index = categories.value.findIndex((category) => category.id === id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update category';
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await repositoryFactory.get('Category').deleteCategory(id);
      categories.value = categories.value.filter((category) => category.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete category';
    }
  };

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    fetchCategoriesIfNeeded,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
