import {defineStore} from 'pinia';

export const useStorePosts = defineStore({
  id: 'storePosts',
  state: () => ({
    posts: [],
    currentPost: {},
  }),
  actions: {
    populateCurrentPost(post: any): void {
      this.$patch({currentPost: {...post}});
    },
    cleanCurrentPost(): void {
      this.$patch({currentPost: {}});
    },
  },
  getters: {
    getCurrentPost: (state: any) => state.currentPost,
  }
})
