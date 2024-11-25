<template>
  <div class="balance-details">
    <div class="total-balance">Balance: $25000</div>
    <div class="balance-parts">
      <div class="balance-item balance-cash">Cash: <strong>$500</strong></div>
      <div class="balance-item balance-card">Card 1111 2222 3333 4444: <strong>$150$</strong></div>
      <div class="balance-item balance-card">Card 1111 2222 3333 4444: <strong>$150$</strong></div>
    </div>
    <BaseButton size="medium">Add Funds</BaseButton>
  </div>
</template>

<script
 setup
 lang="ts">

import BaseButton from "~/components/Buttons/BaseButton.vue";
</script>

<style
 lang="scss">
.balance-details {
  .total-balance {
    font-size: 26px;
    font-weight: 500;
    margin-bottom: 16px;
  }

  .balance-parts {
    margin-bottom: 16px;
  }

  .balance-item {
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}
</style>