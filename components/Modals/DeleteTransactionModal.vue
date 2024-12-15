<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      {{ $t('components.modalsContent.deleteCardModal.deleteTitleText') }}
    </template>
    <template v-slot:body>
      <div>
        {{ $t('components.modalsContent.deleteCardModal.deleteConfirmText') }}
      </div>
    </template>
    <template v-slot:footer>
      <BaseButton
       @click="closeModal"
       variant="transparent"
       size="big">{{ $t('components.buttons.cancelText') }}
      </BaseButton>
      <BaseButton
       @click="handleDeleteTransaction"
       variant="red"
       size="big">{{ $t('components.buttons.deleteText') }}
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

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>