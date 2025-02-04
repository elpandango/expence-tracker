<template>
  <div class="w-full sm:w-1/2 md:w-1/3 flex items-center justify-start py-2.5 mb-4">
    <template v-if="data?.icon">
      <span
       class="material-symbols-outlined mr-4 w-10 h-10 rounded-full flex items-center justify-center"
       :style="{ backgroundColor: data?.color }">{{ data.icon }}</span>
    </template>

    <div class="text-xl">{{
        data.name === '' || !data.name ? 'Uncategorized' : data.name
      }}
    </div>
  </div>
</template>

<script
 setup
 lang="ts">

const {data} = defineProps<{
  data: {
    icon?: string;
    color?: string;
    name?: string;
  }
}>();
</script>

<style>
</style>