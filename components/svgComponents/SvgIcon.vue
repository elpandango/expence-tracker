<template>
  <svg
      class="svg-icons"
      :style="{ color }">
    <use :xlink:href="`#${icon}`"/>
  </svg>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String
  }
});
</script>

<style
    scoped
    lang="scss">
svg.svg-icons {
  height: 1em;
  margin-bottom: 0.125em;
  vertical-align: middle;
  width: 1em;
}
</style>
