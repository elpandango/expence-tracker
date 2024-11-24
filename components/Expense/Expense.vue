<template>
  <div class="expense-item">
    <div class="category-image"></div>
    <div class="content-block">
      <div class="expense-description">
        <div class="category-name">{{ data.category }}</div>
        <div class="expense-date">{{ formattedDate }}</div>
      </div>
      <div class="expense-amount">-{{ data.amount }}$</div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {useFormatDate} from "~/use/useFormatDate";

const props = defineProps({
  data: {
    type: Object
  }
});

const formattedDate = useFormatDate(props.data.date);
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>