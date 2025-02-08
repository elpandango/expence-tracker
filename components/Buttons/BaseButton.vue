<template>
  <button
   :type="type"
   :disabled="disabled"
   :class="buttonClasses"
  >
    <slot/>
  </button>
</template>

<script
 setup
 lang="ts">
import {computed} from "vue";

const props = defineProps({
  size: {
    type: String,
    default: 'medium'
  },
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const buttonClasses = computed(() => {
  const baseClasses = 'font-semibold text-sm rounded transition-all duration-300 min-w-[90px]';

  let sizeClasses;
  switch (props.size) {
    case 'smallest':
      sizeClasses = 'px-2 py-1 text-sm md:px-3';
      break;
    case 'small':
      sizeClasses = 'px-2 py-1 text-sm md:py-2 md:px-4';
      break;
    case 'big':
      sizeClasses = 'px-2 py-2 text-lg md:py-3 md:px-6';
      break;
    case 'medium':
    default:
      sizeClasses = 'px-4 py-2 md:py-3 md:px-5';
      break;
  }

  let variantClasses;
  switch (props.variant) {
    case 'red':
      variantClasses = 'bg-red-600 text-white hover:bg-red-500 disabled:bg-gray-400';
      break;
    case 'green':
      variantClasses = 'bg-green-600 text-white hover:bg-green-500 disabled:bg-gray-400';
      break;
    case 'transparent':
      variantClasses = 'bg-transparent border-[1px] border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-transparent disabled:bg-gray-200 dark:text-white';
      break;
    case 'primary':
    default:
      variantClasses = 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-400';
      break;
  }

  const disabledClasses = props.disabled ? 'cursor-not-allowed' : '';
  return `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses}`;
});
</script>

<style></style>