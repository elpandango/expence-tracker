<template>
  <div class="cards-page">
    <h1>Settings</h1>
  </div>
</template>

<script
 setup
 lang="ts">

import {useSeoConfig} from "~/use/useSeoConfig";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

</script>

<style
 lang="scss">
</style>