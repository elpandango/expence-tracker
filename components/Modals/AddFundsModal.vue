<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      {{ $t('components.modalsContent.addFundsModal.addTitleText')}}
    </template>
    <template v-slot:body>
      <form @submit.prevent>
        <div class="form-row">
          <div class="dropdown-label">{{ $t('components.modalsContent.addExpenseModal.expenseDateLabelText') }}</div>
          <Dropdown
           v-model="selectedCard"
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
           :placeholder="$t('components.modalsContent.addFundsModal.fundsDescriptionPlaceholderText')"
           :label="$t('components.modalsContent.addFundsModal.fundsDescriptionLabelText')"/>
        </div>
        <div class="form-row">
          <BaseInput
           v-model="transaction.amount"
           size="medium"
           type="number"
           :status="transactionAmountError ? 'error' : ''"
           :error-message="transactionAmountError ? transactionAmountError : ''"
           :placeholder="$t('components.modalsContent.addFundsModal.fundsAmountPlaceholderText')"
           :label="$t('components.modalsContent.addFundsModal.fundsAmountLabelText')"/>
        </div>
        <div class="form-row">
          <div class="dropdown-label">{{ $t('components.modalsContent.addFundsModal.fundsDateLabelText') }}</div>
          <Datepicker
           height="50px"
           v-model="transaction.date"
           placeholder="Select start date"/>
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
       @click="handleAddFunds"
       size="big">{{$t('components.modalsContent.addFundsModal.modalAddFundsText')}}
      </BaseButton>
    </template>
  </Modal>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import Modal from './Modal.vue';
import Dropdown from "~/components/Dropdown/Dropdown.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

import {useFinanceStore} from "~/stores/finance";
import {useCardsList} from "~/use/useCardList";
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";

const financeStore = useFinanceStore();

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
const cards = ref([]);
const modalValue = ref(props.isOpen);
const transactionDescriptionError = ref<string | null>(null);
const transactionAmountError = ref<string | null>(null);

interface BalanceUpdate {
  cardId: string;
  description?: string;
  amount: string;
  date?: Date;
}

const transaction = reactive<BalanceUpdate>({
  cardId: '',
  description: '',
  amount: '',
  date: new Date(),
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const handleAddFunds = async () => {
  transactionDescriptionError.value = null;

  if (transaction.amount === '' || transaction.amount == '0') {
    transactionAmountError.value = 'Amount field must be not empty.';
    return;
  }

  transactionAmountError.value = null;

  const cardId = selectedCard.value.value !== '' ? selectedCard.value.value : null;

  closeModal();

  await financeStore.addFunds(cardId, {
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date,
  });
};

onMounted(async () => {
  const {cardsList} = useCardsList([{value: null, label: 'Cash'}]);
  cards.value = cardsList.value;
});
</script>

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>