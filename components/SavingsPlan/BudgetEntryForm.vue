<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import BaseButton from '~/components/Buttons/BaseButton.vue';
import BaseMonthPicker from '~/components/MonthPicker/BaseMonthPicker.vue';
import {amountToCents, isValidEntryPeriod} from '~/utils/savingsPlan';
import type {SavingsPlanEntryValues} from '~/utils/savingsPlan';
import type {SavingsPlanAccount} from '~/types/savingsPlan';

const props = defineProps<{
  idPrefix: string;
  buttonVariant: 'green' | 'red';
  firstMonth: string;
  lastMonth: string;
  initialValue?: SavingsPlanEntryValues;
  accounts: SavingsPlanAccount[];
  defaultAccountId: string | null;
}>();
const emit = defineEmits<{
  submit: [entry: SavingsPlanEntryValues];
  cancel: [];
  change: [];
}>();
const name = ref(props.initialValue?.name ?? '');
const amount = ref(String(props.initialValue?.amount ?? ''));
const accountId = ref<string | null>(props.initialValue?.accountId ?? null);
const defaultAccountName = computed(() => props.accounts.find(account => account.id === props.defaultAccountId)?.name);
const missingAccount = computed(() => !!accountId.value && !props.accounts.some(account => account.id === accountId.value));
const invalidAccount = computed(() => !!accountId.value && !props.accounts.some(account => account.id === accountId.value && account.currency === 'EUR'));
const hasStart = ref(!!props.initialValue?.startMonth);
const hasEnd = ref(!!props.initialValue?.endMonth);
const startMonth = ref(props.initialValue?.startMonth ?? props.firstMonth);
const endMonth = ref(props.initialValue?.endMonth ?? props.lastMonth);
const attempted = ref(false);
const periodOpen = ref(!!props.initialValue?.startMonth || !!props.initialValue?.endMonth);
const onPeriodToggle = (event: Event) => {
  periodOpen.value = (event.target as HTMLDetailsElement).open;
};
watch(() => props.firstMonth, value => { if (!hasStart.value) startMonth.value = value; });
watch(() => props.lastMonth, value => { if (!hasEnd.value) endMonth.value = value; });
const invalidName = computed(() => !name.value.trim());
const invalidAmount = computed(() => !amount.value.trim() || amountToCents(amount.value) === null);
const values = computed<SavingsPlanEntryValues>(() => ({
  name: name.value.trim(), amount: amount.value.trim(),
  startMonth: hasStart.value ? startMonth.value : null,
  endMonth: hasEnd.value ? endMonth.value : null,
  accountId: accountId.value,
}));
const invalidPeriod = computed(() => !isValidEntryPeriod(values.value));
const hasError = computed(() => attempted.value && (invalidName.value || invalidAmount.value || invalidPeriod.value || invalidAccount.value));
const submit = () => {
  emit('change');
  attempted.value = true;
  if (invalidName.value || invalidAmount.value || invalidPeriod.value || invalidAccount.value) return;
  emit('submit', {...values.value});
  if (props.initialValue) return;
  name.value = '';
  amount.value = '';
  accountId.value = null;
  hasStart.value = false;
  hasEnd.value = false;
  startMonth.value = props.firstMonth;
  endMonth.value = props.lastMonth;
  periodOpen.value = false;
  attempted.value = false;
};
</script>

