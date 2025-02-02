<template>
  <div class="title-with-dropdown">
    <h3 class="title">
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

<style
 scoped
 lang="scss">
.title-with-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .title {
    margin-bottom: 0;
  }
}
</style>