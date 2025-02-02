<template>
  <div
   class="card"
   :class="[props.class, withScroll ? 'with-scroll' : '', withHeader ? 'with-header' : '']"
   :style="{maxWidth}">
    <div
     v-if="withHeader"
     class="card-header">
      <slot name="header"/>
    </div>
    <div class="card-content">
      <slot/>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">

const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '100%'
  },
  withScroll: {
    type: Boolean,
    default: false
  },
  withHeader: {
    type: Boolean,
    default: false
  }
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>