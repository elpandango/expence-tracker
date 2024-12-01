<template>
  <aside class="sidebar">
    <div class="top-block">
      <div class="logo">
        <div class="logo-img">
          <span class="icon material-symbols-outlined">currency_exchange</span>
        </div>
        <div class="brand-name">Expendango</div>
      </div>
      <div class="sidebar-menu">
        <NuxtLink
         to="/"
         class="menu-link">
          <span class="icon material-symbols-outlined">home</span>
          Dashboard
        </NuxtLink>
        <NuxtLink
         to="/cards"
         class="menu-link">
          <span class="icon material-symbols-outlined">credit_card</span>
          My Cards
        </NuxtLink>
        <NuxtLink
         to="/transactions"
         class="menu-link">
          <span class="icon material-symbols-outlined">swap_horiz</span>
          Transactions
        </NuxtLink>
        <NuxtLink
         to="/statistics"
         class="menu-link">
          <span class="icon material-symbols-outlined">bar_chart</span>
          Statistics
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link">
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
         class="menu-link">
          <span class="icon material-symbols-outlined">category</span>
          Categories
        </NuxtLink>
      </div>
    </div>
    <div class="bottom-block">
      <NuxtLink
       to="/settings"
       class="menu-link">
        <span class="icon material-symbols-outlined">settings</span>
        Settings
      </NuxtLink>
      <div
       class="menu-link"
       @click="toggleTheme">
        <ClientOnly>
          <span class="icon material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </ClientOnly>
        Theme
      </div>
    </div>
  </aside>
</template>

<script
 setup
 lang="ts">
import {useTheme} from "~/use/useTheme";
import {useUIStore} from "~/stores/ui";

const {isDark, toggleTheme} = useTheme();

const uiStore = useUIStore();
const handleNewExpense = () => {
  uiStore.openAddExpenseModal();
}
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>