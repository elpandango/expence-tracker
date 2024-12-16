<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      <div class="modal-header header-container">
        <div
         class="title"
         v-if="isEditMode">
          {{ $t(`components.modalsContent.addEditTransactionModal.editTransactionTitleText`) }}
        </div>
        <div
         v-else
         class="title">
          {{
            $t(`components.modalsContent.addEditTransactionModal.${transactionTypeLocal === 'addExpense' ? 'addExpenseTitleText' : 'addFundsTitleText'}`)
          }}
        </div>
      </div>
    </template>
    <template v-slot:body>
      <form
       @submit.prevent
       class="add-edit-transaction-modal">
        <div class="form-row">
          <div class="type-switcher">
            <div class="dropdown-label">{{
                $t('components.modalsContent.addEditTransactionModal.transactionTypeLabel')
              }}
            </div>
            <BaseButton
             v-for="type in transactionTypes"
             :key="type"
             size="small"
             :variant="transactionTypeLocal === type ? '' : 'transparent'"
             @click="setTransactionType(type)">
              {{ $t(`components.modalsContent.addEditTransactionModal.${type}`) }}
            </BaseButton>
          </div>
        </div>
        <div class="form-row">
          <div class="dropdown-label">{{
              $t('components.modalsContent.addEditTransactionModal.paymentTypeLabel')
            }}
          </div>

          <Dropdown
           v-model="selectedPaymentMethod"
           :options="cards"
           type="form-dropdown"
           size="medium"
           placeholder="Select where to add funds"
          />
        </div>
        <div class="form-row">
          <BaseInput
           v-model="transaction.description"
           size="medium"
           :status="transactionDescriptionError ? 'error' : ''"
           :error-message="transactionDescriptionError ? transactionDescriptionError : ''"
           :placeholder="$t('components.modalsContent.addEditTransactionModal.descriptionLabelText')"
           :label="$t('components.modalsContent.addEditTransactionModal.descriptionLabelText')"/>
        </div>
        <div class="form-row">
          <BaseInput
           v-model="transaction.amount"
           size="medium"
           type="number"
           :status="transactionAmountError ? 'error' : ''"
           :error-message="transactionAmountError ? transactionAmountError : ''"
           :placeholder="$t('components.modalsContent.addEditTransactionModal.amountLabelText')"
           :label="$t('components.modalsContent.addEditTransactionModal.amountLabelText')"/>
        </div>
        <div class="form-row">
          <div class="dropdown-label">{{ $t('components.modalsContent.addEditTransactionModal.dateLabelText') }}</div>
          <Datepicker
           height="50px"
           :max-date="new Date().toISOString().substring(0, 10)"
           v-model="transaction.date"/>
        </div>
        <div
         v-if="transactionTypeLocal === 'addExpense'"
         class="form-row">
          <div class="dropdown-label">{{
              $t('components.modalsContent.addEditTransactionModal.categoryLabelText')
            }}
          </div>
          <CategoryDropdown
           v-model="selectedCategory"
           :options="categories"
           type="form-dropdown"
           size="medium"
          />
        </div>
      </form>
    </template>
    <template v-slot:footer>
      <BaseButton
       @click="closeModal"
       variant="transparent"
       size="big">{{ $t('components.buttons.cancelText') }}
      </BaseButton>
      <BaseButton
       @click="handleSaveTransaction"
       size="big">

        {{
          $t(`components.modalsContent.addEditTransactionModal.${isEditMode ? 'editBtnText' : 'saveBtnText'}`)
        }}
      </BaseButton>
    </template>
  </Modal>
</template>

<script
 setup
 lang="ts">
import {ref, reactive, onMounted} from 'vue';
import {useFinanceStore} from '~/stores/finance';
import {useCategoryStore} from '~/stores/category';
import {useCardsList} from '~/use/useCardList';
import Modal from './Modal.vue';
import Dropdown from '~/components/Dropdown/Dropdown.vue';
import BaseButton from '~/components/Buttons/BaseButton.vue';
import BaseInput from '~/components/Forms/Inputs/BaseInput.vue';
import Datepicker from '~/components/Datepicker/Datepicker.vue';
import CategoryDropdown from '~/components/Dropdown/CategoryDropdown.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  transactionType: {
    type: String,
    default: 'addExpense'
  }
});

const financeStore = useFinanceStore();
const categoryStore = useCategoryStore();

const modalValue = ref(props.isOpen);
const transactionTypeLocal = ref(props.transactionType);
const transactionTypes = ['addExpense', 'addFunds'];
const selectedCategory = ref({value: null, label: 'Other'});
const selectedPaymentMethod = ref({value: null, label: 'Cash'});
const cards = ref([]);
const categories = ref([]);
const transaction = reactive({
  cardId: '',
  description: '',
  amount: '',
  date: new Date(),
  source: '',
  sourceCategory: '',
  type: '',
});
const transactionDescriptionError = ref<string | null>(null);
const transactionAmountError = ref<string | null>(null);

const emit = defineEmits(['close']);

watch(modalValue, (newValue) => {
  if (newValue) {
    resetTransactionFields();
  }
});

