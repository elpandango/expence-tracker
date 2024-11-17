<template>
  <button
   class="button"
   :type="type"
   :class="[size, variant]">
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
    default: 'button'
  },
  variant: {
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
