<script setup>
import {ref} from 'vue';
import {useUserStore} from '~/stores/user';
import {useAuthStore} from "~/stores/auth";
import {useI18n} from 'vue-i18n';
import Accordion from "~/components/Accordion/Accordion.vue";
import LanguageMenu from "~/components/LanguageMenu/LanguageMenu.vue";

const {t} = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();
const menuOpen = ref(false);

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

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
  document.body.classList.toggle('no-scroll', menuOpen.value);
};

const closeMenu = () => {
  menuOpen.value = false;
  document.body.classList.toggle('no-scroll', false);
};

const handleClickOutside = (event) => {
  const menu = document.querySelector('.mobile-menu');
  const menuButton = document.querySelector('.menu-button');

  if (menuOpen.value && !menu.contains(event.target) && !menuButton.contains(event.target)) {
    closeMenu();
  }
};

const handleLogout = async () => {
  closeMenu();
  await authStore.logout();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

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
           class="logo-img w-8 h-8 rounded-lg bg-cover bg-center bg-no-repeat mr-2 bg-[url(/images/logo.png)]"/>
          <div class="brand-name font-semibold text-blue-600 text-xl">Expendango</div>
        </NuxtLink>
        <AvatarDropdown/>

        <button
            class="menu-button block md:hidden p-0 cursor-pointer"
            aria-label="Toggle menu"
            @click="toggleMenu"
        >
          <span class="material-symbols-outlined text-3xl">
            {{ menuOpen ? 'close' : 'menu' }}
          </span>
        </button>
      </div>
    </div>

    <div
     class="mobile-menu z-[500] flex sm:hidden md:hidden flex-col items-start shadow-lg bg-bg transition-all duration-300 border-[1px] border-stone-200 dark:border-neutral-600 absolute h-[calc(100vh-80px)] top-[79px] right-2.5 left-2.5 sm:w-[250px] sm:left-auto"
     :class="{'hidden md:block': !menuOpen}">
      <div class="user-info flex w-full mb-5 pt-4 pr-2.5 pb-0 pl-2.5">
        <img
         v-if="userStore.avatar"
         :src="userStore.avatar"
         alt="User Avatar"
         class="avatar-image w-12 h-12 rounded-full object-cover">
        <div class="user-name flex items-center font-semibold ml-3">{{ userStore.user.name }}</div>
      </div>

      <div class="header-menu w-full">
        <NuxtLink
         to="/"
         class="menu-link flex items-center w-full px-3 py-3 text-[18px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">home</span>
          {{ $t('components.menuList.dashboard') }}
        </NuxtLink>
        <NuxtLink
         to="/accounts"
         class="menu-link flex items-center w-full px-3 py-3 text-[18px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/accounts' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">credit_card</span>
          {{ $t('components.menuList.myCards') }}
        </NuxtLink>
        <NuxtLink
         to="/transactions"
         class="menu-link flex items-center w-full px-3 py-3 text-[18px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/transactions' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">swap_horiz</span>
          {{ $t('components.menuList.transactions') }}
        </NuxtLink>
        <NuxtLink
         to="/statistics"
         class="menu-link flex items-center w-full px-3 py-3 text-[18px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/statistics' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">bar_chart</span>
          {{ $t('components.menuList.statistics') }}
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link flex items-center w-full px-3 py-3 text-[18px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/profile' }"
         @click="closeMenu">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">account_circle</span>
          {{ $t('components.menuList.profile') }}
        </NuxtLink>
        <div class="w-full px-3 py-3">
          <Accordion
           class="!rounded-md !shadow-none border-none dark:border-none"
           height="44px"
           header-class="px-0"
           body-class="px-3 py-3"
          >
            <template #header>
              <div class="flex items-center w-full text-[18px] font-medium">
                <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">language</span>
                {{ $t('components.menuList.language') }}
              </div>
            </template>
            <template #accordion-body>
              <LanguageMenu
               :full-width="true"
               :show-label="false"
               @changed="closeMenu"
              />
            </template>
          </Accordion>
        </div>

        <button
         class="menu-link flex items-center w-full px-3 py-3 text-[18px] font-medium  transition-colors duration-300 rounded-md hover:bg-card-bg hover:text-accent router-link-active:bg-card-bg router-link-active:text-accent"
         @click="handleLogout">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">logout</span>
          Logout
        </button>
      </div>
    </div>
  </header>
</template>