const isEditMode = computed(() => !!financeStore.editingTransaction.value);

const closeModal = () => {
  emit('close');
};

const setTransactionType = (type: string) => {
  transactionTypeLocal.value = type;
};

const populateCategoriesList = async () => {
  await categoryStore.fetchCategoriesIfNeeded();
  categories.value = categoryStore.categories.map(ctg => ({
    value: ctg._id,
    label: ctg.name,
    color: ctg.color,
    icon: ctg.icon
  }));
};

const populateTransactionFields = () => {
  const editingTransaction = financeStore.editingTransaction.value;
  if (!editingTransaction) return;

  transaction.cardId = editingTransaction.cardId || '';
  transaction.description = editingTransaction.description || '';
  transaction.source = editingTransaction.source || '';
  transaction.sourceCategory = editingTransaction.sourceCategory || '';
  transaction.type = editingTransaction.type || '';
  transaction.amount = Math.abs(editingTransaction.amount).toString();
  transaction.date = new Date(editingTransaction.date);

  selectedCategory.value = editingTransaction.category._id
   ? {value: editingTransaction.category._id, label: editingTransaction.category.name}
   : {value: null, label: 'Other'};

  selectedPaymentMethod.value = editingTransaction.source === 'cash'
   ? {value: null, label: 'Cash'}
   : {
     value: editingTransaction?.cardId?._id || null,
     label: (editingTransaction?.number || editingTransaction?.cardId?.number) || ''
   };
};

const handleSaveTransaction = async () => {
  if (transaction.description === '') {
    transactionDescriptionError.value = 'Description field must be not empty.';
    return;
  }
  if (transaction.amount === '' || transaction.amount === '0') {
    transactionAmountError.value = 'Amount field must be not empty.';
    return;
  }

  transactionDescriptionError.value = null;
  transactionAmountError.value = null;

  closeModal();

  if (isEditMode.value) {
    const editingTransaction = financeStore.editingTransaction.value;
    const newSourceCategory = transactionTypeLocal.value === 'addFunds' ? `${selectedPaymentMethod.value.value ? 'card deposit' : 'cash deposit'}` : 'expense';

    const oldData = {
      type: editingTransaction?.type?.toLowerCase(),
      source: editingTransaction?.source?.toLowerCase(),
      sourceCategory: editingTransaction?.sourceCategory?.toLowerCase(),
      amount: +editingTransaction.amount,
      date: editingTransaction.date,
      category: editingTransaction.category?._id || null,
      description: editingTransaction.description,
      currency: editingTransaction.currency || 'USD',
      cardId: editingTransaction.cardId || null,
    };

    const newData = {
      type: transactionTypeLocal.value === 'addFunds' ? 'deposit' : 'expense',
      source: selectedPaymentMethod.value.value ? 'card' : 'cash',
      sourceCategory: newSourceCategory.toLowerCase(),
      amount: +transaction.amount,
      date: transaction.date,
      category: transactionTypeLocal.value === 'addFunds' ? null : selectedCategory.value.value,
      description: transaction.description,
      currency: editingTransaction.currency || 'USD',
      cardId: selectedPaymentMethod.value.value || null,
    }

    try {
      await financeStore.updateTransaction(editingTransaction.id, {oldData, newData});
    } catch (error) {
      console.error('Error updating transaction:', error);
    }

  } else {
    if (transactionTypeLocal.value === 'addExpense') {
      await financeStore.addExpense({
        cardId: selectedPaymentMethod.value.value !== '' ? selectedPaymentMethod.value.value : null,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        currency: transaction.currency || 'USD',
        category: selectedCategory.value.value,
      });
    } else {
      await financeStore.addFunds(selectedPaymentMethod.value.value, transaction);
    }
  }
};

const resetTransactionFields = () => {
  transaction.cardId = '';
  transaction.description = '';
  transaction.amount = '';
  transaction.date = new Date();
  selectedPaymentMethod.value = {value: null, label: 'Cash'};
  selectedCategory.value = {value: null, label: 'Other'};
};

onMounted(async () => {
  await financeStore.fetchCardsIfNeeded();
  const {cardsList} = useCardsList([{value: null, label: 'Cash'}]);
  cards.value = cardsList.value;

  await populateCategoriesList();

  if (financeStore.editingTransaction?.value && JSON.stringify(financeStore.editingTransaction?.value) !== '{}') {
    const transactionType = financeStore.editingTransaction?.value?.type === 'deposit' ? 'addFunds' : 'addExpense';
    setTransactionType(transactionType);

    populateTransactionFields();
  } else {
    resetTransactionFields();
    setTransactionType(props.transactionType);
  }
});
</script>

<style
 lang="scss">
.add-edit-transaction-modal {
  .form-row {
    margin-bottom: 22px;
  }

  .modal-header.header-container {
    display: flex;
    flex-wrap: wrap;
  }

  .type {
    width: 100%;
  }

  .type-switcher {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .dropdown-label {
      width: 100%;
      font-weight: 400;
      font-size: 16px;
    }
  }

  .type-switcher button {
    padding: 5px 10px;
    cursor: pointer;
  }

  .button {
    min-width: 110px;
  }
}
</style>
