<template>
  <div class="form-block base-input">
    <label v-if="label">{{ label }}</label>
    <input
     :type="type"
     class="form-input"
     :disabled="disabled"
     :class="[size, status, {'disabled': disabled}]"
     :value="modelValue"
     :placeholder="placeholder"
     :step="type === 'number' ? 0.1 : null"
     @input="$emit('update:modelValue', $event.target.value)">

    <div
v-if="hasIcon"
         class="icon">
      <slot name="icon"/>
    </div>

    <div
     v-if="!!errorMessage"
     class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Date, null],
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
  },
  type: {
    type: String,
    default: 'text'
  },
  hasIcon: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['update:modelValue']);
</script>

<style lang="scss">
.form-block.base-input {
  width: 100%;
  position: relative;

  label {
    display: block;
    margin-bottom: 8px;
  }
  input {
    position: relative;
    z-index: 5;
    background-color: transparent;
    color: var(--input-primary-color);

    &::placeholder {
      transition: opacity .3s;
      color: var(--hover-color);
    }

    &:focus, &:active {
      border-color: var(--accent-color);

      &::placeholder {
        opacity: 0;
      }

      & + label {
        font-size: 12px;
        transform: translateY(0);
        top: -5px;
        z-index: 6;
      }
    }

    &.disabled {
      background-color: var(--bg-color);
    }
  }

  .icon {
    position: absolute;
    z-index: 15;
    right: 20px;
    top: 20px;
    cursor: pointer;
  }
}
</style>