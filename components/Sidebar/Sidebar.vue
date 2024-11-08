<template>
  <aside class="sidebar">
    <div class="top-block">
      <div class="logo">logo</div>
      <div class="sidebar-menu">
        <NuxtLink
         to="/"
         class="menu-link">Dashboard
        </NuxtLink>
        <NuxtLink
         to="/"
         class="menu-link">Card
        </NuxtLink>
        <NuxtLink
         to="/"
         class="menu-link">Payment
        </NuxtLink>
        <NuxtLink
         to="/"
         class="menu-link">Statistics
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link">Profile
        </NuxtLink>
      </div>
    </div>
    <div class="bottom-block">
      <NuxtLink
       to="/"
       class="menu-link">Settings
      </NuxtLink>
      <button @click="toggleTheme">
        {{ isDark ? '🌞 Светлая тема' : '🌙 Тёмная тема' }}
      </button>
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
 lang="scss">
.sidebar {
  width: 250px;
  height: 100vh;
  padding: 20px 14px 20px 0;
  background-color: var(--bg-color);
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: space-between;

  .top-block {
    display: flex;
    flex-wrap: wrap;
  }

  .sidebar-menu {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  .menu-link {
    display: flex;
    width: 100%;
    height: 36px;
    align-items: center;
    background-color: transparent;
    padding: 0 16px;
    transition: background-color .3s;

    &:hover, &.active {
      background-color: var(--card-bg-color);
    }
  }

  .logo {
    margin-bottom: 60px;
  }
}
</style>