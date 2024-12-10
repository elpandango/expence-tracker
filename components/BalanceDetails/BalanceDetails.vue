<template>
  <Preloader v-if="uiStore.state.isLoading || financeStore.loadingStates.cas"/>
  <div
   v-else
   class="balance-details">
    <div class="total-balance">{{ $t('components.balance.title') }}: <span>{{ cashTotalBalance + cardsTotalBalance }}USD</span></div>
    <div class="balance-parts">
      <div class="balance-item balance-cash">{{ $t('components.balance.cash') }}: <strong>{{ cashTotalBalance }}{{
          financeStore.cash?.currency ?? 'USD'
        }}</strong></div>
      <div
       class="balance-item balance-card"
       v-for="card in financeStore.cardsList"
       :key="card._id">
        <div class="card-balance-details">
          Card <span class="card-number">({{ card.number }}):</span>
        </div>
         <strong>{{ card.balance }}{{ card.currency }}</strong></div>
    </div>
    <BaseButton
     size="medium"
     @click="handleAddFunds">{{ $t('components.buttons.addFundsText') }}
    </BaseButton>
  </div>
</template>

<script
 setup
 lang="ts">
import {useUIStore} from "~/stores/ui";
import {useFinanceStore} from "~/stores/finance";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const uiStore = useUIStore();
const financeStore = useFinanceStore();

const handleAddFunds = () => {
  uiStore.openAddFundsModal();
}

const cashTotalBalance = computed(() => {
  const cash = financeStore.cash || [];
  return cash.reduce((acc, currentValue) => {
    return acc + +currentValue?.amount;
  }, 0);
});

const cardsTotalBalance = computed(() => {
  const cards = financeStore.cardsList || [];
  return cards.reduce((acc, currentValue) => {
    return acc + +currentValue?.balance;
  }, 0);
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