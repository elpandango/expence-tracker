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
           :options="cards"
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

          <Datepicker
           height="50px"
           v-model="expense.date"
           placeholder="Select start date"/>

        </div>
        <div class="form-row">
          <CategoryDropdown
           v-model="expense.category"
           :options="categories"
           type="form-dropdown"
           size="medium"
           placeholder="Select expense category"
          />
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

import {useFinanceStore} from "~/stores/finance";
import {useCategoryStore} from "~/stores/category";
import {useCardsList} from "~/use/useCardList";
import CategoryDropdown from "~/components/Dropdown/CategoryDropdown.vue";

const emit = defineEmits(['close']);

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const financeStore = useFinanceStore();
const categoryStore = useCategoryStore();

const selectedCard = ref({
  value: null,
  label: 'Cash'
});
const cards = ref([]);
const categories = ref([]);
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
  category: {
    value: null,
    label: 'Other'
  }
});

const closeModal = () => {
  emit('close');
};

const handleAddExpense = async () => {
  if (expense.description === '') {
    expenseDescriptionError.value = 'Description field must be not empty.';
    return;
  }

  expenseDescriptionError.value = null;

  if (expense.amount === '' || expense.amount == '0') {
    expenseAmountError.value = 'Amount field must be not empty.';
    return;
  }

  expenseAmountError.value = null;

  closeModal();

  await financeStore.addExpense({
    cardId: selectedCard.value.value !== '' ? selectedCard.value.value : null,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    category: expense.category.value,
  });
};

onMounted(async () => {
  await financeStore.fetchCardsIfNeeded();
  const {cardsList} = useCardsList([{value: null, label: 'Cash'}]);
  cards.value = cardsList.value;
  await categoryStore.fetchCategoriesIfNeeded();

  categories.value = categoryStore.categories.map(ctg => {
    return {
      value: ctg._id,
      label: ctg.name,
      color: ctg.color,
      icon: ctg.icon
    }
  });
});
</script>

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>