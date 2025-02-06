<template>
  <aside class="sidebar fixed flex-wrap flex-col justify-between top-0 left-0 z-10 w-[250px] h-screen bg-bg py-5 pr-3.5 pl-0 hidden md:absolute md:hidden lg:flex">
    <div class="top-block flex flex-wrap">
      <NuxtLink
       to="/"
       class="logo flex items-center p-2 mb-16 no-underline">
        <div class="logo-img w-[50px] h-[50px] flex items-center justify-center rounded-lg mr-4 bg-cover bg-center bg-no-repeat bg-[url(/images/logo.png)]"/>
        <div class="font-semibold text-xl text-blue-600">Expendango</div>
      </NuxtLink>
      <div class="sidebar-menu flex flex-wrap w-full">
        <NuxtLink
         to="/"
         class="menu-link flex w-full h-9 items-center px-4 transition duration-300 rounded-md font-medium text-md cursor-pointer hover:bg-card-bg hover:text-color-600 .active:bg-card-bg .active:text-color-600 router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/' }">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">home</span>
          {{ $t('components.menuList.dashboard') }}
        </NuxtLink>
        <NuxtLink
         to="/accounts"
         class="menu-link flex w-full h-9 items-center px-4 transition duration-300 rounded-md font-medium text-md cursor-pointer hover:bg-card-bg hover:text-color-600 .active:bg-card-bg .active:text-color-600 router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/accounts' }">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">credit_card</span>
          {{ $t('components.menuList.myCards') }}
        </NuxtLink>
        <NuxtLink
         to="/transactions"
         class="menu-link flex w-full h-9 items-center px-4 transition duration-300 rounded-md font-medium text-md cursor-pointer hover:bg-card-bg hover:text-color-600 .active:bg-card-bg .active:text-color-600 router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/transactions' }">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">swap_horiz</span>
          {{ $t('components.menuList.transactions') }}
        </NuxtLink>
        <NuxtLink
         to="/statistics"
         class="menu-link flex w-full h-9 items-center px-4 transition duration-300 rounded-md font-medium text-md cursor-pointer hover:bg-card-bg hover:text-color-600 .active:bg-card-bg .active:text-color-600 router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/statistics' }">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">bar_chart</span>
          {{ $t('components.menuList.statistics') }}
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link flex w-full h-9 items-center px-4 transition duration-300 rounded-md font-medium text-md cursor-pointer hover:bg-card-bg hover:text-color-600 .active:bg-card-bg .active:text-color-600 router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/profile' }">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">account_circle</span>
          {{ $t('components.menuList.profile') }}
        </NuxtLink>

        <button
         class="menu-link flex w-full h-9 items-center px-4 transition duration-300 rounded-md font-medium text-md cursor-pointer hover:bg-card-bg hover:text-color-600 .active:bg-card-bg .active:text-color-600 router-link-active:bg-card-bg router-link-active:text-accent"
         @click="handleNewExpense">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">attach_money</span>
          {{ $t('components.menuList.addExpense') }}
        </button>

        <NuxtLink
         to="/categories"
         class="menu-link flex w-full h-9 items-center px-4 transition duration-300 rounded-md font-medium text-md cursor-pointer hover:bg-card-bg hover:text-color-600 .active:bg-card-bg .active:text-color-600 router-link-active:bg-card-bg router-link-active:text-accent"
         :class="{'bg-card-bg text-accent': $route.path === '/categories' }">
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">category</span>
          {{ $t('components.menuList.categories') }}
        </NuxtLink>
      </div>
    </div>
    <div class="bottom-block">
      <div
       class="menu-link flex w-full h-9 items-center px-4 transition duration-300 rounded-md font-medium text-md cursor-pointer hover:bg-card-bg hover:text-color-600 .active:bg-card-bg .active:text-color-600 router-link-active:bg-card-bg router-link-active:text-accent"
       @click="toggleTheme">
        <ClientOnly>
          <span class="icon material-symbols-outlined w-5 h-5 flex items-center mr-6">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </ClientOnly>
        {{ $t('components.menuList.theme') }}
      </div>
    </div>
  </aside>
</template>

<script
 setup
 lang="ts">
import {useTheme} from "~/use/useTheme";
import {useUIStore} from "~/stores/ui";
import {useFinanceStore} from "~/stores/finance";

const {isDark, toggleTheme} = useTheme();
const financeStore = useFinanceStore();
const uiStore = useUIStore();
const handleNewExpense = () => {
  financeStore.resetEditingTransaction();
  uiStore.toggleModal('isAddExpenseModalOpen', true);
}
</script>

<style>
</style>