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

          <template v-if="isAddAccountModalOpen">
            <AddEditAccountModal
             :isOpen="isAddAccountModalOpen"
             @close="closeModal('account')"
             @update:isOpen="isAddAccountModalOpen = $event"
            />
          </template>

          <template v-if="isAddExpenseModalOpen || isAddFundsModalOpen">
            <AddEditTransactionModal
             :transaction-type="isAddExpenseModalOpen ? 'expense' : 'income'"
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

const AddEditAccountModal = defineAsyncComponent(() => import('~/components/Modals/AddEditAccountModal.vue'));
const AddEditTransactionModal = defineAsyncComponent(() => import('~/components/Modals/AddEditTransactionModal.vue'));
const Toast = defineAsyncComponent(() => import('~/components/Toast/Toast.vue'));

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();
const isAuthenticated = useCookie('isAuthenticated');

onBeforeMount(async () => {
  if (!isAuthenticated.value) {
    await router.push('/auth');
  }

  if (isAuthenticated.value && uiStore.state.isAuthLoading) {
    await userStore.checkAuth();
  }

  await nextTick();

  if (!userStore.isLoggedIn) {
    return router.push('/auth');
  }

  if (userStore.isLoggedIn && userStore.user.email === '') {
    await userStore.checkAuth();
  }

  if (userStore.isLoggedIn && route.path === '/auth') {
    return router.push('/');
  }
});

const isAddExpenseModalOpen = computed(() => uiStore.modals.isAddExpenseModalOpen);
const isAddFundsModalOpen = computed(() => uiStore.modals.isAddFundsModalOpen);
const isAddAccountModalOpen = computed(() => uiStore.modals.isAddAccountModalOpen);

const closeModal = (name?: string) => {
  if (name === 'expense') {
    uiStore.toggleModal('isAddExpenseModalOpen', false);
  } else if (name === 'funds') {
    uiStore.toggleModal('isAddFundsModalOpen', false);
  } else {
    uiStore.toggleModal('isAddAccountModalOpen', false);
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
