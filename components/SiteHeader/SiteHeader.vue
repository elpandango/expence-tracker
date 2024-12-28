<template>
  <header class="site-header">
    <div class="header-content">
      <div class="greeting-block">{{ timeOfDay }}, {{ userStore.user.name }}!</div>

      <div class="actions-block">
        <div class="logo">
          <div class="logo-img"></div>
          <div class="brand-name">Expendango</div>
        </div>
        <div
         class="search-block"
         v-if="!isTransactionsPage">
          <BaseInput
           v-model="searchValue"
           size="medium"
           :placeholder="$t('components.header.searchInputPlaceholder')"
           @keydown.enter="searchTransactions"/>
          <span
           class="icon material-symbols-outlined"
           @click="searchTransactions">search</span>
        </div>

        <LanguageTrigger/>

        <AvatarDropdown/>

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
        <span
         class="icon material-symbols-outlined"
         @click="searchTransactions">search</span>
      </div>

      <div class="header-menu">
        <NuxtLink
         to="/"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">home</span>
          {{ $t('components.menuList.dashboard') }}
        </NuxtLink>
        <NuxtLink
         to="/accounts"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">credit_card</span>
          {{ $t('components.menuList.myCards') }}
        </NuxtLink>
        <NuxtLink
         to="/transactions"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">swap_horiz</span>
          {{ $t('components.menuList.transactions') }}
        </NuxtLink>
        <NuxtLink
         to="/statistics"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">bar_chart</span>
          {{ $t('components.menuList.statistics') }}
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">account_circle</span>
          {{ $t('components.menuList.profile') }}
        </NuxtLink>
        <button
         class="menu-link"
         @click="handleNewExpense">
          <span class="icon material-symbols-outlined">attach_money</span>
          {{ $t('components.menuList.addExpense') }}
        </button>

        <NuxtLink
         to="/categories"
         class="menu-link"
         @click="closeMenu">
          <span class="icon material-symbols-outlined">category</span>
          {{ $t('components.menuList.categories') }}
        </NuxtLink>
        <div
         class="menu-link"
         @click="toggleTheme">
          <span class="icon material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          {{ $t('components.menuList.theme') }}
        </div>

        <button
         class="menu-link"
         @click="handleLogout">
          <span class="icon material-symbols-outlined">logout</span>
          Logout
        </button>
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
import {useFinanceStore} from "~/stores/finance";
import {useAuthStore} from "~/stores/auth";
import {useI18n} from 'vue-i18n';

const BaseInput = defineAsyncComponent(() => import('~/components/Forms/Inputs/BaseInput.vue'));

const {t} = useI18n();
const financeStore = useFinanceStore();
const authStore = useAuthStore();
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
    return t('greetings.morning');
  } else if (hours >= 12 && hours < 18) {
    return t('greetings.afternoon');
  } else {
    return t('greetings.evening');
  }
});

const isTransactionsPage = computed(() => route.path === '/transactions');

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
  document.body.classList.toggle('no-scroll', menuOpen.value);
};

const closeMenu = () => {
  menuOpen.value = false;
  document.body.classList.toggle('no-scroll', false);
};

const handleNewExpense = () => {
  financeStore.resetEditingTransaction();
  uiStore.toggleModal('isAddExpenseModalOpen', true);
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

const handleLogout = async () => {
  try {
    await authStore.logout();
  } catch (error) {
    console.log(`Logout failed: ${error.message}`);
  }
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
