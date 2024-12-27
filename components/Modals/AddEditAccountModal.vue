<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      {{ $t('components.modalsContent.addAccountModal.modalTitleText') }}
    </template>
    <template v-slot:body>
      <form @submit.prevent>
        <div class="form-row">
          <BaseInput
           v-model="accountName"
           size="medium"
           :placeholder="$t('components.modalsContent.addAccountModal.accountNamePlaceholderText')"
           :label="$t('components.modalsContent.addAccountModal.accountNameLabelText')"/>
        </div>

        <div class="form-row">
          <BaseInput
           v-model="accountBalance"
           size="medium"
           type="number"
           :disabled="isEditMode"
           :placeholder="$t('components.modalsContent.addAccountModal.accountBalancePlaceholderText')"
           :label="$t('components.modalsContent.addAccountModal.accountBalanceLabelText')"/>
        </div>
        <div class="form-row">
          <div class="dropdown-label">{{
              $t('components.modalsContent.addAccountModal.accountCurrencyLabelText')
            }}
          </div>

          <Dropdown
           v-model="selectedCurrency"
           :options="currencies"
           type="form-dropdown"
           :placeholder="$t('components.modalsContent.addAccountModal.chooseCurrencyText')"
          />
        </div>
        <div class="form-row">
          <div class="dropdown-label">{{ $t('components.transactionsPage.filters.sourceLabelText') }}</div>

          <Dropdown
           v-model="accountType"
           :options="accountTypesArray"
           v-if="!isEditMode"
           type="form-dropdown"
           placeholder="Select source"/>

          <BaseInput
           v-else
           v-model="accountType.value"
           disabled/>

        </div>
        <div
         class="form-row"
         v-if="accountType.value === 'card'">
          <BaseInput
           v-model="formattedCardNumber"
           size="medium"
           :label="$t('components.modalsContent.addCardModal.cardNumberLabelText')"
           :placeholder="$t('components.modalsContent.addCardModal.cardNumberPlaceholderText')"
           :status="cardNumberError ? 'error' : ''"
           :error-message="cardNumberError ? cardNumberError : ''"
           :disabled="isEditMode"
           @input="formatCardNumber"/>
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
       @click="handleSaveAccount"
       size="big">{{
          isEditMode ? $t('components.modalsContent.addAccountModal.modalEditCardText') : $t('components.modalsContent.addAccountModal.modalAddCardText')
        }}
      </BaseButton>
    </template>
  </Modal>
</template>

<script
 setup
 lang="ts">
import {computed, ref} from 'vue';
import {currencies} from "~/utils/currencies";
import Modal from './Modal.vue';
import BaseButton from "~/components/Buttons/BaseButton.vue";
import {useFinanceStore} from "~/stores/finance";
import {useFormatCardNumber} from "~/use/useFormatCardNumber";
const BaseInput = defineAsyncComponent(() => import('~/components/Forms/Inputs/BaseInput.vue'));

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  account: {
    type: Object,
    default: () => ({})
  }
});

const financeStore = useFinanceStore();
const cardNumber = ref('');
const formattedCardNumber = ref('');
const cardNumberError = ref<string | null>(null);
const modalValue = ref(props.isOpen);
const accountName = ref('');
const accountBalance = ref('');
const accountType = ref({
  value: 'cash',
  label: 'Cash'
});

const selectedCurrency = ref({
  value: 'EUR',
  label: 'Euro'
});

const accountTypesArray = [
  {value: 'card', label: 'Card'},
  {value: 'cash', label: 'Cash'},
];

const emit = defineEmits(['close']);

const isEditMode = computed(() => !!financeStore.editingAccount.value);

const closeModal = () => {
  emit('close');
};

const formatCardNumber = () => {
  const {rawValue, formattedNumber} = useFormatCardNumber(formattedCardNumber.value);
  formattedCardNumber.value = formattedNumber;
  cardNumber.value = rawValue.slice(0, 16);
};

const handleSaveAccount = async () => {
  closeModal();
  try {
    if (isEditMode.value) {
      await financeStore.updateAccount({
        id: financeStore.editingAccount.value._id,
        name: accountName.value,
        currency: selectedCurrency.value.value,
      });

    } else {
      await financeStore.addAccount({
        name: accountName.value,
        initialBalance: accountBalance.value ? parseFloat(accountBalance.value) : 0,
        currency: selectedCurrency.value.value,
        type: accountType.value.value,
        cardNumber: cardNumber.value ?? null,
      });
    }
  } catch (error) {
    console.error('Error updating account:', error);
  }
};

const resetAccountFields = () => {
  accountName.value = '';
  cardNumber.value = '';
  selectedCurrency.value = {
    value: 'EUR',
    label: 'Euro'
  };
  accountBalance.value = '';
  accountType.value = {
    value: 'cash',
    label: 'Cash'
  };
};

const populateAccountFields = () => {
  const editingAccount = financeStore.editingAccount.value;

  if (!editingAccount) return;

  accountName.value = editingAccount.name;
  accountBalance.value = editingAccount.balance;

  if (editingAccount.type === 'card') {
    cardNumber.value = editingAccount.cardNumber;
    formattedCardNumber.value = editingAccount.cardNumber;
  }

  accountType.value = {
    value: editingAccount.type || 'cash',
    label: editingAccount.type || 'Cash'
  };

  selectedCurrency.value = {
    value: editingAccount.currency || 'EUR',
    label: editingAccount.currency || 'EUR',
  };
};

watchEffect(() => {
  const newAccount = props.account;
  const newIsEditMode = props.isEditMode;
  const defaultAccountData = {
    name: '',
    balance: '',
    currency: 'EUR'
  };

  const accountData = newIsEditMode ? newAccount : defaultAccountData;
  accountName.value = accountData.name || '';
  accountBalance.value = accountData.balance || '';
  selectedCurrency.value = {
    value: accountData.currency || 'EUR',
    label: accountData.currency || 'EUR',
  };

});

onMounted(async () => {
  if (isEditMode.value) {
    populateAccountFields();
  } else {
    resetAccountFields();
  }
});
</script>

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>