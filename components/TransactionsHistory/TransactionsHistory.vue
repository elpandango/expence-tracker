<template>
  <div class="transactions-history">
    <TitleWithDropdown
     placeholder="See All"
     :options="dropdownOptions">
      Transactions History
    </TitleWithDropdown>
    <ul class="items-list">
      <TransactionsItem tag="li"/>
      <TransactionsItem tag="li"/>
      <TransactionsItem tag="li"/>
      <TransactionsItem tag="li"/>
    </ul>
  </div>
</template>

<script
 setup
 lang="ts">

const dropdownOptions = [
  {label: 'Option text here 1', value: '1'},
  {label: 'Option 2', value: '2'},
  {label: 'Option 3', value: '3'},
];

</script>

<style
 scoped
 lang="scss">

</style>