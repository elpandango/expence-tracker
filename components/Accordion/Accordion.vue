<template>
  <div
   class="accordion w-full overflow-hidden transition-all duration-300 shadow-xl rounded-xl dark:border-[1px] border-stone-200 dark:border-neutral-600 group"
   :class="[{'active': isActive}]">
    <div class="accordion-inner-content relative">
      <div
       :style="{height: props.height}"
       class="header-block bg-bg px-5 flex items-center justify-between cursor-pointer h-[50px]"
       :class="align"
       @click="accordionTrigger">
        <slot name="header">
          <div class="value">
            default value
          </div>
        </slot>
        <div
         v-if="!noCaret"
         class="icon-wrap flex relative w-[18px] h-[18px] cursor-pointer ">
          <svg
           class="dropdown-arrow absolute top-1/2 transform -translate-y-1/2 right-2 transition-transform duration-300 group-[.active]:rotate-180"
           width="10"
           height="10"
           viewBox="0 0 10 10"
           fill="currentColor"
           xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 3L5 8L10 3H0Z"/>
          </svg>
        </div>
      </div>
      <div
       :style="{maxHeight: isActive ? computedHeight  + 'px' : '0px'}"
       class="content-block overflow-hidden max-h-0 transition-all duration-300 rounded-b-lg ">
        <div
         ref="contentBlock"
         class="content-items-list">
          <div class="content-item py-4 px-5 ">
            <slot name="accordion-body">default body</slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {computed, onMounted, ref} from 'vue';

const props = defineProps({
  height: {
    type: String,
    default: '50px'
  },
  isActiveOnInit: {
    type: Boolean,
    default: false
  },
  noCaret: {
    type: String,
    default: ''
  },
  align: {
    type: String,
    default: ''
  }
});

const isActive = ref<boolean>(false);
const contentBlock = ref<HTMLElement | null>(null);

const computedHeight = computed(() => {
  return contentBlock.value ? contentBlock.value.offsetHeight : 0;
});

const accordionTrigger = (e: event) => {
  e.stopPropagation();
  isActive.value = !isActive.value;
};

onMounted(() => {
  if (props.isActiveOnInit) {
    isActive.value = true;
  }
});
</script>

<style>
</style>
