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
           v-model="expense.cardId"
           size="medium"
           label="Card id"/>
        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="expense.description"
           size="medium"
           label="Expense description"/>
        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="expense.amount"
           size="medium"
           label="Expense amount"/>
        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="expense.date"
           size="medium"
           label="Expense date"/>
        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="expense.category"
           size="medium"
           label="Expense category"/>
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
       @click="handleAddExpense"
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

import repositoryFactory from "~/repositories/repositoryFactory";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const modalValue = ref(props.isOpen);

interface Expense {
  cardId: string;
  description: string;
  amount: number;
  date?: Date;
  category: string;
}

const expense = reactive<Expense>({
  cardId: '',
  description: '',
  amount: 0,
  date: new Date(),
  category: ''
});

const emit = defineEmits(['expense-added', 'close']);

const closeModal = () => {
  emit('close');
};

const handleAddExpense = async() => {

  console.log('expense: ', expense);

  const newExpense = await repositoryFactory.get('Expense').createExpense({
    cardId: expense.cardId !== '' ?  expense.cardId : null,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    category: expense.category,
  });

  console.log('newExpense: ', newExpense);
};

</script>

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>