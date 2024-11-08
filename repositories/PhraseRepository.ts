export default {
  async get() {
    return $fetch('/api/get-phrase');
  },
};
