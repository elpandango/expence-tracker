<template>
  <div
   class="card"
   :class="props.class"
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
  }
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>