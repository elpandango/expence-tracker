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

          <template v-if="isAddExpenseModalOpen">
            <AddExpenseModal
             :isOpen="isAddExpenseModalOpen"
             @close="closeModal('expense')"
             @update:isOpen="isModalOpen = $event"
            />
          </template>

          <template v-if="isAddFundsModalOpen">
            <AddFundsModal
             :isOpen="isAddFundsModalOpen"
             @close="closeModal"
             @update:isOpen="isModalOpen = $event"
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
import {ref} from "vue";
import {useUserStore} from '~/stores/user';
import {useUIStore} from "~/stores/ui";
import AddExpenseModal from "~/components/Modals/AddExpenseModal.vue";
import AddFundsModal from "~/components/Modals/AddFundsModal.vue";

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();
const isModalOpen = ref(false);

onBeforeMount(async () => {
  try {
    if (uiStore.state.isAuthLoading) {
      await userStore.checkAuth();
    }

    if (!userStore.isLoggedIn) {
      await router.push('/auth');
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    //TODO redirect to error page
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
 scoped
 lang="scss">
.page-content {
  display: flex;
  flex-wrap: wrap;
}
</style>
