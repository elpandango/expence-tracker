<template>
  <Teleport to="body">
    <div
     class="fixed inset-0 flex items-center justify-center"
     @keydown.esc="closeDialog">
      <div
       class="fixed inset-0 bg-black bg-opacity-50"
       @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg z-10">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold">
            <slot name="header"></slot>
          </h2>
          <button
           @click="closeModal"
           class="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div class="p-4">
          <slot name="body"></slot>
        </div>
        <div class="flex justify-end p-4 border-t border-gray-200">
          <div class="space-x-2">
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

const dialog = ref<null | HTMLDialogElement>(null);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const openModal = () => {
  if (dialog.value) {
    dialog.value.showModal();
  }
};

const closeModal = () => {
  emit('update:modelValue', false);
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

watch(
 () => props.modelValue,
 (newVal) => {
   if (newVal) {
     openModal();
   } else {
     closeModal();
   }
 }
);

</script>

<style
 scoped
 lang="scss">

</style>