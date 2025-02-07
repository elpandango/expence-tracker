<template>
  <div class="accounts-page w-full max-w-[860] xl:max-w-[1024px] m-auto">
    <h1>{{ $t('components.accountsPage.pageTitleText') }}</h1>
    <Preloader
     v-if="uiStore.state.isLoading"
     height="50vh"/>
    <template v-else>
      <ul
       v-if="financeStore.accountsList && financeStore.accountsList.length > 0"
       class="flex flex-wrap gap-5">
        <li
         v-for="account in financeStore.accountsList"
         :key="account.name"
         class="w-full md:w-[48%]">
          <AccountCard
           :data="account"
           @update-account="handleUpdateCardClicked(account)"
           @delete-account="handleDeleteAccountClicked(account._id)"/>
        </li>
        <li class="w-full md:w-[48%]">
          <button
           class="add-account-btn rounded-lg border-[1px] border-dashed border-blue-600 text-blue-600 cursor-pointer w-full h-full min-h-[138px]"
           @click="handleAddAmount">
            <span class="text-xl">+</span>
            <span class="ml-2.5">{{ $t('components.accountsPage.addAccountText') }}</span>
          </button>
        </li>
      </ul>

      <div
       v-else
       class="add-card-block">
        <h3>{{ $t('components.accountsPage.emptyListTitleText') }}</h3>
        <p class="mb-4">{{ $t('components.accountsPage.emptyListText') }}</p>
        <button
         class="add-account-btn small flex items-center justify-center outline-none rounded-lg text-lg border-[1px] border-dashed border-blue-600 text-blue-600 cursor-pointer min-w-[200px] w-auto h-[60px] min-h-[60px]"
         @click="handleAddAmount">
          <span class="text-xl">+</span>
          <span class="ml-2.5">{{ $t('components.accountsPage.addAccountText') }}</span>
        </button>

        <p class="mt-4 mb-4">{{ $t('components.accountsPage.generateDataText') }}</p>

        <button
         v-if="!generateTestClicked"
         class="add-account-btn small text-lg border-[1px] border-dashed border-blue-600 rounded-lg text-blue-600 cursor-pointer min-w-[200px] w-auto h-[60px] min-h-[60px]"
         @click="handleCreateTestData">
          <span class="ml-2.5">{{ $t('components.accountsPage.generateDataBtnText') }}</span>
        </button>

        <div
         v-else
         class="border-[1px] border-dashed border-blue-600 rounded-lg text-blue-600 w-[200px] h-[60px]">
          <Preloader
           height="50px"/>
        </div>
      </div>
    </template>

    <template v-if="isDeleteConfirmationModalOpen">
      <DeleteAccountModal
       :is-open="isDeleteConfirmationModalOpen"
       @delete="handleDeleteAccount"
       @update:is-open="isDeleteConfirmationModalOpen = $event"
      />
    </template>

  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from "vue";
import {useSeoConfig} from "~/use/useSeoConfig";
import {useFinanceStore} from "~/stores/finance";
import {useUIStore} from "~/stores/ui";
import {emitter} from "~/classes/uiEventBus";
import {useGenerateTestData} from "~/use/useGenerateTestData";

const AccountCard = defineAsyncComponent(() => import('~/components/AccountCard/AccountCard.vue'));
const DeleteAccountModal = defineAsyncComponent(() => import('~/components/Modals/DeleteAccountModal.vue'));
const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const {generateTestData} = useGenerateTestData();
const financeStore = useFinanceStore();
const uiStore = useUIStore();
const isDeleteConfirmationModalOpen = ref(false);
const accountIdToDelete = ref('');
const generateTestClicked = ref(false);

const handleAddAmount = () => {
  financeStore.resetEditingAccount();
  uiStore.toggleModal('isAddAccountModalOpen', true);
}

const handleUpdateCardClicked = async (account: object) => {
  financeStore.editingAccount.value = {...account};
  uiStore.toggleModal('isAddAccountModalOpen', true);
};

const handleDeleteAccountClicked = async (cardId: string) => {
  accountIdToDelete.value = cardId;
  isDeleteConfirmationModalOpen.value = true;
};

const handleDeleteAccount = async () => {
  const accountId = accountIdToDelete.value;
  isDeleteConfirmationModalOpen.value = false;
  await financeStore.deleteAccount(accountId);
};

const handleCreateTestData = async () => {
  generateTestClicked.value = true;
  emitter.emit('ui:startLoading', 'default');
  await generateTestData();
  emitter.emit('ui:stopLoading', 'default');
  generateTestClicked.value = false;
  window.location.reload();
};

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  await financeStore.fetchAccountsIfNeeded();
  emitter.emit('ui:stopLoading', 'default');
});
</script>

<style>
</style>