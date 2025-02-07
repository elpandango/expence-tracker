<template>
  <div
   class="card w-full flex flex-wrap shadow-xl rounded-xl bg-card-bg dark:border-[1px] dark:border-neutral-600"
   :class="[props.class, withScroll ? 'overflow-auto' : '']"
   :style="{ maxWidth }">
    <div
     v-if="withHeader"
     class="w-full font-semibold py-2 px-5 bg-bg rounded-t-lg">
      <slot name="header"/>
    </div>
    <div class="w-full p-3 md:p-5">
      <slot/>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">

const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '100%'
  },
  withScroll: {
    type: Boolean,
    default: false
  },
  withHeader: {
    type: Boolean,
    default: false
  }
});
</script>

<style>
</style>