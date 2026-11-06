<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import Card from '~/components/Card/Card.vue';
import BudgetEntries from '~/components/SavingsPlan/BudgetEntries.vue';
import BaseMonthPicker from '~/components/MonthPicker/BaseMonthPicker.vue';
import BaseButton from '~/components/Buttons/BaseButton.vue';
import SavingsCalculatorModal from '~/components/Modals/SavingsCalculatorModal.vue';
import SavingsPlanRepository from '~/repositories/SavingsPlanRepository';
import {amountToCents, buildSavingsProjection, getMonthlyTotalCents, getPlanMonthCount, groupSavingsProjectionByYear, MAX_PLAN_MONTHS, UNASSIGNED_ACCOUNT} from '~/utils/savingsPlan';
import type {SavingsPlanEntry, SavingsPlanEntryValues} from '~/utils/savingsPlan';
import type {SavedPlanEntry, SavingsPlanAccount, SavingsPlanPayload} from '~/types/savingsPlan';

const {t, locale} = useI18n();
const calculatorOpen = ref(false);
useHead({title: () => `${t('savingsPlan.title')} - Expendango`});

// Keep the server and hydration defaults identical even across a month boundary.
const initialMonth = useState('savings-plan-initial-month', () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});
const startMonth = ref(initialMonth.value);
const [initialYear, initialMonthNumber] = initialMonth.value.split('-').map(Number);
const lastMonthIndex = initialYear * 12 + initialMonthNumber - 1 + 59;
const endMonth = ref(`${Math.floor(lastMonthIndex / 12)}-${String(lastMonthIndex % 12 + 1).padStart(2, '0')}`);
let nextId = 0;
const incomes = ref<SavingsPlanEntry[]>([]);
const expenses = ref<SavingsPlanEntry[]>([]);
const accounts = ref<SavingsPlanAccount[]>([]);
const defaultAccountId = ref<string | null>(null);
const unavailableAccounts = computed(() => {
  const ids = [defaultAccountId.value, ...[...incomes.value, ...expenses.value].map(entry => entry.accountId)];
  return ids.some(id => !!id && !accounts.value.some(account => account.id === id && account.currency === 'EUR'));
});
const hasUnassignedEntries = computed(() => [...incomes.value, ...expenses.value].some(entry => !(entry.accountId ?? defaultAccountId.value)));
const accountColumns = computed(() => {
  const ids = new Set([defaultAccountId.value, ...[...incomes.value, ...expenses.value].map(entry => entry.accountId ?? defaultAccountId.value)].filter((id): id is string => !!id));
  if (!ids.size) return [];
  if (hasUnassignedEntries.value) ids.add(UNASSIGNED_ACCOUNT);
  return [...ids].map(id => ({
    id,
    name: id === UNASSIGNED_ACCOUNT ? t('savingsPlan.noAccount') : accounts.value.find(account => account.id === id)?.name ?? t('savingsPlan.unavailableAccount'),
  }));
});
const isReady = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const loadError = ref(false);
const saveError = ref(false);
const saveSucceeded = ref(false);
const savedSnapshot = ref('');
const encodeEntries = (entries: SavingsPlanEntry[]): SavedPlanEntry[] => entries.map(entry => ({
  id: entry.id, name: entry.name, amountCents: amountToCents(entry.amount) ?? 0,
  startMonth: entry.startMonth ?? null, endMonth: entry.endMonth ?? null,
  accountId: entry.accountId ?? null,
}));
const payload = computed<SavingsPlanPayload>(() => ({
  startMonth: startMonth.value, endMonth: endMonth.value,
  defaultAccountId: defaultAccountId.value,
  incomes: encodeEntries(incomes.value), expenses: encodeEntries(expenses.value),
}));
const snapshot = computed(() => JSON.stringify(payload.value));
const isDirty = computed(() => isReady.value && snapshot.value !== savedSnapshot.value);
const loadPlan = async () => {
  if (isReady.value || isLoading.value) return;
  isLoading.value = true;
  loadError.value = false;
  try {
    const response = await SavingsPlanRepository.getPlan();
    const {plan} = response;
    accounts.value = response.accounts ?? [];
    if (plan) {
      startMonth.value = plan.startMonth;
      endMonth.value = plan.endMonth;
      defaultAccountId.value = plan.defaultAccountId ?? null;
      const decodeEntries = (entries: SavedPlanEntry[]): SavingsPlanEntry[] => entries.map(entry => ({
        id: entry.id, name: entry.name, amount: (entry.amountCents / 100).toFixed(2),
        startMonth: entry.startMonth, endMonth: entry.endMonth,
        accountId: entry.accountId ?? null,
      }));
      incomes.value = decodeEntries(plan.incomes);
      expenses.value = decodeEntries(plan.expenses);
      nextId = Math.max(-1, ...[...incomes.value, ...expenses.value].map(entry => entry.id)) + 1;
    }
    savedSnapshot.value = snapshot.value;
    isReady.value = true;
  } catch {
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
};
const savePlan = async () => {
  if (!isReady.value || isSaving.value || !isDirty.value || periodError.value || unavailableAccounts.value) return;
  isSaving.value = true;
  saveError.value = false;
  saveSucceeded.value = false;
  const submittedSnapshot = snapshot.value;
  try {
    await SavingsPlanRepository.savePlan(JSON.parse(submittedSnapshot) as SavingsPlanPayload);
    // Edits made while saving must remain dirty, not be overwritten by the response.
    savedSnapshot.value = submittedSnapshot;
    saveSucceeded.value = true;
  } catch {
    saveError.value = true;
  } finally {
    isSaving.value = false;
  }
};
const confirmUnload = (event: BeforeUnloadEvent) => {
  if (!isDirty.value) return;
  event.preventDefault();
  event.returnValue = '';
};
onMounted(() => {
  void loadPlan();
  window.addEventListener('beforeunload', confirmUnload);
});
onBeforeUnmount(() => window.removeEventListener('beforeunload', confirmUnload));
const removeEntry = (entries: SavingsPlanEntry[], id: number) => {
  const index = entries.findIndex(item => item.id === id);
  if (index !== -1) entries.splice(index, 1);
};
const addEntry = (entries: SavingsPlanEntry[], entry: SavingsPlanEntryValues) => entries.push({id: nextId++, ...entry});
const updateEntry = (entries: SavingsPlanEntry[], id: number, values: SavingsPlanEntryValues) => {
  const entry = entries.find(item => item.id === id);
  if (entry) Object.assign(entry, values);
};
const incomeCents = computed(() => getMonthlyTotalCents(incomes.value, startMonth.value));
const expenseCents = computed(() => getMonthlyTotalCents(expenses.value, startMonth.value));
const monthCount = computed(() => getPlanMonthCount(startMonth.value, endMonth.value));
const periodError = computed(() => {
  if (monthCount.value === 0) return t('savingsPlan.invalidPeriod');
  if (monthCount.value > MAX_PLAN_MONTHS) return t('savingsPlan.periodTooLong');
  return '';
});
const rows = computed(() => periodError.value ? [] : buildSavingsProjection(
  startMonth.value, endMonth.value, incomes.value, expenses.value, defaultAccountId.value,
));
const yearlyRows = computed(() => groupSavingsProjectionByYear(rows.value));
const expandedYears = ref(new Set<string>());
const toggleYear = (year: string) => {
  if (expandedYears.value.has(year)) expandedYears.value.delete(year);
  else expandedYears.value.add(year);
};
const remainingCents = computed(() => incomeCents.value - expenseCents.value);
const hasDeficit = computed(() => rows.value.some(row => row.remainingCents < 0));
const accumulatedCents = computed(() => rows.value.at(-1)?.accumulatedCents ?? 0);
const currencyFormatter = computed(() => new Intl.NumberFormat(locale.value === 'ua' ? 'uk' : locale.value, {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2,
}));
const monthFormatter = computed(() => new Intl.DateTimeFormat(locale.value === 'ua' ? 'uk' : locale.value, {
  month: 'long', year: 'numeric', timeZone: 'UTC',
}));
const money = (cents: number) => currencyFormatter.value.format(cents / 100);
const formatMonth = (month: string) => monthFormatter.value.format(new Date(`${month}-01T00:00:00Z`));
const columnMonthLabels = computed(() => {
  const months = new Map<string, string>();
  for (const row of rows.value) {
    const monthNumber = row.month.slice(5);
    if (!months.has(monthNumber)) months.set(monthNumber, formatMonth(row.month));
  }
  return [...months.values()];
});
const summaryMoney = (cents: number) => rows.value.length ? money(cents) : '—';
</script>

<template>
  <div class="savings-plan">
    <header class="savings-plan__intro">
      <h1>{{ $t('savingsPlan.title') }}</h1>
    </header>

    <p v-if="!isReady && !loadError" role="status">{{ $t('savingsPlan.loadingPlan') }}</p>
    <div v-if="loadError" class="savings-plan__load-error" role="alert">
      <p>{{ $t('savingsPlan.loadFailed') }}</p>
      <BaseButton variant="transparent" @click="loadPlan">{{ $t('savingsPlan.retryLoad') }}</BaseButton>
    </div>
    <template v-if="isReady">
    <div class="savings-plan__save-bar">
      <BaseButton class="savings-plan__save" :disabled="isSaving || !isDirty || !!periodError || unavailableAccounts" @click="savePlan">
        {{ $t(isSaving ? 'savingsPlan.savingPlan' : 'savingsPlan.savePlan') }}
      </BaseButton>
      <span class="savings-plan__save-status" role="status">
        {{ $t(isDirty ? 'savingsPlan.unsavedChanges' : saveSucceeded ? 'savingsPlan.planSaved' : 'savingsPlan.noChanges') }}
      </span>
      <p v-if="saveError" class="savings-plan__error" role="alert">{{ $t('savingsPlan.saveFailed') }}</p>
    </div>

    <p v-if="unavailableAccounts" class="savings-plan__error" role="alert">{{ $t('savingsPlan.accountWarning') }}</p>

    <div><BaseButton class="savings-plan__calculator" variant="transparent" @click="calculatorOpen = true">{{ $t('savingsCalculator.open') }}</BaseButton></div>
    <SavingsCalculatorModal v-if="calculatorOpen" @close="calculatorOpen = false"/>

    <div class="savings-plan__budget">
        <BudgetEntries
          id-prefix="plan-income" button-variant="green" :entries="incomes" :title="$t('savingsPlan.incomes')" :total="summaryMoney(incomeCents)" :first-month="startMonth" :last-month="endMonth"
          :accounts="accounts" :default-account-id="defaultAccountId"
          @add="addEntry(incomes, $event)" @remove="removeEntry(incomes, $event)" @update="(id, entry) => updateEntry(incomes, id, entry)"/>
        <BudgetEntries
          id-prefix="plan-expense" button-variant="red" :entries="expenses" :title="$t('savingsPlan.expenses')" :total="summaryMoney(expenseCents)" :first-month="startMonth" :last-month="endMonth"
          :accounts="accounts" :default-account-id="defaultAccountId"
          @add="addEntry(expenses, $event)" @remove="removeEntry(expenses, $event)" @update="(id, entry) => updateEntry(expenses, id, entry)"/>
    </div>

    <Card>
      <h2>{{ $t('savingsPlan.period') }}</h2>
      <div class="savings-plan__period">
        <BaseMonthPicker id="plan-start" v-model="startMonth" :label="$t('savingsPlan.startMonth')" :invalid="!!periodError" :described-by="periodError ? 'plan-period-help' : undefined"/>
        <BaseMonthPicker id="plan-end" v-model="endMonth" :label="$t('savingsPlan.endMonth')" :invalid="!!periodError" :described-by="periodError ? 'plan-period-help' : undefined"/>
      </div>
      <p v-if="periodError" id="plan-period-help" class="savings-plan__error">{{ periodError }}</p>
    </Card>

    <dl class="savings-plan__summary">
      <div>
        <dt>{{ $t('savingsPlan.monthlyRemaining') }}</dt>
        <dd :class="{'savings-plan__negative': remainingCents < 0}">{{ summaryMoney(remainingCents) }}</dd>
      </div>
      <div>
        <dt>{{ $t('savingsPlan.months') }}</dt>
        <dd>{{ rows.length || '—' }}</dd>
      </div>
      <div>
        <dt>{{ $t('savingsPlan.finalSavings') }}</dt>
        <dd :class="{'savings-plan__negative': accumulatedCents < 0}">{{ summaryMoney(accumulatedCents) }}</dd>
      </div>
    </dl>

    <Card>
      <h2>{{ $t('savingsPlan.forecast') }}</h2>
      <p class="savings-plan__table-note">{{ $t('savingsPlan.accountBalancesHint') }}</p>
      <p v-if="hasDeficit" class="savings-plan__error">{{ $t('savingsPlan.deficitWarning') }}</p>
      <p v-if="!rows.length" role="status">{{ $t('savingsPlan.fixErrors') }}</p>
      <div v-else class="savings-plan__table-scroll" tabindex="0" role="region" :aria-label="$t('savingsPlan.forecast')">
        <table>
          <caption class="sr-only">{{ $t('savingsPlan.forecast') }}</caption>
          <thead>
            <tr>
              <th scope="col">
                {{ $t('savingsPlan.periodColumn') }}
                <span class="savings-plan__column-sizer" aria-hidden="true">
                  <span v-for="label in columnMonthLabels" :key="label">{{ label }}</span>
                </span>
              </th>
              <th scope="col"><span class="savings-plan__column-title">{{ $t('savingsPlan.periodSavings') }}</span></th>
              <th v-for="account in accountColumns" :key="account.id" scope="col"><span class="savings-plan__column-title">{{ account.name }}</span></th>
              <th scope="col"><span class="savings-plan__column-title">{{ $t('savingsPlan.projectedBalance') }}</span></th>
            </tr>
          </thead>
          <tbody v-for="year in yearlyRows" :key="year.year">
            <tr class="savings-plan__year" @click="toggleYear(year.year)">
              <th scope="row">
                <button type="button" class="savings-plan__year-toggle" :aria-expanded="expandedYears.has(year.year)" @click.stop="toggleYear(year.year)">
                  <span class="material-symbols-outlined" aria-hidden="true">{{ expandedYears.has(year.year) ? 'expand_more' : 'chevron_right' }}</span>
                  {{ year.year }}
                  <span v-if="year.months.length < 12" class="savings-plan__month-count">· {{ $t('savingsPlan.monthsInYear', {count: year.months.length}) }}</span>
                </button>
              </th>
              <td :class="{'savings-plan__negative': year.remainingCents < 0}">{{ money(year.remainingCents) }}</td>
              <td v-for="account in accountColumns" :key="account.id" :class="{'savings-plan__negative': (year.accountBalances[account.id] ?? 0) < 0}">{{ money(year.accountBalances[account.id] ?? 0) }}</td>
              <td :class="{'savings-plan__negative': year.accumulatedCents < 0}">{{ money(year.accumulatedCents) }}</td>
            </tr>
            <template v-if="expandedYears.has(year.year)">
              <tr v-for="row in year.months" :key="row.month" class="savings-plan__month">
                <th scope="row">{{ formatMonth(row.month) }}</th>
                <td :class="{'savings-plan__negative': row.remainingCents < 0}">{{ money(row.remainingCents) }}</td>
                <td v-for="account in accountColumns" :key="account.id" :class="{'savings-plan__negative': (row.accountBalances[account.id] ?? 0) < 0}">{{ money(row.accountBalances[account.id] ?? 0) }}</td>
                <td :class="{'savings-plan__negative': row.accumulatedCents < 0}">{{ money(row.accumulatedCents) }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </Card>
    </template>
  </div>
</template>

<style scoped>
.savings-plan { display: grid; gap: 24px; width: 100%; max-width: 1200px; min-width: 0; margin: 0 auto; }
.savings-plan__intro h1 { margin-bottom: 12px; font-size: 30px; font-weight: 600; }
.savings-plan__save-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.savings-plan__save-status { font-size: 14px; }
.savings-plan__save-bar p { width: 100%; margin: 0; }
.savings-plan__load-error { color: #b91c1c; }
h2 { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
.savings-plan__budget { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.savings-plan__period { display: grid; grid-template-columns: repeat(2, minmax(0, 240px)); gap: 16px; margin-bottom: 12px; }
#plan-period-help { margin: 0; font-size: 14px; }
.savings-plan__summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 0; padding: 24px; border: 1px solid rgba(37, 99, 235, 0.15); border-radius: 18px; background: linear-gradient(120deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.02)); }
.savings-plan__summary dt { margin-bottom: 10px; font-size: 14px; }
.savings-plan__summary dd { margin: 0; font-size: clamp(20px, 2.3vw, 30px); font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.savings-plan__error, .savings-plan__negative { color: #b91c1c; }
.savings-plan__table-scroll { max-width: 100%; overflow-x: auto; }
.savings-plan__table-note { margin: 0 0 16px; font-size: 13px; }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
th, td { padding: 14px 12px; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--input-border-color); }
thead th { font-size: 14px; font-weight: 600; }
.savings-plan__column-title { display: inline-block; white-space: pre; line-height: 1.35; }
th:first-child { text-align: left; }
tbody th { font-weight: 400; }
td:last-child { font-weight: 600; }
tbody:last-child tr:last-child th, tbody:last-child tr:last-child td { border-bottom: 0; }
.savings-plan__year { cursor: pointer; background: rgba(37, 99, 235, 0.04); }
.savings-plan__year:hover { background: rgba(37, 99, 235, 0.08); }
.savings-plan__year th, .savings-plan__year td { font-weight: 600; }
.savings-plan__year-toggle { display: flex; align-items: center; gap: 8px; text-align: left; color: inherit; font-weight: inherit; border-radius: 4px; }
.savings-plan__year-toggle:focus-visible { outline: 2px solid #2563eb; outline-offset: 4px; }
.savings-plan__month-count { font-size: 13px; font-weight: 400; }
.savings-plan__month th { padding-left: 44px; }
/* Reserve the expanded month labels' intrinsic width, including their indentation. */
.savings-plan__column-sizer { display: grid; width: max-content; height: 0; padding-left: 32px; visibility: hidden; font-size: 1rem; font-weight: 400; }
.savings-plan__column-sizer > span { grid-area: 1 / 1; }
:global(.dark) .savings-plan__negative, :global(.dark) .savings-plan__error { color: #fca5a5; }
@media (max-width: 900px) {
  .savings-plan__budget { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 600px) {
  .savings-plan { gap: 18px; }
  .savings-plan__intro h1 { font-size: 26px; }
  .savings-plan__period { grid-template-columns: minmax(0, 1fr); }
  .savings-plan__summary { grid-template-columns: minmax(0, 1fr); padding: 20px; }
  .savings-plan__summary div { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .savings-plan__summary dt { margin: 0; }
  .savings-plan__summary dd { text-align: right; }
}
</style>
