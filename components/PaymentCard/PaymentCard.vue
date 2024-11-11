<template>
  <div
   class="payment-card"
   :class="props.class">

  </div>
</template>

<script
 setup
 lang="ts">

const props = defineProps({
  class: {
    type: String
  }
});

</script>

<style
 scoped
 lang="scss">
.payment-card {
  width: 400px;
  height: 250px;
  background-color: grey;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  //margin-bottom: 26px;
}
</style>