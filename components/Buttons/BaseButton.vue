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
  const baseClasses = 'font-semibold rounded transition duration-300';

  let sizeClasses = '';
  switch (props.size) {
    case 'smallest':
      sizeClasses = 'px-2 py-1 text-sm md:px-3';
      break;
    case 'small':
      sizeClasses = 'px-2 py-1 text-sm md:py-2 md:px-4';
      break;
    case 'big':
      sizeClasses = 'px-2 py-1 text-lg md:py-3 md:px-6';
      break;
    case 'medium':
    default:
      sizeClasses = 'px-2 py-1 md:py-3 md:px-5';
      break;
  }

  let variantClasses = '';
  switch (props.variant) {
    case 'red':
      variantClasses = 'bg-red-600 text-white hover:bg-red-500 disabled:bg-gray-400';
      break;
    case 'green':
      variantClasses = 'bg-green-600 text-white hover:bg-green-500 disabled:bg-gray-400';
      break;
    case 'transparent':
      variantClasses = 'bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-200 disabled:bg-gray-200';
      break;
    case 'primary':
    default:
      variantClasses = 'bg-blue-500 text-white hover:bg-blue-400 disabled:bg-gray-400';
      break;
  }

  const disabledClasses = props.disabled ? 'cursor-not-allowed' : '';
  return `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses}`;
});
</script>

<style></style>