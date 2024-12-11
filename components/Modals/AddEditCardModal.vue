<template>
  <Modal
   v-model="modalValue"
   @update:modelValue="closeModal">
    <template v-slot:header>
      {{ isEditMode ? $t('components.modalsContent.addCardModal.addTitleText') : $t('components.modalsContent.addCardModal.editTitleText') }}
    </template>
    <template v-slot:body>
      <form>
        <div class="form-row">
          <BaseInput
           v-model="cardName"
           size="medium"
           :placeholder="$t('components.modalsContent.addCardModal.cardNamePlaceholderText')"
           :label="$t('components.modalsContent.addCardModal.cardNameLabelText')"/>
        </div>
        <div class="form-row">
          <BaseInput v-if="isEditMode"
           v-model="cardNumber"
           size="medium"
           :label="$t('components.modalsContent.addCardModal.cardNumberLabelText')"
           :placeholder="$t('components.modalsContent.addCardModal.cardNumberPlaceholderText')"
           :status="cardNumberError ? 'error' : ''"
           :error-message="cardNumberError ? cardNumberError : ''"
           :disabled="true"/>

          <BaseInput v-else
           v-model="formattedCardNumber"
           size="medium"
           :label="$t('components.modalsContent.addCardModal.cardNumberLabelText')"
           :placeholder="$t('components.modalsContent.addCardModal.cardNumberPlaceholderText')"
           :status="cardNumberError ? 'error' : ''"
           :error-message="cardNumberError ? cardNumberError : ''"
           @input="formatCardNumber"/>
        </div>
        <div class="form-row">
          <BaseInput
           v-model="cardBalance"
           size="medium"
           :placeholder="$t('components.modalsContent.addCardModal.cardBalancePlaceholderText')"
           :label="$t('components.modalsContent.addCardModal.cardBalanceLabelText')"/>
        </div>
        <div class="form-row">
          <BaseInput
           v-model="cardCurrency"
           size="medium"
           :placeholder="$t('components.modalsContent.addCardModal.cardCurrencyPlaceholderText')"
           :label="$t('components.modalsContent.addCardModal.cardCurrencyLabelText')"/>
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
       @click="handleSaveCard"
       size="big">{{ isEditMode ? $t('components.modalsContent.addCardModal.modalEditCardText') : $t('components.modalsContent.addCardModal.modalAddCardText') }}
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
import {useFormatCardNumber} from "~/use/useFormatCardNumber";
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  card: {
    type: Object,
    default: () => ({})
  }
});

const modalValue = ref(props.isOpen);
const cardName = ref('');
const cardNumber = ref('');
const cardBalance = ref('0');
const cardCurrency = ref('USD');
const formattedCardNumber = ref('');
const cardNumberError = ref<string | null>(null);

const emit = defineEmits(['card-saved', 'update:isOpen']);

const closeModal = () => {
  emit('update:isOpen', false);
};

const handleSaveCard = () => {
  if (!props.isEditMode) {
    if (!/^\d{16}$/.test(cardNumber.value)) {
      cardNumberError.value = 'Card number must be exactly 16 digits.';
      return;
    }
  }

  cardNumberError.value = null;

  emit('card-saved', {
    name: cardName.value,
    number: cardNumber.value,
    balance: cardBalance.value,
    currency: cardCurrency.value
  });
};

const formatCardNumber = () => {
  const {rawValue, formattedNumber} = useFormatCardNumber(formattedCardNumber.value);
  formattedCardNumber.value = formattedNumber;
  cardNumber.value = rawValue.slice(0, 16);
};

watchEffect(() => {
  const newCard = props.card;
  const newIsEditMode = props.isEditMode;
  const defaultCardData = {
    name: '',
    number: '',
    balance: '0',
    currency: 'USD'
  };

  const cardData = newIsEditMode ? newCard : defaultCardData;
  cardName.value = cardData.name || '';
  cardNumber.value = cardData.number || '';
  cardBalance.value = cardData.balance || '0';
  cardCurrency.value = cardData.currency || 'USD';

});
</script>

<style lang="scss">
.form-row {
  margin-bottom: 22px;
}
</style>