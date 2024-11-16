<template>
  <button
   class="button"
   :class="[size, type]">
    <slot></slot>
  </button>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: false
  }
});
</script>

<style
 scoped
 src="./styles.scss"
 lang="scss">

</style>
