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
  background-color: var(--card-bg-color);
  border-style: var(--border-style);
  border-width: var(--border-width);
  border-color: var(--border-color);
}
</style>