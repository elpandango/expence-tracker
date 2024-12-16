<template>
  <Preloader v-if="uiStore.state.isLoading || financeStore.loadingStates.cash"/>
  <div
   v-else
   class="balance-details">
    <div class="total-balance">{{ $t('components.balance.title') }}: <span>{{ totalBalance }}USD</span></div>
    <div class="balance-parts">
      <div class="balance-item balance-cash">{{ $t('components.balance.cash') }}: <strong>{{ cashTotalBalance }}{{
          financeStore?.cash?.currency ?? 'USD'
        }}</strong></div>
      <div
       class="balance-item balance-card"
       v-for="card in financeStore.cardsList"
       :key="card._id">
        <div class="card-balance-details">
          {{ $t('components.balance.card') }} <span class="card-number">({{ card.number }}):</span>
        </div>
         <strong>{{ card.balance?.toFixed(2) }}{{ card.currency }}</strong></div>
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
  financeStore.resetEditingTransaction();
  uiStore.openAddFundsModal();
}

const totalBalance = computed(() => {
  const cards = financeStore.cardsList || [];
  const cash = +financeStore?.cash || 0;
  const cardsBalance = cards.reduce((acc, currentValue) => {
    return acc + +currentValue?.balance;
  }, 0);

  return (cash + cardsBalance).toFixed(2);
});

const cashTotalBalance = computed(() => {
  return financeStore.cash?.toFixed(2);
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