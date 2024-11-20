<template>
  <header class="site-header">
    <div class="header-content">
      <div class="greeting-block">Good Morning, {{userName}}!</div>
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
import {useUserStore} from '~/stores/user';
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";

const userStore = useUserStore();

const userName = ref('');
const searchValue = ref('');

onMounted(() => {
  const storeUser = userStore.getUser;
  userName.value = storeUser.name;
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>
