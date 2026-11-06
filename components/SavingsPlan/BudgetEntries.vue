<script setup lang="ts">
import {computed, onBeforeUnmount, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import BaseButton from '~/components/Buttons/BaseButton.vue';
import Modal from '~/components/Modals/Modal.vue';
import BudgetEntryForm from './BudgetEntryForm.vue';
import Accordion from '~/components/Accordion/Accordion.vue';
import type {SavingsPlanEntry, SavingsPlanEntryValues} from '~/utils/savingsPlan';
import type {SavingsPlanAccount} from '~/types/savingsPlan';
import {amountToCents} from '~/utils/savingsPlan';

const props = defineProps<{
  entries: SavingsPlanEntry[];
  title: string;
  idPrefix: string;
  total: string;
  buttonVariant: 'green' | 'red';
  firstMonth: string;
  lastMonth: string;
  accounts: SavingsPlanAccount[];
  defaultAccountId: string | null;
}>();

const emit = defineEmits<{
  add: [entry: SavingsPlanEntryValues];
  update: [id: number, entry: SavingsPlanEntryValues];
  remove: [id: number];
}>();

const {t, locale} = useI18n();
const added = ref(false);
let successTimer: ReturnType<typeof setTimeout> | undefined;
const hideSuccess = () => {
  clearTimeout(successTimer);
  successTimer = undefined;
  added.value = false;
};
onBeforeUnmount(hideSuccess);
const detailsOpen = ref(false);
const editingId = ref<number | null>(null);
const editingEntry = computed(() => props.entries.find(entry => entry.id === editingId.value));
const formatter = computed(() => new Intl.NumberFormat(locale.value === 'ua' ? 'uk' : locale.value, {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2,
}));
const money = (amount: number | string) => formatter.value.format((amountToCents(amount) ?? 0) / 100);
const addEntry = (entry: SavingsPlanEntryValues) => {
  hideSuccess();
  emit('add', entry);
  added.value = true;
  successTimer = setTimeout(hideSuccess, 3000);
};
const removeEntry = (id: number) => {
  hideSuccess();
  emit('remove', id);
};
const saveEntry = (entry: SavingsPlanEntryValues) => {
  if (editingId.value === null) return;
  emit('update', editingId.value, entry);
  editingId.value = null;
};
const openDetails = () => {
  editingId.value = null;
  detailsOpen.value = true;
};
const formatMonth = (month: string) => new Intl.DateTimeFormat(locale.value === 'ua' ? 'uk' : locale.value, {
  month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${month}-01T00:00:00Z`));
const formatPeriod = (entry: SavingsPlanEntry) => {
  const start = entry.startMonth ? formatMonth(entry.startMonth) : t('savingsPlan.fromPlanStart');
  const end = entry.endMonth ? formatMonth(entry.endMonth) : t('savingsPlan.toPlanEnd');
  return `${start} — ${end}`;
};
const accountName = (entry: SavingsPlanEntry) => {
  const id = entry.accountId ?? props.defaultAccountId;
  if (!id) return t('savingsPlan.noAccount');
  const account = props.accounts.find(account => account.id === id);
  if (!account || account.currency !== 'EUR') return t('savingsPlan.unavailableAccount');
  return entry.accountId ? account.name : t('savingsPlan.useDefaultAccount', {name: account.name});
};
</script>

<template>
  <section class="budget-entries">
    <Accordion :card-like="true" height="auto" header-class="px-4 py-4 md:px-5" body-class="px-4 pb-4 md:px-5 md:pb-5">
    <template #header>
    <div class="budget-entries__heading">
      <h2>{{ title }}</h2>
      <div class="budget-entries__heading-total"><strong>{{ total }}</strong></div>
    </div>
    </template>
    <template #accordion-body>
    <BudgetEntryForm :id-prefix="idPrefix" :button-variant="buttonVariant" :first-month="firstMonth" :last-month="lastMonth" :accounts="accounts" :default-account-id="defaultAccountId" @submit="addEntry" @change="hideSuccess">
      <template #actions>
        <BaseButton class="budget-entries__details" variant="transparent" size="small" @click="openDetails">
          {{ $t('savingsPlan.details') }} ({{ entries.length }})
        </BaseButton>
      </template>
    </BudgetEntryForm>
    <div v-if="added" class="budget-entries__feedback" aria-live="polite">
      <p class="budget-entries__success" role="status">{{ $t('savingsPlan.entryAdded') }}</p>
    </div>
    </template>
    </Accordion>

    <Modal v-if="detailsOpen" v-model="detailsOpen">
      <template #header>{{ title }}</template>
      <template #body>
        <BudgetEntryForm
          v-if="editingEntry" :key="editingEntry.id" :id-prefix="`${idPrefix}-edit`" :initial-value="editingEntry"
          :button-variant="buttonVariant" :first-month="firstMonth" :last-month="lastMonth" :accounts="accounts" :default-account-id="defaultAccountId" @submit="saveEntry" @cancel="editingId = null"/>
        <p v-else-if="!entries.length" class="budget-entries__empty">{{ $t('savingsPlan.emptyEntries') }}</p>
        <ul v-else class="budget-entries__list">
          <li v-for="entry in entries" :key="entry.id" class="budget-entries__item">
            <span class="budget-entries__item-name">{{ entry.name }}<small>{{ accountName(entry) }}</small><small>{{ formatPeriod(entry) }}</small></span>
            <strong>{{ money(entry.amount) }}</strong>
            <button type="button" class="budget-entries__edit" :aria-label="`${$t('savingsPlan.editEntry')}: ${entry.name}`" @click="editingId = entry.id">
              <span class="material-symbols-outlined" aria-hidden="true">edit</span>
            </button>
            <button
              type="button" class="budget-entries__remove"
              :aria-label="`${$t('savingsPlan.remove')}: ${entry.name}`"
              @click="removeEntry(entry.id)">
              <span class="material-symbols-outlined" aria-hidden="true">delete</span>
            </button>
          </li>
        </ul>
        <div class="budget-entries__total"><span>{{ $t('savingsPlan.total') }}</span><strong>{{ total }}</strong></div>
      </template>
      <template #footer>
        <BaseButton variant="transparent" @click="detailsOpen = false">{{ $t('savingsPlan.close') }}</BaseButton>
      </template>
    </Modal>
  </section>
</template>

<style scoped>
.budget-entries { min-width: 0; }
.budget-entries__heading { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; width: 100%; padding-right: 16px; }
.budget-entries h2 { margin: 0; font-size: 18px; font-weight: 600; }
.budget-entries__heading strong { font-size: 18px; font-variant-numeric: tabular-nums; }
.budget-entries__heading-total { text-align: right; }
.budget-entries__remove { display: grid; place-items: center; width: 36px; height: 44px; color: #b91c1c; border-radius: 8px; }
.budget-entries__remove:hover { background: rgba(220, 38, 38, 0.08); }
.budget-entries__empty { opacity: 0.7; }
.budget-entries__feedback { padding-top: 10px; font-size: 14px; }
.budget-entries__feedback p { margin: 0; }
.budget-entries__success { color: #15803d; }
.budget-entries__list { margin: 0; padding: 0; list-style: none; }
.budget-entries__item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--input-border-color); }
.budget-entries__item-name { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.budget-entries__item-name small { display: block; margin-top: 5px; font-size: 12px; line-height: 1.4; opacity: 0.7; }
.budget-entries__edit { display: grid; place-items: center; width: 36px; height: 44px; color: #2563eb; border-radius: 8px; }
.budget-entries__edit:hover { background: rgba(37, 99, 235, 0.08); }
.budget-entries__item strong { font-variant-numeric: tabular-nums; white-space: nowrap; }
.budget-entries__item button { flex-shrink: 0; }
.budget-entries__total { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; }
:global(.dark) .budget-entries__success { color: #86efac; }
:global(.dark) .budget-entries__remove { color: #fca5a5; }
</style>
