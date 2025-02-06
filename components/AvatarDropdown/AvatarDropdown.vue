<template>
  <div
   ref="dropdown"
   class="relative">
    <div
     class="hidden md:inline-flex items-center justify-center w-[50px] h-[50px] rounded-full bg-stone-300 cursor-pointer"
     @click="toggleDropdown">
      <img
       v-if="userStore.avatar"
       :src="userStore.avatar"
       alt="User Avatar"
       class="object-cover w-full h-full rounded-full">
      <div
       v-else
       class="w-full h-full border-gray-500 rounded-full"/>
    </div>

    <div
     v-if="isOpen"
     class="dropdown-menu absolute rounded-xl shadow-lg bg-card-bg top-[50px] right-0 w-[150px] p-2 px-1 z-[1000] flex flex-wrap gap-0.5">
      <NuxtLink
       to="/profile"
       class="flex w-full items-center cursor-pointer no-underline py-1.5 transition duration-300 hover:bg-list-item-bg"
       @click="closeMenu">
        <span class="icon material-symbols-outlined mr-3">account_circle</span>
        {{ $t('components.menuList.profile') }}
      </NuxtLink>
      <div
       class="flex w-full items-center cursor-pointer no-underline py-1.5 transition duration-300 hover:bg-list-item-bg"
       @click="handleLogout">
        <span class="icon material-symbols-outlined mr-3">logout</span>
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

<style>
</style>
