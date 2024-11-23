<template>
  <div class="form-block float-label">
    <input type="text"
           class="form-input"
           :class="[size, status]"
           :value="modelValue"
           @input="$emit('update:modelValue', $event.target.value)"
           :placeholder="placeholder">
    <label v-if="label"
           :class="{frozen: modelValue !== ''}">{{ label }}</label>
    <div v-if="!!errorMessage"
         class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import './styles.scss';

const props = defineProps({
  modelValue: {
    type: [String, Number, Date],
    required: true
  },
  placeholder: {
    type: String,
    default: 'Enter text',
    required: false
  },
  label: {
    type: String,
    required: false
  },
  size: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  errorMessage: {
    type: String,
    required: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['update:modelValue']);
</script>

<style scoped lang="scss">
.form-block.float-label {
  width: 100%;
  position: relative;

  label {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    z-index: 1;
    transition: all .3s;
    background-color: var(--input-label-bg);
    //background-color: inherit;

    &.frozen {
      font-size: 12px;
      transform: translateY(0);
      top: -5px;
      z-index: 6;
    }
  }

  input {
    position: relative;
    z-index: 5;
    background-color: transparent;
    color: var(--input-primary-color);

    &::placeholder {
      display: none;
      opacity: 0;
    }

    &:focus, &:active {
      border-color: var(--accent-color);
      & + label {
        font-size: 12px;
        transform: translateY(0);
        top: -5px;
        z-index: 6;
      }
    }
  }
}
</style>