<template>
  <Teleport to="body">
    <div
     v-if="modelValue"
     class="modal-overlay"
     @keydown.esc="closeModal"
     @click:outside="clickOutside">
      <div
       class="modal-background"
       @click="closeModal"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">
            <slot name="header"></slot>
          </h2>
          <button
           @click="closeModal"
           class="modal-close-button">&times;
          </button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <div class="footer-slot">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script
 setup
 lang="ts">

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const closeModal = () => {
  emit('update:modelValue', false);
};

const clickOutside = () => {
  closeModal();
};

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
});
</script>

<style
 scoped
 lang="scss">

.modal-overlay {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--modal-bg-color);
  opacity: 0.5;
}

.modal-content {
  background-color: var(--modal-body-color);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: calc(100% - 40px);
  max-width: 32rem;
  position: relative;
  z-index: 10;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 500;
}

.modal-close-button {
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 30px;
  line-height: 16px;
}

.modal-close-button:hover {
  color: #374151;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.footer-slot {
  display: flex;
  gap: 0.5rem;
}
</style>