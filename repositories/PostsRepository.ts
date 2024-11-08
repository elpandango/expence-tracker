export default {
    async get(query: string) {
        if (!query) {
            return $fetch('/api/get-posts');
        }
        return $fetch(`/api/get-posts?${query}`);
    },
    async getPost(id: string) {
        return await $fetch(`/api/post/${id}`);
    },
    async add(payload: FormData) {
        return await $fetch('/api/post', {
            method: 'POST',
            body: payload,
        });
    },
    async editPost(id: string, payload: FormData) {
        return await $fetch(`/api/edit-post/${id}`, {
            method: 'PUT',
            body: payload,
        });
    },
    async delete(id: string) {
        return await $fetch(`/api/post/${id}`, {
            method: 'delete'
        });
    },
};
