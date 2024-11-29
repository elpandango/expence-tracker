<template>
  <header class="site-header">
    <div class="header-content">
      <div class="greeting-block">Good {{timeOfDay}}, {{userStore.user.name}}!</div>
      <div class="actions-block">
        <div class="search-block">
          <FloatLabelInput
           v-model="searchValue"
           size="medium"
           label="Search transaction"/>
        </div>
        <div class="avatar">
          <img
           v-if="userStore.user.avatar"
           :src="userStore.user.avatar"
           alt="User Avatar"
           class="avatar-image"/>
          <div
           v-else
           class="avatar-placeholder">
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import {ref} from 'vue';
import {useUserStore} from '~/stores/user';
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";

const userStore = useUserStore();
const searchValue = ref('');

const timeOfDay = computed(() => {
  const hours = new Date().getHours();

  if (hours >= 5 && hours < 12) {
    return 'Morning';
  } else if (hours >= 12 && hours < 18) {
    return 'Afternoon';
  } else {
    return 'Evening';
  }
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>
