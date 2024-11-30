<template>
  <div
   class="card"
   :class="[props.class, withScroll ? 'with-scroll' : '']"
   :style="{maxWidth}">
    <slot></slot>
  </div>
</template>

<script
 setup
 lang="ts">
const props = defineProps({
  class: {
    type: String
  },
  maxWidth: {
    type: String,
    default: '100%'
  },
  withScroll: {
    type: Boolean,
    default: false
  }
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>