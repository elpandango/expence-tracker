<template>
  <aside class="sidebar">
    <div class="top-block">
      <div class="logo">
        <div class="logo-img"></div>
        <div class="brand-name">Expense Tracker</div>
      </div>
      <div class="sidebar-menu">
        <NuxtLink
         to="/"
         class="menu-link">
          <div class="icon"></div>
          Dashboard
        </NuxtLink>
        <NuxtLink
         to="/cards"
         class="menu-link">
          <div class="icon"></div>
          My Cards
        </NuxtLink>
        <NuxtLink
         to="/transactions"
         class="menu-link">
          <div class="icon"></div>
          Transactions
        </NuxtLink>
        <NuxtLink
         to="/statistics"
         class="menu-link">
          <div class="icon"></div>
          Statistics
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link">
          <div class="icon"></div>
          Profile
        </NuxtLink>
      </div>
    </div>
    <div class="bottom-block">
      <NuxtLink
       to="/settings"
       class="menu-link">
        <div class="icon"></div>
        Settings
      </NuxtLink>
      <div
       class="menu-link"
       @click="toggleTheme">
        <div class="icon">{{ isDark ? '🌞' : '🌙' }}</div>
        Theme
      </div>
    </div>
  </aside>
</template>

<script
 setup
 lang="ts">
import {useTheme} from "~/use/useTheme";

const {isDark, toggleTheme} = useTheme();

</script>

<style
 lang="scss"
 src="./styles.scss">
</style>