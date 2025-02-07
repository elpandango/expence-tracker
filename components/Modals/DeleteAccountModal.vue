<template>
  <Modal
   v-model="modalValue"
   @update:model-value="closeModal">
    <template #header>
      {{ $t('components.modalsContent.deleteCardModal.deleteTitleText') }}
    </template>
    <template #body>
      <div>
        {{ $t('components.modalsContent.deleteCardModal.deleteConfirmText') }}
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
       @click="handleDeleteCard">{{ $t('components.buttons.deleteText') }}
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

const handleDeleteCard = () => {
  emit('delete');
};
</script>

<style>
</style>