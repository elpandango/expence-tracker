<template>
  <div
   class="preloader-layout"
   :class="isFullSize ? 'full-page' : ''"
   :style="{height: height}">
    <svg
     class="loader"
     viewBox="0 0 24 24">
      <circle
       class="loader__value"
       cx="12"
       cy="12"
       r="10"/>
      <circle
       class="loader__value"
       cx="12"
       cy="12"
       r="10"/>
      <circle
       class="loader__value"
       cx="12"
       cy="12"
       r="10"/>
      <circle
       class="loader__value"
       cx="12"
       cy="12"
       r="10"/>
      <circle
       class="loader__value"
       cx="12"
       cy="12"
       r="10"/>
      <circle
       class="loader__value"
       cx="12"
       cy="12"
       r="10"/>
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

<style
 scoped
 lang="scss">
.preloader-layout {
  background-color: transparent;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  &.full-page {
    position: fixed;
    z-index: 1500;
    width: 100%;
    height: 100vh !important;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(255,255,255, 1);
  }
}

.loader {
  animation: loader-turn 1s linear infinite;
  border: none!important;
  max-width: 60px;
  width: 100%;
  height: 50px;
}

@keyframes loader-turn {
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(720deg);
  }
}

.loader__value {
  animation: loader-stroke 6s linear infinite;
  fill: none;
  stroke-dasharray: 63;
  stroke-dashoffset: 63;
  stroke-linecap: round;
  stroke-width: 4;
}

.loader__value:nth-child(1) {
  stroke: rgb(37, 99, 235);
}

.loader__value:nth-child(2) {
  stroke: rgb(37, 99, 235);
  animation-delay: 1s;
}

.loader__value:nth-child(3) {
  stroke: rgb(37, 99, 235);
  animation-delay: 2s;
}

.loader__value:nth-child(4) {
  stroke: rgb(37, 99, 235);
  animation-delay: 3s;
}

.loader__value:nth-child(5) {
  stroke: rgb(37, 99, 235);
  animation-delay: 4s;
}

.loader__value:nth-child(6) {
  stroke: rgb(37, 99, 235);
  animation-delay: 5s;
}

@keyframes loader-stroke {
  8.3333333333% {
    stroke-dashoffset: 0;
  }
  16.6666666667%, 100% {
    stroke-dashoffset: 63;
  }
}

</style>
