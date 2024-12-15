<template>
  <div
   class="dropdown"
   :class="[type, size, {'is-active': isOpen}]"
   ref="dropdown"
   @click="toggleDropdown">
    <button class="dropdown-toggle">
      <span>{{ selectedOption ? selectedOption.label : placeholder }}</span>
      <svg
       class="dropdown-arrow"
       :class="{'is-active': isOpen}"
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
     class="dropdown-menu">
      <li
       v-for="option in options"
       :key="option.value"
       @click="selectOption(option)"
       class="dropdown-item"
       :class="{ selected: option.value === selectedOption?.value }"
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
}, { immediate: true });

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
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

<style
 lang="scss"
 src="./styles.scss">
</style>