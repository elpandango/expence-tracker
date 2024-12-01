<template>
  <button
   class="button"
   :type="type"
   :disabled="disabled"
   :class="[size, variant, {'disabled': disabled}]">
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
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<style
 scoped
 src="./styles.scss"
 lang="scss">

</style>
