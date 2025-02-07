interface CategoryResponse {
  name: string;
  icon: string;
}

export default {
  async createCategory(payload: { name: string, icon: string }) {
    try {
      return await $fetch('/api/category', {
        method: 'POST',
        body: payload
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = (error as any).response?._data?.message || 'Category creating failed';
        throw new Error(message);
      }
      throw new Error('Unknown error occurred');
    }
  },
  async updateCategory(categoryId: string, payload: { name: string, icon: string }) {
    const url = `/api/category/${categoryId}`;

    try {
      return await $fetch(url, {
        method: 'PATCH',
        body: payload,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = error?.response?._data?.message || 'Category update failed';
        throw new Error(message);
      }
      throw new Error('Unknown error occurred');
    }
  },
  async deleteCategory(categoryId: string,) {
    const url = `/api/category/${categoryId}`;

    try {
      return await $fetch(url, {
        method: 'DELETE',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = error?.response?._data?.message || 'Category deletion failed';
        throw new Error(message);
      }
      throw new Error('Unknown error occurred');
    }
  },
  async getAllCategories(): Promise<CategoryResponse[]> {
    try {
      return await $fetch('/api/category', {
        method: 'GET',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = error?.response?._data?.message || 'Categories fetching failed';
        throw new Error(message);
      }
      throw new Error('Unknown error occurred');
    }
  },
};
