<template>
  <transition name="toast-fade">
    <div
     v-if="isVisible"
     :class="[
    'fixed z-150 bottom-8 right-8 py-2 px-4 rounded-lg text-white text-base flex items-center shadow-lg transition-opacity duration-300',
    {
      'bg-green-500': toastClass === 'toast-success',
      'bg-red-500': toastClass === 'toast-error',
      'bg-blue-500': toastClass === 'toast-info',
      'bg-yellow-500': toastClass === 'toast-warning'
    }
  ]"
     :style="{ animationDuration: duration + 'ms' }"
     @click="handleClick"
    >
      <div class="flex items-center">
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

<style>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.toast-fade-enter-to,
.toast-fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
