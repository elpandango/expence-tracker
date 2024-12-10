<template>
  <header class="site-header">
    <div class="header-content">
      <div class="greeting-block">Good {{ timeOfDay }}, {{ userStore.user.name }}!</div>

      <div class="actions-block">
        <div
         class="search-block"
         v-if="!isTransactionsPage">
          <BaseInput
           v-model="searchValue"
           size="medium"
           placeholder="Search transaction"
           @keydown.enter="searchTransactions"/>
          <span class="icon material-symbols-outlined"
                @click="searchTransactions">search</span>
        </div>

        <div class="avatar">
          <img
           v-if="userStore.user.avatar"
           :src="userStore.user.avatar"
           alt="User Avatar"
           class="avatar-image"/>
          <div
           v-else
           class="avatar-placeholder"></div>
        </div>

        <LanguageTrigger />

        <button
         class="menu-button"
         @click="toggleMenu"
         aria-label="Toggle menu">
          <span class="material-symbols-outlined">
            {{ menuOpen ? 'close' : 'menu' }}
            </span>
        </button>
      </div>
    </div>

    <div
     class="mobile-menu"
     :class="{active: menuOpen}">
      <div class="user-info">
        <img
         v-if="userStore.user.avatar"
         :src="userStore.user.avatar"
         alt="User Avatar"
         class="avatar-image"/>
        <div class="user-name">{{ userStore.user.name }}</div>
      </div>

      <div
       class="search-block"
       v-if="!isTransactionsPage">
        <BaseInput
         v-model="searchValue"
         size="medium"
         placeholder="Search transaction"
         @keydown.enter="searchTransactions"/>
        <span class="icon material-symbols-outlined"
              @click="searchTransactions">search</span>
      </div>

      <div class="header-menu">
        <NuxtLink
         to="/"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">home</span>
          Dashboard
        </NuxtLink>
        <NuxtLink
         to="/cards"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">credit_card</span>
          My Cards
        </NuxtLink>
        <NuxtLink
         to="/transactions"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">swap_horiz</span>
          Transactions
        </NuxtLink>
        <NuxtLink
         to="/statistics"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">bar_chart</span>
          Statistics
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">account_circle</span>
          Profile
        </NuxtLink>
        <button
         class="menu-link"
         @click="handleNewExpense">
          <span class="icon material-symbols-outlined">attach_money</span>
          Add Expense
        </button>
        <NuxtLink
         to="/categories"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">category</span>
          Categories
        </NuxtLink>
        <NuxtLink
         to="/settings"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">settings</span>
          Settings
        </NuxtLink>
        <div
         class="menu-link"
         @click="toggleTheme">
          <span class="icon material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          Theme
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import {ref} from 'vue';
import {useRoute} from "vue-router";
import {useRouter} from 'vue-router';
import {useTheme} from "~/use/useTheme";
import {useUIStore} from "~/stores/ui";
import {useUserStore} from '~/stores/user';
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";

const uiStore = useUIStore();
const userStore = useUserStore();
const searchValue = ref('');
const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);

const {isDark, toggleTheme} = useTheme();

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

const isTransactionsPage = computed(() => route.path === '/transactions');

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const handleNewExpense = () => {
  uiStore.openAddExpenseModal();
  closeMenu();
};

const handleClickOutside = (event) => {
  const menu = document.querySelector('.mobile-menu');
  const menuButton = document.querySelector('.menu-button');

  if (menuOpen.value && !menu.contains(event.target) && !menuButton.contains(event.target)) {
    closeMenu();
  }
};

const searchTransactions = () => {
  if (searchValue.value.trim()) {
    router.push({
      path: '/transactions',
      query: {description: searchValue.value.trim()}
    });
    searchValue.value = '';
  }
  closeMenu();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>
