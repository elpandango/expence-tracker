<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      Adding New Card
    </template>
    <template v-slot:body>
      <form>
        <div class="form-row">
          <FloatLabelInput
           v-model="userName"
           size="medium"
           label="Cards name"/>
        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="cardNumber"
           size="medium"
           label="Cards number"/>
        </div>
      </form>
    </template>
    <template v-slot:footer>
      <button
       class="px-4 py-2 bg-stone-500 hover:bg-stone-700 transition-bg-color duration-200 text-white rounded"
       @click="closeModal">
        Cancel
      </button>
      <button
       class="px-4 py-2 bg-red-500 hover:bg-red-700 transition-bg-color duration-200 text-white rounded focus:outline-none"
       @click="confirmDelete">
        Add a new Card
      </button>
    </template>
  </Modal>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import Modal from './Modal.vue';
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const modalValue = ref(props.isOpen);
const userName = ref('');
const cardNumber = ref('');

const emit = defineEmits(['confirm', 'update:isOpen']);

const closeModal = () => {
  emit('update:isOpen', false);
};

const confirmDelete = () => {
  emit('confirm');
};
</script>

<style lang="scss">
.form-row {
  margin-bottom: 12px;
}
</style>