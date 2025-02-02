<template>
  <div class="accounts-page">
    <h1>{{ $t('components.accountsPage.pageTitleText') }}</h1>
    <Preloader
     v-if="uiStore.state.isLoading"
     height="50vh"/>
    <template v-else>
      <ul
       v-if="financeStore.accountsList && financeStore.accountsList.length > 0"
       class="accounts-list">
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

        <p class="mar-t-4">{{ $t('components.accountsPage.generateDataText') }}</p>

        <button
         class="add-account-btn small"
         @click="handleCreateTestData">
          <span class="btn-text">{{ $t('components.accountsPage.generateDataBtnText') }}</span>
        </button>
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
  emitter.emit('ui:startLoading', 'default');
  await generateTestData();
  emitter.emit('ui:stopLoading', 'default');
  window.location.reload();
};

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  await financeStore.fetchAccountsIfNeeded();
  emitter.emit('ui:stopLoading', 'default');
});
</script>

<style
 lang="scss">
.accounts-page {
  width: 100%;
  max-width: 1024px;
  margin: 0 auto;

  @media only screen and (max-width: 1366px) {
    max-width: 860px;
  }

  .accounts-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    li {
      width: calc(50% - 10px);

      @media only screen and (max-width: 767px) {
        width: 100%;
      }
    }
  }

  .add-account-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--accent-color);
    border-radius: var(--border-radius);
    background-color: transparent;
    outline: none;
    width: 100%;
    height: 100%;
    min-height: 138px;
    font-size: 18px;
    color: var(--btn-transparent-color);
    cursor: pointer;

    .plus-icon {
      font-size: 24px;
    }

    .btn-text {
      margin-left: 10px;
    }

    &.small {
      min-width: 200px;
      width: auto;
      min-height: 60px;
      height: 60px;
    }
  }
}
</style>