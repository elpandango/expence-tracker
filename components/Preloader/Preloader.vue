<template>
  <div
class="preloader-layout"
       :class="isFullSize ? 'full-page' : ''"
       :style="{height: height}">
    <svg class="loader" viewBox="0 0 24 24">
      <circle class="loader__value" cx="12" cy="12" r="10"/>
      <circle class="loader__value" cx="12" cy="12" r="10"/>
      <circle class="loader__value" cx="12" cy="12" r="10"/>
      <circle class="loader__value" cx="12" cy="12" r="10"/>
      <circle class="loader__value" cx="12" cy="12" r="10"/>
      <circle class="loader__value" cx="12" cy="12" r="10"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: "Preloader",
  props: {
    height: {
      type: String,
      default: '250px'
    },
    isFullSize: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped src="./styles.scss" lang="scss"></style>
