<template>
  <Preloader v-if="uiStore.state.isLoading || financeStore.loadingStates.transactions"/>
  <div
   v-else
   class="w-full">
    <h2 class="balance-details text-xl md:text-2xl font-medium mb-4">{{ $t('components.balance.title') }}:</h2>
    <div class="mb-4">
      <div
       v-for="account in financeStore.accountsList"
       :key="account._id"
       class="border-top-custom flex justify-between items-center text-lg py-2.5">
        <div>
          <span>{{ account.name }}</span>
          <div class="font-medium text-xs"><strong>{{ account.type }}</strong>
            {{ account.cardNumber ? `| ${account.cardNumber}` : '' }}
          </div>
        </div>
        <strong>{{ formatCurrency(account.balance, account.currency) }}</strong>
      </div>
    </div>

    <template v-if="financeStore.accountsList.length === 0">
      <p class="mb-2">{{ $t('components.accountsPage.emptyListTitleText') }}</p>
      <BaseButton
       size="medium"
       @click="handleAddAmount">{{ $t('components.accountsPage.addAccountText') }}  test
      </BaseButton>

      <p class="mt-4 mb-2">{{ $t('components.accountsPage.emptyAccountsText') }}:</p>

      <BaseButton
       v-if="!generateTestClicked"
       size="medium"
       @click="handleCreateTestData">{{ $t('components.accountsPage.generateBtnText') }}
      </BaseButton>
      <div
       v-else
       class="w-[170px] h-[44px]">
        <Preloader
         height="40px"/>
      </div>

    </template>

    <div
     v-if="financeStore.accountsList.length > 0"
     class="btn-block flex justify-between items-center gap-3">
      <BaseButton
       size="medium"
       variant="green"
       class="w-auto md:w-auto text-sm md:text-base whitespace-wrap md:whitespace-nowrap"
       @click="handleAddFunds">{{ $t('components.buttons.addFundsText') }}
      </BaseButton>

      <BaseButton
       size="medium"
       variant="red"
       class="w-auto md:w-auto text-sm md:text-base whitespace-wrap md:whitespace-nowrap"
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
const {generateTestData} = useGenerateTestData();

const generateTestClicked = ref(false);

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
  generateTestClicked.value = true;
  emitter.emit('ui:startLoading', 'default');
  await generateTestData();
  emitter.emit('ui:stopLoading', 'default');
  generateTestClicked.value = false;
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