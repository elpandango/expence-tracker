<template>
  <component
   :is="tag"
   class="transactions-item">
    <div class="category-image"></div>
    <div class="item-details">
      <div class="item-content">
        <div class="item-name">Food & Dining</div>
        <div class="item-date">14 min ago</div>
      </div>
      <div class="item-amount">-$150</div>
    </div>
  </component>
</template>

<script
 setup
 lang="ts">

const props = defineProps({
  tag: {
    type: String,
    default: 'div'
  }
});
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>