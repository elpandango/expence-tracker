<template>
  <header class="site-header">
    <div class="header-content">
      <div class="greeting-block">Good Morning, Username!</div>
      <div class="actions-block">
        <div class="search-block">
          <FloatLabelInput
           v-model="searchValue"
           size="medium"
           label="Search transaction"/>
        </div>
        <div class="avatar-block">

        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import {ref} from 'vue';
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";

const searchValue = ref('');
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>
