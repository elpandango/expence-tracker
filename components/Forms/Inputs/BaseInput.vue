<template>
  <div class="w-full relative">
    <label
     v-if="label"
     class="block text-left mb-2">{{ label }}</label>
    <input
     :type="type"
     class="w-full border-[1px] border-stone-200 dark:border-neutral-600 bg-transparent dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500"
     :disabled="disabled"
     :class="[sizeClasses[size] || 'py-2 px-4 text-base', statusClasses[status], {'disabled': disabled}, classes]"
     :value="modelValue"
     :placeholder="placeholder"
     :step="type === 'number' ? 0.1 : null"
     @input="emits('update:modelValue', $event.target.value)"/>

    <div
     v-if="hasIcon"
     class="icon absolute z-20 top-3 right-3 cursor-pointer">
      <slot name="icon"/>
    </div>

    <div
     v-if="errorMessage"
     class="text-red-500 text-sm mt-1">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {type: [String, Number, Date, null], default: null},
  placeholder: {type: String, default: 'Enter text'},
  label: {type: String, default: ''},
  size: {type: String, default: 'medium'},
  status: {type: String, default: ''},
  errorMessage: {type: String, default: ''},
  disabled: {type: Boolean, default: false},
  type: {type: String, default: 'text'},
  hasIcon: {type: Boolean, default: false},
  classes: {type: String, default: ''}
});

const emits = defineEmits(['update:modelValue']);

const sizeClasses = {
  small: "text-sm py-1 px-4",
  medium: "text-base py-3 px-4",
  big: "text-lg p-3",
};

const statusClasses = {
  error: "border-red-500 focus:ring-red-500",
  success: "border-green-500 focus:ring-green-500",
  warning: "border-yellow-500 focus:ring-yellow-500",
};
</script>
