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
            $t(`components.modalsContent.addEditTransactionModal.${transactionTypeLocal === 'expense' ? 'addExpenseTitleText' : 'addFundsTitleText'}`)
          }}
        </div>
      </div>
    </template>
    <template v-slot:body>
      <Preloader
       height="250px"
       v-if="isLoading"/>
      <template v-else>
        <form
         v-if="financeStore.accountsList && financeStore.accountsList.length"
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
             v-model="selectedAccount"
             :options="accounts"
             type="form-dropdown"
             size="medium"
             :placeholder="selectAccountPlaceholder"
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
           v-if="transactionTypeLocal === 'expense'"
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
        <div
         v-else
         class="empty-message">
          <p>{{ $t('components.modalsContent.addEditTransactionModal.emptyAccountsText') }}</p>
          <div class="btn-block">
            <BaseButton
             @click="goToAccounts"
             size="medium">{{ $t('components.modalsContent.addEditTransactionModal.goToAccountsBtnText') }}
            </BaseButton>
            <BaseButton
             @click="handleCreateTestData"
             size="medium">{{ $t('components.modalsContent.addEditTransactionModal.generateTestDataBtnText') }}
            </BaseButton>
          </div>
        </div>
      </template>
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
import {ref, reactive, computed, onMounted, watch} from 'vue';
import {useFinanceStore} from '~/stores/finance';
import {useCategoryStore} from '~/stores/category';
import {useCurrencyFormatter} from "~/use/useCurrencyFormatter";
import {useI18n} from 'vue-i18n';
import Modal from './Modal.vue';
import Dropdown from '~/components/Dropdown/Dropdown.vue';
import BaseButton from '~/components/Buttons/BaseButton.vue';
import Datepicker from '~/components/Datepicker/Datepicker.vue';
import {emitter} from "~/classes/uiEventBus";
import {useGenerateTestData} from "~/use/useGenerateTestData";

const CategoryDropdown = defineAsyncComponent(() => import('~/components/Dropdown/CategoryDropdown.vue'));
const BaseInput = defineAsyncComponent(() => import('~/components/Forms/Inputs/BaseInput.vue'));

const props = defineProps({
  isOpen: {type: Boolean, required: true},
  transactionType: {type: String, default: 'expense'}
});

const {locale} = useI18n();
const {generateTestData} = useGenerateTestData();
const {formatCurrency} = useCurrencyFormatter();
const financeStore = useFinanceStore();
const categoryStore = useCategoryStore();

const isLoading = ref(true);
const modalValue = ref(props.isOpen);
const transactionTypeLocal = ref(props.transactionType);
const transactionTypes = ['expense', 'income'];

const selectedAccount = ref(null);

const accounts = ref([]);
const defaultCategoriesOtherValues = {
  ru: 'Прочие расходы',
  ua: 'Інші витрати',
  en: 'Other',
  de: 'Sonstige Ausgaben',
};

const defaultAccountsValues = {
  ru: 'Выбрать счет',
  ua: 'Вибрати рахунок',
  en: 'Select Account',
  de: 'Konto auswählen',
};

const selectedCategory = ref({value: null, label: defaultCategoriesOtherValues[locale.value]});
const categories = ref([]);
const transaction = reactive({
  id: null,
  accountId: null,
  relatedAccountId: null,
  currency: '',
  description: '',
  amount: '',
  date: new Date(),
  category: null,
  type: transactionTypeLocal.value
});

const transactionDescriptionError = ref<string | null>(null);
const transactionAmountError = ref<string | null>(null);
const selectAccountPlaceholder = computed(() => {
  return defaultAccountsValues[locale.value];
});

const emit = defineEmits(['close']);

watch(modalValue, (newValue) => {
  if (newValue) resetTransactionFields();
});

const isEditMode = computed(() => !!financeStore.editingTransaction.value);

const closeModal = () => emit('close');

const setTransactionType = (type: string) => {
  transactionTypeLocal.value = type;
};

const populateAccountsList = async () => {
  await financeStore.fetchAccountsIfNeeded();
  accounts.value = financeStore.accountsList.map(account => ({
    value: account._id,
    currency: account.currency,
    label: `${account.name}: ${formatCurrency(account.balance, account.currency)}`
  }));
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

  transaction.id = editingTransaction._id || null;
  transaction.accountId = editingTransaction.accountId || null;
  transaction.relatedAccountId = editingTransaction.relatedAccountId || null;
  transaction.description = editingTransaction.description || '';
  transaction.currency = editingTransaction.currency;
  transaction.amount = Math.abs(editingTransaction.amount).toString();
  transaction.date = new Date(editingTransaction.date);

  selectedAccount.value = accounts.value.find(acc => acc.value === editingTransaction.accountId._id) || {
    value: null,
    label: defaultAccountsValues[locale.value],
    currency: ''
  };

  selectedCategory.value = categories.value.find(cat => cat.value === editingTransaction.category?._id) || {
    value: null,
    label: defaultCategoriesOtherValues[locale.value]
  };
};

const handleSaveTransaction = async () => {
  if (!transaction.amount || +transaction.amount === 0) {
    transactionAmountError.value = 'Amount field must not be empty.';
    return;
  }

  transactionDescriptionError.value = null;
  transactionAmountError.value = null;
  closeModal();

  try {
    if (isEditMode.value) {
      transaction.accountId = selectedAccount.value.value;
      transaction.currency = selectedAccount.value.currency;
      transaction.amount = parseFloat(transaction.amount);

      await financeStore.updateTransaction({
        ...transaction,
        type: transactionTypeLocal.value,
        category: selectedCategory.value.value
      });
    } else {
      transaction.accountId = selectedAccount.value.value;
      transaction.currency = selectedAccount.value.currency;
      transaction.amount = parseFloat(transaction.amount);
      transaction.category = selectedCategory.value.value;

      await financeStore.addTransaction({...transaction});
    }

  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

const resetTransactionFields = () => {
  transaction.accountId = null;
  transaction.relatedAccountId = null;
  transaction.description = '';
  transaction.amount = '';
  transaction.date = new Date();
  selectedAccount.value = null;
  selectedCategory.value = {value: null, label: defaultCategoriesOtherValues[locale.value]};
};

const handleCreateTestData = async () => {
  emitter.emit('ui:startLoading', 'default');
  closeModal();
  await generateTestData();
  emitter.emit('ui:stopLoading', 'default');
  window.location.reload();
};

const goToAccounts = () => {
  closeModal();
  navigateTo('/accounts');
};

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([await populateAccountsList(), await populateCategoriesList()]);
  isLoading.value = false;
  if (isEditMode.value) {
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

.modal-body {
  .empty-message {
    min-height: 250px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .btn-block {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 40px;
    }
  }
}

</style>
