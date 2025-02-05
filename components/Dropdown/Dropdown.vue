<template>
  <div
   ref="dropdown"
   class="dropdown inline-flex relative w-full"
   :class="[type]"
   @click="toggleDropdown">
    <button
     class="dropdown-toggle color-main text-left relative flex flex-wrap items-center justify-between w-full cursor-pointer py-1.5 pr-7 pl-3 bg-card-bg border-[1px] border-stone-200 dark:border-neutral-600 rounded-md"
     :class="[{'border-stone-200': !selectedOption?.label}, size, {'!border-blue-500': isOpen}]">
      <span class="flex-1 flex-nowrap">{{ selectedOption ? selectedOption.label : placeholder }}</span>
      <svg
       class="dropdown-arrow absolute right-2 top-[50%] transition duration-300 -translate-y-1/2 rotate-0"
       :class="{'!rotate-180': isOpen}"
       width="10"
       height="10"
       viewBox="0 0 10 10"
       fill="currentColor"
       xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 3L5 8L10 3H0Z"/>
      </svg>
    </button>

    <ul
     v-if="isOpen"
     class="dropdown-menu absolute top-[100%] right-0 z-[1000] rounded-md p-0 min-w-[100%] max-h-[250px] border-stone-200 dark:border-neutral-600 shadow-md bg-card-bg w-max whitespace-nowrap overflow-y-auto translate-y-2">
      <li
       v-for="option in options"
       :key="option.value"
       class="dropdown-item transition duration-200 flex items-center cursor-pointer py-2 px-3 hover:bg-list-item-bg active:bg-list-item-bg"
       :class="{ selected: option.value === selectedOption?.value }"
       @click="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: null,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
  type: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    required: false
  },
});

const isOpen = ref(false);
const selectedOption = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  selectedOption.value = newValue;
}, {immediate: true});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    nextTick(() => {
      const rect = dropdown.value.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menu = dropdown.value.querySelector('.dropdown-menu');
      if (spaceBelow < 310) {
        menu.style.bottom = '60px';
        menu.style.top = 'unset';
      } else {
        menu.style.top = '100%';
      }
    });
  }
};

const selectOption = (option: any) => {
  isOpen.value = false;
  selectedOption.value = option;
  emit('update:modelValue', option);
};

const dropdown = ref(null);
const handleClickOutside = (event: any) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style>
</style>