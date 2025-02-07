<template>
  <header class="site-header min-h-[50px] mb-3 md:mb-6">
    <div class="header-content flex items-center justify-between w-full flex-wrap md:flex-nowrap">
      <div class="hidden md:block font-semibold text-lg">{{ timeOfDay }}, {{
          userStore.user.name
        }}!
      </div>

      <div class="actions-block w-full md:w-auto flex items-center justify-end md:justify-end">
        <NuxtLink
         to='/'
         class="logo flex md:hidden items-center text-decoration-none flex-1 md:flex-auto">
          <div
           class="logo-img w-8 h-8 rounded-lg bg-cover bg-center bg-no-repeat mr-2 bg-[url(/images/logo.png)]"></div>
          <div class="brand-name font-semibold text-blue-600 text-md">Expendango</div>
        </NuxtLink>
        <div
         v-if="!isTransactionsPage"
         class="hidden md:block relative w-[400px] mr-5">
          <BaseInput
           v-model="searchValue"
           size="medium"
           :placeholder="$t('components.header.searchInputPlaceholder')"
           @keydown.enter="searchTransactions"/>
          <span
           class="icon material-symbols-outlined absolute z-20 top-3 right-3 cursor-pointer"
           @click="searchTransactions">search</span>
        </div>

        <LanguageTrigger/>

        <AvatarDropdown/>

        <button
         class="menu-button block md:hidden text-3xl p-0 cursor-pointer "
         aria-label="Toggle menu"
         @click="toggleMenu">
          <span class="material-symbols-outlined">
            {{ menuOpen ? 'close' : 'menu' }}
            </span>
        </button>
      </div>
    </div>

    <div
     class="mobile-menu flex sm:hidden md:hidden flex-col items-start shadow-lg bg-bg transition-all duration-300 border-[1px] border-stone-200 dark:border-neutral-600 absolute h-[calc(100vh-80px)] top-[79px] right-2.5 left-2.5 sm:w-[250px] sm:left-auto"
     :class="{'hidden md:block': !menuOpen}">
      <div class="user-info flex w-full mb-5 pt-4 pr-2.5 pb-0 pl-2.5">
        <img
         v-if="userStore.avatar"
         :src="userStore.avatar"
         alt="User Avatar"
         class="avatar-image w-12 h-12 rounded-full object-cover">
        <div class="user-name flex items-center font-semibold ml-3">{{ userStore.user.name }}</div>
      </div>

      <div
       v-if="!isTransactionsPage"
       class="w-full px-4 mb-3 relative hidden: md:block">
        <BaseInput
         v-model="searchValue"
         size="medium"
         placeholder="Search transaction"
         @keydown.enter="searchTransactions"/>
        <span
         class="icon material-symbols-outlined absolute z-20 top-3 right-6 cursor-pointer"
         @click="searchTransactions">search</span>
      </div>

      <div class="header-menu w-full">
        <NuxtLink
         to="/"
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">home</span>
          {{ $t('components.menuList.dashboard') }}
        </NuxtLink>
        <NuxtLink
         to="/accounts"
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/accounts' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">credit_card</span>
          {{ $t('components.menuList.myCards') }}
        </NuxtLink>
        <NuxtLink
         to="/transactions"
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/transactions' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">swap_horiz</span>
          {{ $t('components.menuList.transactions') }}
        </NuxtLink>
        <NuxtLink
         to="/statistics"
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/statistics' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">bar_chart</span>
          {{ $t('components.menuList.statistics') }}
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/profile' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">account_circle</span>
          {{ $t('components.menuList.profile') }}
        </NuxtLink>
        <button
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         @click="handleNewExpense">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">attach_money</span>
          {{ $t('components.menuList.addExpense') }}
        </button>

        <NuxtLink
         to="/categories"
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/categories' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">category</span>
          {{ $t('components.menuList.categories') }}
        </NuxtLink>
        <div
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         @click="toggleTheme">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">{{
              isDark ? 'light_mode' : 'dark_mode'
            }}</span>
          {{ $t('components.menuList.theme') }}
        </div>

        <button
         class="menu-link flex items-center w-full px-3 py-2 text-[16px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         @click="handleLogout">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">logout</span>
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import {ref} from 'vue';
import {useRoute, useRouter} from "vue-router";
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

<style>
</style>
