<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      Adding a New Expense
    </template>
    <template v-slot:body>
      <form>
        <div class="form-row">
          <FloatLabelInput
           v-model="userName"
           size="medium"
           label="Card name"/>
        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="formattedCardNumber"
           size="medium"
           label="Card number"
           :status="cardNumberError ? 'error' : ''"
           :error-message="cardNumberError ? cardNumberError : ''"
           @input="formatCardNumber"/>
        </div>
      </form>
    </template>
    <template v-slot:footer>
      <BaseButton
       @click="closeModal"
       variant="transparent"
       size="big">Cancel
      </BaseButton>
      <BaseButton
       @click="handleAddCard"
       size="big">Add a new expense
      </BaseButton>
    </template>
  </Modal>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import Modal from './Modal.vue';
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const modalValue = ref(props.isOpen);
const userName = ref('');
const cardNumber = ref('');
const formattedCardNumber = ref('');
const cardNumberError = ref<string | null>(null);

const emit = defineEmits(['expense-added', 'close']);

const closeModal = () => {
  emit('close');
};

const handleAddCard = () => {
  if (!/^\d{16}$/.test(cardNumber.value)) {
    cardNumberError.value = 'Card number must be exactly 16 digits.';
    return;
  }

  cardNumberError.value = null;

  emit('expense-added', {name: userName.value, number: cardNumber.value});
};

const formatCardNumber = () => {
  const rawValue = formattedCardNumber.value.replace(/\D/g, '');

  if (rawValue.length > 16) {
    formattedCardNumber.value = rawValue.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  } else {
    formattedCardNumber.value = rawValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  cardNumber.value = rawValue.slice(0, 16);
};


</script>

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>