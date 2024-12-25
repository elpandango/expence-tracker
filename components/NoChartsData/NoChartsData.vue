<template>
  <div class="no-data">
    <h3>
      There is no data to display the graph.
    </h3>
    <p class="info">
      Start adding transactions to see visual graphs of your expenses and income.
    </p>
  </div>
</template>

<script
 setup
 lang="ts">

</script>

<style
 scoped
 lang="scss">
.no-data {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
</style>