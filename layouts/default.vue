<template>
  <div
   class="page-content">
    <Sidebar/>
    <div class="main-content">
      <div class="content">
        <template v-if="!isLoading">
          <SiteHeader/>
          <main></main>
          <slot></slot>

          <template v-if="isAddExpenseModalOpen">
            <AddExpenseModal
             :isOpen="isAddExpenseModalOpen"
             @expenseAdded="handleAddExpense"
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
import {useUserStore} from '~/stores/user';
import {useUIStore} from "~/stores/ui";
import AddExpenseModal from "~/components/Modals/AddExpenseModal.vue";
import {ref} from "vue";

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();
const isLoading = ref(true);
const isModalOpen = ref(false);


onBeforeMount(async () => {
  try {
    if (userStore.loading) {
      await userStore.checkAuth();
      isLoading.value = false;
    }

    if (!userStore.isLoggedIn) {
      await router.push('/auth');
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    //TODO redirect to error page
  }
});

const handleAddExpense = (expenseData: any) => {
  console.log('expenseData: ', expenseData);
};

const isAddExpenseModalOpen = computed(() => uiStore.isAddExpenseModalOpen);

const closeModal = () => {
  uiStore.closeAddExpenseModal();
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
