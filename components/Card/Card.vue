<template>
  <div class="card">
    <slot></slot>
  </div>
</template>

<script
 setup
 lang="ts">

</script>

<style
 lang="scss">
.card {
  padding: 20px;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
}
</style>