<template>
  <div
   class="accordion"
   :class="[{'active': isActive}, type]">
    <div class="accordion-inner-content">
      <div
       @click="accordionTrigger"
       :style="{height: props.height}"
       class="header-block"
       :class="align">
        <slot name="header">
          <div class="value">
            default value
          </div>
        </slot>
        <div v-if="!noCaret"
             class="icon-wrap">
          <SvgIcon icon="angle-right-solid"/>
        </div>
      </div>
      <div
       :style="{maxHeight: isActive ? computedHeight  + 'px' : '0px'}"
       class="content-block">
        <div
         class="content-items-list"
         ref="contentBlock">
          <div class="content-item">
            <slot name="accordion-body">default body</slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import SvgIcon from "@/components/svgComponents/SvgIcon.vue";

const props = defineProps({
  height: {
    type: String,
    default: '38px'
  },
  type: {
    type: String,
    default: ''
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

const accordionTrigger = (e: any) => {
  e.stopPropagation();
  isActive.value = !isActive.value;
};

onMounted(() => {
  if (props.isActiveOnInit) {
    isActive.value = true;
  }
});
</script>

<style
 src="./styles.scss"
 lang="scss">
</style>
