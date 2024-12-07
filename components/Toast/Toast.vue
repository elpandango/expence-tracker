<template>
  <transition name="toast-fade">
    <div
     v-if="isVisible"
     :class="['toast', toastClass]"
     :style="{ animationDuration: duration + 'ms' }"
     @click="handleClick"
    >
      <div class="toast-content">
        <span>{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script
 setup
 lang="ts">
import {ref, watchEffect} from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info'
  },
  duration: {
    type: Number,
    default: 2900
  }
});

const isVisible = ref(true);
const toastClass = computed(() => {
  return `toast-${props.type}`;
});

watchEffect(() => {
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
});

const handleClick = () => {
  isVisible.value = false;
};
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>
