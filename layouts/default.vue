<template>
  <div
   class="page-content">
    <Sidebar/>
    <transition name="toast-fade">
      <Toast
       v-if="uiStore.state?.toast?.message"
       :message="uiStore.state.toast.message"
       :type="uiStore.state.toast.type"
       :duration="3000"
      />
    </transition>
    <div class="main-content">
      <div class="content">
        <template v-if="!uiStore.state.isAuthLoading">
          <SiteHeader/>
          <main></main>
          <slot></slot>

          <template v-if="isAddExpenseModalOpen || isAddFundsModalOpen">
            <AddEditTransactionModal
             :transaction-type="isAddExpenseModalOpen ? 'addExpense' : 'addFunds'"
             :isOpen="isAddExpenseModalOpen ? isAddExpenseModalOpen : isAddFundsModalOpen"
             @close="() => closeModal(isAddExpenseModalOpen ? 'expense' : 'funds')"
             @update:isOpen="(value) => isAddExpenseModalOpen ? (isAddExpenseModalOpen = value) : (isAddFundsModalOpen = value)"
            />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import '~/assets/scss/global.scss';
import {useUserStore} from '~/stores/user';
import {useUIStore} from "~/stores/ui";
import AddEditTransactionModal from "~/components/Modals/AddEditTransactionModal.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

onBeforeMount(async () => {
  if (uiStore.state.isAuthLoading) {
    await userStore.checkAuth();
  }

  await nextTick();

  if (!userStore.isLoggedIn) {
    return router.push('/auth');
  }

  if (userStore.isLoggedIn && route.path === '/auth') {
    return router.push('/');
  }
});

const isAddExpenseModalOpen = computed(() => uiStore.isAddExpenseModalOpen);
const isAddFundsModalOpen = computed(() => uiStore.isAddFundsModalOpen);

const closeModal = (name?: string) => {
  if (name === 'expense') {
    uiStore.closeAddExpenseModal();
  } else {
    uiStore.closeAddFundsModal();
  }
};
</script>

<style
 lang="scss">
.page-content {
  display: flex;
  flex-wrap: wrap;

  @media only screen and (min-width: 2501px) {
    max-width: 1920px;
    margin: 0 auto;
    position: relative;
  }
}

</style>
