<template>
  <teleport to="body">
    <div class="preloader-wrap">
      <div class="loader"/>
    </div>
  </teleport>
</template>

<script setup>

</script>

<style
 scoped
 lang="scss">
.preloader-wrap {
  position: fixed;
  z-index: 15000;
  background-color: #fff;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  width: 80px;
  aspect-ratio: 1;
  border: 10px solid #0000;
  box-sizing: border-box;
  background: radial-gradient(farthest-side, #000 98%, #fff 0) 0 0/20px 20px,
  radial-gradient(farthest-side, #000 98%, #fff 0) 100% 0/20px 20px,
  radial-gradient(farthest-side, #000 98%, #fff 0) 100% 100%/20px 20px,
  radial-gradient(farthest-side, #000 98%, #fff 0) 0 100%/20px 20px,
  linear-gradient(#000 0 0) 50%/40px 40px,
  #fff;
  background-repeat: no-repeat;
  filter: blur(4px) contrast(10);
  animation: l12 0.8s infinite;
}

@keyframes l12 {
  100% {
    background-position: 100% 0, 100% 100%, 0 100%, 0 0, center;
  }
}
</style>
