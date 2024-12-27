<template>
  <aside class="sidebar">
    <div class="top-block">
      <div class="logo">
        <div class="logo-img"></div>
        <div class="brand-name">Expendango</div>
      </div>
      <div class="sidebar-menu">
        <NuxtLink
         to="/"
         class="menu-link">
          <span class="icon material-symbols-outlined">home</span>
          {{ $t('components.menuList.dashboard') }}
        </NuxtLink>
        <NuxtLink
         to="/accounts"
         class="menu-link">
          <span class="icon material-symbols-outlined">credit_card</span>
          {{ $t('components.menuList.myCards') }}
        </NuxtLink>
        <NuxtLink
         to="/transactions"
         class="menu-link">
          <span class="icon material-symbols-outlined">swap_horiz</span>
          {{ $t('components.menuList.transactions') }}
        </NuxtLink>
        <NuxtLink
         to="/statistics"
         class="menu-link">
          <span class="icon material-symbols-outlined">bar_chart</span>
          {{ $t('components.menuList.statistics') }}
        </NuxtLink>
        <NuxtLink
         to="/profile"
         class="menu-link">
          <span class="icon material-symbols-outlined">account_circle</span>
          {{ $t('components.menuList.profile') }}
        </NuxtLink>

        <button
         v-if="financeStore.accountsList && financeStore.accountsList.length"
         class="menu-link"
         @click="handleNewExpense">
          <span class="icon material-symbols-outlined">attach_money</span>
          {{ $t('components.menuList.addExpense') }}
        </button>

        <button
         v-else
         class="menu-link"
         @click="handleCreateTestData">
          <span class="icon material-symbols-outlined">auto_mode</span>
          {{ $t('components.accountsPage.generateBtnText') }}
        </button>

        <NuxtLink
         to="/categories"
         class="menu-link">
          <span class="icon material-symbols-outlined">category</span>
          {{ $t('components.menuList.categories') }}
        </NuxtLink>
      </div>
    </div>
    <div class="bottom-block">
      <div
       class="menu-link"
       @click="toggleTheme">
        <ClientOnly>
          <span class="icon material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
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
import {emitter} from "~/classes/uiEventBus";
import {useGenerateTestData} from "~/use/useGenerateTestData";

const {isDark, toggleTheme} = useTheme();
const {generateTestData} = useGenerateTestData();
const financeStore = useFinanceStore();
const uiStore = useUIStore();
const handleNewExpense = () => {
  financeStore.resetEditingTransaction();
  uiStore.toggleModal('isAddExpenseModalOpen', true);
}

const handleCreateTestData = async () => {
  emitter.emit('ui:startLoading', 'default');
  await generateTestData();
  emitter.emit('ui:stopLoading', 'default');
  window.location.reload();
};
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>