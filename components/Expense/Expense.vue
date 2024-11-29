<template>
  <component
   :is="tag"
   class="expense-item">

    <template v-if="data?.category?.icon">
      <span
       class="category-icon material-symbols-outlined"
       :style="{ backgroundColor: data?.category?.color }">{{ data.category.icon }}</span>
    </template>

    <div class="content-block">
      <div class="expense-description">
        <div class="category-name">{{
            data.category === '' || !data.category ? 'Uncategorized' : data.category.name
          }}
        </div>
        <div class="expense-date">{{ formattedDate }}</div>
      </div>
      <div class="expense-amount">-{{ data.amount }}$</div>
    </div>
  </component>
</template>

<script
 setup
 lang="ts">
import {useFormatDate} from "~/use/useFormatDate";

const props = defineProps({
  data: {
    type: Object
  },
  tag: {
    type: String,
    default: 'div'
  }
});

const formattedDate = useFormatDate(props.data.date);
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>