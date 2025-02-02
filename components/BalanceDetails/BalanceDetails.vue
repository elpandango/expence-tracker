<template>
  <Preloader v-if="uiStore.state.isLoading || financeStore.loadingStates.transactions"/>
  <div
   v-else
   class="w-full">
    <h2 class="text-xl md:text-2xl font-semibold mb-4">{{ $t('components.balance.title') }}:</h2>
    <div class="mb-4">
      <div
       v-for="account in financeStore.accountsList"
       :key="account._id"
       class="border-top-custom flex justify-between items-center text-lg py-2.5">
        <div>
          <span>{{ account.name }}</span>
          <div class="font-semibold text-sm mt-1.5"><strong>{{ account.type }}</strong> {{ account.cardNumber ? `| ${account.cardNumber}` : '' }}</div>
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
     v-if="financeStore.accountsList.length > 0"
     class="flex justify-between items-center">
      <BaseButton
       size="medium"
       variant="green"
       class="w-32 md:w-36 text-sm md:text-base whitespace-nowrap"
       @click="handleAddFunds">{{ $t('components.buttons.addFundsText') }}
      </BaseButton>

      <BaseButton
       size="medium"
       variant="red"
       class="w-32 md:w-36 text-sm md:text-base whitespace-nowrap"
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

<style>
</style>