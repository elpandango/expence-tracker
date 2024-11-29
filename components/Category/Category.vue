<template>
  <div class="category-item">
    <template v-if="data?.icon">
      <span
       class="category-icon material-symbols-outlined"
       :style="{ backgroundColor: data?.color }">{{ data.icon }}</span>
    </template>

    <div class="content-block">
      <div class="expense-description">
        <div class="category-name">{{
            data.name === '' || !data.name ? 'Uncategorized' : data.name
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">

const props = defineProps({
  data: {
    type: Object
  },
});

</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>