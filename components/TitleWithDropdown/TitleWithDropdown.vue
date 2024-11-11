<template>
  <div class="title-with-dropdown">
    <h3 class="title">
      <slot></slot>
    </h3>
    <Dropdown
     v-model="selected"
     :options="options"
     :placeholder=props.placeholder
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

const selected = ref(null);
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