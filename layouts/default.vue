<template>
  <div class="page-content flex flex-wrap max-w-full mx-auto relative 2xl:max-w-[1920px] 2xl:mx-auto 2xl:relative">
    <Sidebar/>
    <transition name="toast-fade">
      <Toast
       v-if="uiStore.state?.toast?.message"
       :message="uiStore.state.toast.message"
       :type="uiStore.state.toast.type"
       :duration="3000"
      />
    </transition>
    <div class="main-content h-screen md:w-[calc(100%-250px)] fixed md:left-[250px] p-3 md:top-0 md:pt-5 md:pr-4 overflow-y-auto 2xl:absolute">
      <div class="content bg-card-bg max-sm:p-3 p-5 rounded-lg mb-[100px] md:mb-0 min-h-screen md:min-h-full">
        <template v-if="!uiStore.state.isAuthLoading">
          <SiteHeader/>
          <main class="block"/>
          <slot/>

          <template v-if="isAddAccountModalOpen">
            <AddEditAccountModal
             :is-open="isAddAccountModalOpen"
             @close="closeModal('account')"
             @update:is-open="isAddAccountModalOpen = $event"
            />
          </template>

          <template v-if="isAddExpenseModalOpen || isAddFundsModalOpen">
            <AddEditTransactionModal
             :transaction-type="isAddExpenseModalOpen ? 'expense' : 'income'"
             :is-open="isAddExpenseModalOpen ? isAddExpenseModalOpen : isAddFundsModalOpen"
             @close="() => closeModal(isAddExpenseModalOpen ? 'expense' : 'funds')"
             @update:is-open="(value) => isAddExpenseModalOpen ? (isAddExpenseModalOpen = value) : (isAddFundsModalOpen = value)"
            />
          </template>

          <template v-if="isCalculatorModalOpen">
            <CalculatorModal
             :is-open="isCalculatorModalOpen"
             @close="closeModal('calculator')"
             @update:is-open="isCalculatorModalOpen = $event"
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
import {useUserStore} from '~/stores/user';
import {useUIStore} from "~/stores/ui";

const AddEditAccountModal = defineAsyncComponent(() => import('~/components/Modals/AddEditAccountModal.vue'));
const AddEditTransactionModal = defineAsyncComponent(() => import('~/components/Modals/AddEditTransactionModal.vue'));
const CalculatorModal = defineAsyncComponent(() => import('~/components/Modals/CalculatorModal.vue'));
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

  if (userStore.isLoggedIn && userStore.user.email !== '') {
    await userStore.getAvatar();
  }

});

const isAddExpenseModalOpen = computed(() => uiStore.modals.isAddExpenseModalOpen);
const isAddFundsModalOpen = computed(() => uiStore.modals.isAddFundsModalOpen);
const isAddAccountModalOpen = computed(() => uiStore.modals.isAddAccountModalOpen);
const isCalculatorModalOpen = computed(() => uiStore.modals.isCalculatorModalOpen);

const closeModal = (name?: string) => {
  if (name === 'expense') {
    uiStore.toggleModal('isAddExpenseModalOpen', false);
  } else if (name === 'funds') {
    uiStore.toggleModal('isAddFundsModalOpen', false);
  } else if (name === 'calculator') {
    uiStore.toggleModal('isCalculatorModalOpen', false);
  } else {
    uiStore.toggleModal('isAddAccountModalOpen', false);
  }
};
</script>

<style>
</style>
