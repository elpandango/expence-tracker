<template>
  <div class="page-content">
    <Sidebar/>
    <div class="main-content">
      <div class="content">
        <SiteHeader/>
        <main></main>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import '~/assets/scss/global.scss';
</script>

<style
 scoped
 lang="scss">
.page-content {
  display: flex;
  flex-wrap: wrap;
}
</style>
