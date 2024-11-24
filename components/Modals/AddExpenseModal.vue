<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      Adding a New Expense
    </template>
    <template v-slot:body>
      <form @submit.prevent>
        <div class="form-row">

          <Dropdown
           v-model="selectedCard"
           :options="cardsList"
           type="form-dropdown"
           size="medium"
           placeholder="Select payment type"
          />

        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="expense.description"
           size="medium"
           :status="expenseDescriptionError ? 'error' : ''"
           :error-message="expenseDescriptionError ? expenseDescriptionError : ''"
           label="Expense description"/>
        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="expense.amount"
           size="medium"
           type="number"
           :status="expenseAmountError ? 'error' : ''"
           :error-message="expenseAmountError ? expenseAmountError : ''"
           label="Expense amount"/>
        </div>
        <div class="form-row">
          <FloatLabelInput
           v-model="expense.date"
           size="medium"
           type="date"
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
import Dropdown from "~/components/Dropdown/Dropdown.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

import repositoryFactory from "~/repositories/repositoryFactory";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const selectedCard = ref({
  value: null,
  label: 'Cash'
});
const cardsList = ref([]);
const modalValue = ref(props.isOpen);
const expenseDescriptionError = ref<string | null>(null);
const expenseAmountError = ref<string | null>(null);

interface Expense {
  cardId: string;
  description: string;
  amount: string;
  date?: Date;
  category: string;
}

const expense = reactive<Expense>({
  cardId: '',
  description: '',
  amount: '',
  date: new Date(),
  category: ''
});

const emit = defineEmits(['expense-added', 'close']);

const closeModal = () => {
  emit('close');
};

const handleAddExpense = async () => {
  console.log('expense: ', expense);

  if (expense.description === '') {

    console.log(1);

    expenseDescriptionError.value = 'Description field must be not empty.';
    return;
  }

  expenseDescriptionError.value = null;

  if (expense.amount === '' || expense.amount == '0') {
    expenseAmountError.value = 'Amount field must be not empty.';
    return;
  }

  expenseAmountError.value = null;

  const newExpense = await repositoryFactory.get('Expense').createExpense({
    cardId: selectedCard.value.value !== '' ? selectedCard.value.value : null,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    category: expense.category,
  });

  console.log('newExpense: ', newExpense);

  if (newExpense?.status === 200) {
    closeModal();
  }
};

const fetchCards = async () => {
  const {cards} = await repositoryFactory.get('Card').getAllCards();
  const cardsArray = cards.map(card => {
    return {
      value: card._id,
      label: card.number,
    }
  });

  cardsArray.unshift({
    value: null,
    label: 'Cash'
  });

  return cardsArray;
};

onMounted(async () => {
  cardsList.value = await fetchCards();
});
</script>

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>