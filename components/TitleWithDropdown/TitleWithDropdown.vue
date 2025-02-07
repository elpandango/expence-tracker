<template>
  <div class="title-with-dropdown flex items-center justify-between mb-5">
    <h3 class="mb-0">
      <slot/>
    </h3>
    <Dropdown
     v-model="selected"
     :options="options"
     :placeholder=props.placeholder
     @update:model-value="handleDropdownSelected"
    />
  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Choose an option'
  },
  options: {
    type: Array
  }
});

const emit = defineEmits(['option-selected']);

const selected = ref(null);

const handleDropdownSelected = (option: any) => {
  emit('option-selected', option);
};
</script>

<style>
</style>