<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      Confirm Card deletion
    </template>
    <template v-slot:body>
      <div>
        Are you sure you want to delete this card?
      </div>
    </template>
    <template v-slot:footer>
      <BaseButton
       @click="closeModal"
       variant="transparent"
       size="big">Cancel
      </BaseButton>
      <BaseButton
       @click="handleDeleteCard"
       variant="red"
       size="big">Delete Card
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

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>