<template>
  <form class="budget-entry-form" novalidate @submit.prevent="submit" @input="emit('change')" @change="emit('change')">
    <div class="budget-entries__row">
      <label :for="`${idPrefix}-name`">
        <span>{{ $t('savingsPlan.entryName') }}</span>
        <input
          :id="`${idPrefix}-name`" v-model="name" type="text" maxlength="100" :placeholder="$t('savingsPlan.namePlaceholder')"
          :aria-invalid="attempted && invalidName" :aria-describedby="hasError ? `${idPrefix}-error` : undefined">
      </label>
      <label :for="`${idPrefix}-amount`">
        <span>{{ $t('savingsPlan.amount') }} (€)</span>
        <input
          :id="`${idPrefix}-amount`" v-model="amount" type="text" inputmode="decimal" maxlength="20" placeholder="0.00"
          :aria-invalid="attempted && invalidAmount" :aria-describedby="hasError ? `${idPrefix}-error` : undefined">
      </label>
    </div>
    <label class="budget-entry-form__account" :for="`${idPrefix}-account`">
      <span>{{ $t(buttonVariant === 'green' ? 'savingsPlan.incomeAccount' : 'savingsPlan.expenseAccount') }}</span>
      <select :id="`${idPrefix}-account`" v-model="accountId" :aria-invalid="invalidAccount" :aria-describedby="hasError ? `${idPrefix}-error` : undefined">
        <option :value="null">{{ $t('savingsPlan.useDefaultAccount', {name: defaultAccountName || $t('savingsPlan.noAccount')}) }}</option>
        <option v-if="missingAccount" :value="accountId" disabled>{{ $t('savingsPlan.unavailableAccount') }}</option>
        <option v-for="account in accounts" :key="account.id" :value="account.id" :disabled="account.currency !== 'EUR'">{{ account.name }} ({{ account.currency }})</option>
      </select>
    </label>
    <details class="budget-entry-form__period" :open="periodOpen" @toggle="onPeriodToggle">
      <summary>{{ $t('savingsPlan.entryPeriod') }}</summary>
      <div class="budget-entry-form__bound">
        <label class="budget-entry-form__checkbox">
          <input :id="`${idPrefix}-has-start`" v-model="hasStart" type="checkbox">
          {{ $t('savingsPlan.setStart') }}
        </label>
        <BaseMonthPicker
          v-if="hasStart" :id="`${idPrefix}-start`" v-model="startMonth" :label="$t('savingsPlan.validFrom')"
          :invalid="attempted && invalidPeriod" :described-by="hasError ? `${idPrefix}-error` : undefined" @update:model-value="emit('change')"/>
        <span v-else class="budget-entry-form__hint">{{ $t('savingsPlan.fromPlanStart') }}</span>
      </div>
      <div class="budget-entry-form__bound">
        <label class="budget-entry-form__checkbox">
          <input :id="`${idPrefix}-has-end`" v-model="hasEnd" type="checkbox">
          {{ $t('savingsPlan.setEnd') }}
        </label>
        <BaseMonthPicker
          v-if="hasEnd" :id="`${idPrefix}-end`" v-model="endMonth" :label="$t('savingsPlan.validThrough')"
          :invalid="attempted && invalidPeriod" :described-by="hasError ? `${idPrefix}-error` : undefined" @update:model-value="emit('change')"/>
        <span v-else class="budget-entry-form__hint">{{ $t('savingsPlan.toPlanEnd') }}</span>
      </div>
    </details>
    <div class="budget-entry-form__actions">
      <BaseButton type="submit" size="small" :variant="buttonVariant">{{ $t(initialValue ? 'savingsPlan.saveEntry' : 'savingsPlan.addEntry') }}</BaseButton>
      <BaseButton v-if="initialValue" size="small" variant="transparent" @click="emit('cancel')">{{ $t('savingsPlan.cancelEdit') }}</BaseButton>
      <slot name="actions"/>
    </div>
    <p v-if="hasError" :id="`${idPrefix}-error`" class="budget-entry-form__error" role="alert">
      {{ $t(invalidName ? 'savingsPlan.nameRequired' : invalidAmount ? 'savingsPlan.invalidAmount' : invalidAccount ? 'savingsPlan.accountWarning' : 'savingsPlan.invalidEntryPeriod') }}
    </p>
  </form>
</template>

<style scoped>
.budget-entries__row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 140px); gap: 10px; align-items: end; padding-top: 10px; margin-bottom: 14px; }
label { display: grid; min-width: 0; gap: 6px; font-size: 14px; }
input:not([type='checkbox']), select { width: 100%; min-width: 0; height: 44px; padding: 10px; border: 1px solid var(--input-border-color); border-radius: 8px; background: var(--card-bg-color, #fff); color: inherit; }
.budget-entry-form__account { margin-bottom: 16px; }
input:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
input[aria-invalid='true'] { border-color: #dc2626; }
.budget-entry-form__period { margin-bottom: 16px; }
summary { cursor: pointer; font-size: 14px; }
.budget-entry-form__bound { display: grid; gap: 8px; margin-top: 14px; }
.budget-entry-form__checkbox { display: flex; align-items: center; gap: 8px; }
.budget-entry-form__checkbox input { width: 16px; height: 16px; accent-color: #2563eb; }
.budget-entry-form__hint { font-size: 13px; opacity: 0.7; }
.budget-entry-form__actions { display: flex; flex-wrap: wrap; gap: 10px; }
.budget-entry-form__error { margin: 10px 0 0; color: #b91c1c; font-size: 14px; }
:global(.dark) .budget-entry-form__error { color: #fca5a5; }
@media (max-width: 480px) {
  .budget-entries__row { grid-template-columns: minmax(0, 1fr) minmax(0, 105px); gap: 6px; }
}
</style>
