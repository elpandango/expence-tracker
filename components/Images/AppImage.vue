<template>
  <img
   :loading="loading ? 'lazy' : 'auto'"
   :class="cssClass"
   :src="src"
   :height="height"
   :width="width"
   :alt="alt"/>
</template>


<script
 setup
 lang="ts">

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Image alt'
  },
  cssClass: {
    type: String
  },
  width: {
    type: String,
    default: '200'
  },
  height: {
    type: String,
    default: '200'
  },
  loading: {
    type: Boolean,
    default: true
  }
});
</script>

<style
 scoped
 lang="scss">
</style>