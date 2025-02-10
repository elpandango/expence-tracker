<template>
  <Modal
   v-model="modalValue"
   @update:model-value="closeModal">
    <template #header>
      {{ $t('components.modalsContent.deleteTransactionModal.deleteTitleText') }}
    </template>
    <template #body>
      <div>
        {{ $t('components.modalsContent.deleteTransactionModal.deleteConfirmText') }}
      </div>
    </template>
    <template #footer>
      <BaseButton
       variant="transparent"
       size="big"
       @click="closeModal">{{ $t('components.buttons.cancelText') }}
      </BaseButton>
      <BaseButton
       variant="red"
       size="big"
       @click="handleDeleteTransaction">{{ $t('components.buttons.deleteText') }}
      </BaseButton>
    </template>
  </Modal>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import Modal from './Modal.vue';
import BaseButton from "~/components/Buttons/BaseButton.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
});

const modalValue = ref(props.isOpen);

const emit = defineEmits(['delete', 'update:isOpen']);

const closeModal = () => {
  emit('update:isOpen', false);
};

const handleDeleteTransaction = () => {
  emit('delete');
};
</script>

<style>
</style>