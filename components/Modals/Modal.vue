<template>
  <Teleport to="body">
    <div
     v-if="modelValue"
     class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
     @keydown.esc="closeModal"
     @click:outside="clickOutside"
    >
      <div
       class="fixed inset-0 bg-stone-900 opacity-60"
       @click="closeModal"
      />
      <div class="flex flex-col bg-modal-body rounded-lg shadow-lg w-full max-w-[90%] md:max-w-lg relative z-10 max-h-[75vh] md:max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between p-4 border-b border-stone-200 dark:border-neutral-600">
          <h2 class="text-lg font-medium">
            <slot name="header" />
          </h2>
          <button
           class="text-stone-500 bg-none border-none cursor-pointer transition-colors duration-200 text-2xl leading-[16px] w-9"
           @click="closeModal"
          >
            &times;
          </button>
        </div>
        <div class="flex-1 p-4 overflow-y-auto">
          <slot name="body" />
        </div>
        <div class="flex-shrink-0 p-4 border-t border-stone-200 dark:border-neutral-600 flex justify-end gap-2">
          <div class="flex gap-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script
 setup
 lang="ts">

const _props = defineProps({
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

<style>
</style>