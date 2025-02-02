<template>
  <Teleport to="body">
    <div
     v-if="modelValue"
     class="modal-overlay"
     @keydown.esc="closeModal"
     @click:outside="clickOutside">
      <div
       class="modal-background"
       @click="closeModal"/>
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">
            <slot name="header"/>
          </h2>
          <button
           class="modal-close-button"
           @click="closeModal">&times;
          </button>
        </div>
        <div class="modal-body">
          <slot name="body"/>
        </div>
        <div class="modal-footer">
          <div class="footer-slot">
            <slot name="footer"/>
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

const toggleBodyScroll = (disable: boolean) => {
  if (disable) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
};

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
  toggleBodyScroll(true);
  window.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
  toggleBodyScroll(false);
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
  overflow-y: auto;
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
  display: flex;
  flex-direction: column;
  background-color: var(--modal-body-color);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: calc(100% - 40px);
  max-width: 32rem;
  position: relative;
  z-index: 10;
  max-height: 94vh;
  overflow: hidden;
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
  width: 36px;
}

.modal-close-button:hover {
  color: #374151;
}

.modal-body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--input-border-color);
}


.modal-header,
.modal-footer {
  flex-shrink: 0;
  padding: 1rem;
}

.modal-footer {
  border-top: 1px solid var(--input-border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.footer-slot {
  display: flex;
  gap: 0.5rem;
}
</style>