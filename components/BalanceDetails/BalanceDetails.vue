<template>
  <Preloader v-if="uiStore.state.isLoading || financeStore.loadingStates.cas"/>
  <div
   v-else
   class="balance-details">
    <div class="total-balance">Balance: <span>{{ totalBalance }}USD</span></div>
    <div class="balance-parts">
      <div class="balance-item balance-cash">Cash: <strong>{{ financeStore.cash.amount }}{{
          financeStore.cash.currency
        }}</strong></div>
      <div
       class="balance-item balance-card"
       v-for="card in financeStore.cardsList"
       :key="card._id">Card {{ card.number }}: <strong>{{ card.balance }}{{ card.currency }}</strong></div>
    </div>
    <BaseButton
     size="medium"
     @click="handleAddFunds">Add Funds
    </BaseButton>
  </div>
</template>

<script
 setup
 lang="ts">
import {useUIStore} from "~/stores/ui";
import {useFinanceStore} from "~/stores/financeStore";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const uiStore = useUIStore();
const financeStore = useFinanceStore();

const handleAddFunds = () => {
  uiStore.openAddFundsModal();
}

const totalBalance = computed(() => {
  const cardsTotalAmount = financeStore.cardsList.reduce((acc, currentValue) => {
    return acc + +currentValue?.balance
  }, 0);
  return cardsTotalAmount + financeStore.cash.amount;
});

onMounted(async () => {
  try {
    await Promise.all([financeStore.fetchCashIfNeeded(), financeStore.fetchCardsIfNeeded()])
  } catch (e) {
    console.log(e);
  }
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>