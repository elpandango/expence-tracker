<template>
  <div
   v-if="!financeStore.loadingStates.cash && !financeStore.loadingStates.cards"
   class="balance-details">
    <div class="total-balance">Balance: {{totalBalance}}</div>
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
  <Preloader v-else/>
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
    await Promise.all([financeStore.fetchCash(), financeStore.fetchCards()])
  } catch (e) {
    console.log(e);
  }
});
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>