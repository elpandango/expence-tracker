<template>
  <Preloader v-if="uiStore.state.isLoading || financeStore.loadingStates.transactions"/>
  <div
   v-else
   class="balance-details-block">
    <div class="total-balance">{{ $t('components.balance.title') }}:</div>
    <div class="balance-parts">
      <div
       class="balance-item"
       v-for="account in financeStore.accountsList"
       :key="account._id">
        <div class="balance-details">
          <span class="account-name">{{ account.name }}</span>
          <div class="account-type">{{ account.type }} {{ account.cardNumber ? `| ${account.cardNumber}` : '' }}</div>
        </div>
        <strong>{{ formatCurrency(account.balance, account.currency) }}</strong>
      </div>
    </div>

    <template v-if="financeStore.accountsList.length === 0">
      <p class="info">{{ $t('components.accountsPage.emptyListTitleText') }}</p>
      <BaseButton
       size="medium"
       @click="handleAddAmount">{{ $t('components.accountsPage.addAccountText') }}
      </BaseButton>

      <p class="mar-t-4">{{ $t('components.accountsPage.emptyAccountsText') }}:</p>

      <BaseButton
       size="medium"
       @click="handleCreateTestData">{{ $t('components.accountsPage.generateBtnText') }}
      </BaseButton>
    </template>

    <div
     class="btn-block"
     v-if="financeStore.accountsList.length > 0">
      <BaseButton
       size="medium"
       @click="handleAddFunds">{{ $t('components.buttons.addFundsText') }}
      </BaseButton>

      <BaseButton
       size="medium"
       @click="handleNewExpense">{{ $t('components.menuList.addExpense') }}
      </BaseButton>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {useUIStore} from "~/stores/ui";
import {useFinanceStore} from "~/stores/finance";
import {useCurrencyFormatter} from "~/use/useCurrencyFormatter";
import {useGenerateTestData} from "~/use/useGenerateTestData";
import {emitter} from "~/classes/uiEventBus";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const uiStore = useUIStore();
const financeStore = useFinanceStore();
const {formatCurrency} = useCurrencyFormatter();
const { generateTestData } = useGenerateTestData();

const handleAddFunds = () => {
  financeStore.resetEditingTransaction();
  uiStore.toggleModal('isAddFundsModalOpen', true);
}

const handleAddAmount = () => {
  financeStore.resetEditingAccount();
  uiStore.toggleModal('isAddAccountModalOpen', true);
}

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

onMounted(async () => {
  try {
    await financeStore.fetchAccountsIfNeeded();
  } catch (e) {
    console.log(e);
  }
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>