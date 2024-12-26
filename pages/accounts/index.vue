<template>
  <div class="accounts-page">
    <h1>{{ $t('components.accountsPage.pageTitleText') }}</h1>
    <Preloader
     height="50vh"
     v-if="uiStore.state.isLoading"/>
    <template v-else>
      <ul
       v-if="financeStore.accountsList && financeStore.accountsList.length > 0"
       class="cards-list">
        <li
         v-for="account in financeStore.accountsList"
         :key="account.name">
          <AccountCard
           :data="account"
           @update-account="handleUpdateCardClicked(account)"
           @delete-account="handleDeleteAccountClicked(account._id)"/>
        </li>
        <li>
          <button
           class="add-account-btn"
           @click="handleAddAmount">
            <span class="plus-icon">+</span>
            <span class="btn-text">{{ $t('components.accountsPage.addAccountText') }}</span>
          </button>
        </li>
      </ul>

      <div
       v-else
       class="add-card-block">
        <h3>{{ $t('components.accountsPage.emptyListTitleText') }}</h3>
        <p class="info">{{ $t('components.accountsPage.emptyListText') }}</p>
        <button
         class="add-account-btn small"
         @click="handleAddAmount">
          <span class="plus-icon">+</span>
          <span class="btn-text">{{ $t('components.accountsPage.addAccountText') }}</span>
        </button>
      </div>
    </template>

    <template v-if="isDeleteConfirmationModalOpen">
      <DeleteAccountModal
       :isOpen="isDeleteConfirmationModalOpen"
       @delete="handleDeleteAccount"
       @update:isOpen="isDeleteConfirmationModalOpen = $event"
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

const AccountCard = defineAsyncComponent(() => import('~/components/AccountCard/AccountCard.vue'));
const DeleteAccountModal = defineAsyncComponent(() => import('~/components/Modals/DeleteAccountModal.vue'));
const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const financeStore = useFinanceStore();
const uiStore = useUIStore();
const isDeleteConfirmationModalOpen = ref(false);
const accountIdToDelete = ref('');

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

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  await financeStore.fetchAccountsIfNeeded();
  emitter.emit('ui:stopLoading', 'default');
});
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>