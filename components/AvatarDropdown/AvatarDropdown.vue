<template>
  <div
   class="avatar-dropdown"
   ref="dropdown">
    <div
     class="avatar"
     @click="toggleDropdown">
      <img
       v-if="userStore.user.avatar"
       :src="userStore.user.avatar"
       alt="User Avatar"
       class="avatar-image"/>
      <div
       v-else
       class="avatar-placeholder"></div>
    </div>

    <div
     v-if="isOpen"
     class="dropdown-menu">
      <NuxtLink
       @click="closeMenu"
       to="/profile"
       class="menu-item">
        <span class="icon material-symbols-outlined">account_circle</span>
        {{ $t('components.menuList.profile') }}
      </NuxtLink>
      <div
       @click="handleLogout"
       class="menu-item">
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

const handleClickOutside = (event: any) => {
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
