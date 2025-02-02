<template>
  <div
   ref="dropdown"
   class="avatar-dropdown">
    <div
     class="avatar"
     @click="toggleDropdown">
      <img
       v-if="userStore.avatar"
       :src="userStore.avatar"
       alt="User Avatar"
       class="avatar-image">
      <div
       v-else
       class="avatar-placeholder"/>
    </div>

    <div
     v-if="isOpen"
     class="dropdown-menu">
      <NuxtLink
       to="/profile"
       class="menu-item"
       @click="closeMenu">
        <span class="icon material-symbols-outlined">account_circle</span>
        {{ $t('components.menuList.profile') }}
      </NuxtLink>
      <div
       class="menu-item"
       @click="handleLogout">
        <span class="icon material-symbols-outlined">logout</span>
        Logout
      </div>
    </div>
  </div>
</template>

<script
 lang="ts"
 setup>
import {ref} from 'vue';
import {useUserStore} from '~/stores/user';
import {useAuthStore} from "~/stores/auth";

const userStore = useUserStore();
const authStore = useAuthStore();
const isOpen = ref(false);
const dropdown = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
  } catch (error) {
    console.log(`Logout failed: ${error.message}`);
  }
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleClickOutside = (event: event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style
 scoped
 src="./styles.scss"
 lang="scss">
</style>
