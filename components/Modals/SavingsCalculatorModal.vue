<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import Modal from './Modal.vue';
import BaseButton from '~/components/Buttons/BaseButton.vue';
import {amountToCents} from '~/utils/savingsPlan';
import {calculateSavings, CALCULATOR_MAX_MONTHS} from '~/utils/savingsCalculator';

const emit = defineEmits<{close: []}>();
const {locale} = useI18n();
const initialAmount = ref('0');
const monthlyAmount = ref('0');
const months = ref<number | string>(60);
const initialInput = ref<HTMLInputElement | null>(null);
const calculationDate = new Date();
let previousFocus: HTMLElement | null = null;
const result = computed(() => calculateSavings(initialAmount.value, monthlyAmount.value, months.value, calculationDate));
const monthlySlider = computed(() => Math.max(0, Math.min(3000, Math.round((amountToCents(monthlyAmount.value) ?? 0) / 10000) * 100)));
const monthsSlider = computed(() => Math.max(1, Math.min(360, Number(months.value) || 1)));
const language = computed(() => locale.value === 'ua' ? 'uk' : locale.value);
const formatter = computed(() => new Intl.NumberFormat(language.value, {style: 'currency', currency: 'EUR'}));
const money = (cents: number) => formatter.value.format(cents / 100);
const targetMonth = computed(() => result.value ? new Intl.DateTimeFormat(language.value, {
  month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${result.value.targetMonth}-01T00:00:00Z`)) : '');
const invalidInitial = computed(() => !initialAmount.value.trim() || amountToCents(initialAmount.value) === null);
const invalidMonthly = computed(() => !monthlyAmount.value.trim() || amountToCents(monthlyAmount.value) === null);
const invalidMonths = computed(() => !/^\d+$/.test(String(months.value)) || Number(months.value) < 1 || Number(months.value) > CALCULATOR_MAX_MONTHS);
const updateMonthly = (event: Event) => { monthlyAmount.value = (event.target as HTMLInputElement).value; };
const updateMonths = (event: Event) => { months.value = Number((event.target as HTMLInputElement).value); };

onMounted(() => {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  initialInput.value?.focus();
});
onBeforeUnmount(() => {
  if (previousFocus?.isConnected) previousFocus.focus();
});
</script>

<template>
  <Modal :model-value="true" @update:model-value="emit('close')">
    <template #header>{{ $t('savingsCalculator.title') }}</template>
    <template #body>
      <div class="savings-calculator">
        <label for="calculator-initial">
          <span>{{ $t('savingsCalculator.initial') }} (€)</span>
          <input id="calculator-initial" ref="initialInput" v-model="initialAmount" type="text" inputmode="decimal" maxlength="20" :aria-invalid="invalidInitial" :aria-describedby="invalidInitial ? 'calculator-error' : undefined">
        </label>
        <div class="savings-calculator__control">
          <label for="calculator-monthly">
            <span>{{ $t('savingsCalculator.monthly') }} (€)</span>
            <input id="calculator-monthly" v-model="monthlyAmount" type="text" inputmode="decimal" maxlength="20" :aria-invalid="invalidMonthly" :aria-describedby="invalidMonthly ? 'calculator-error' : undefined">
          </label>
          <input id="calculator-monthly-slider" type="range" min="0" max="3000" step="100" :value="monthlySlider" :aria-label="$t('savingsCalculator.monthlySlider')" @input="updateMonthly">
        </div>
        <div class="savings-calculator__control">
          <label for="calculator-months">
            <span>{{ $t('savingsCalculator.months') }}</span>
            <input id="calculator-months" v-model="months" type="number" min="1" :max="CALCULATOR_MAX_MONTHS" step="1" :aria-invalid="invalidMonths" :aria-describedby="invalidMonths ? 'calculator-error' : undefined">
          </label>
          <input id="calculator-months-slider" type="range" min="1" max="360" step="1" :value="monthsSlider" :aria-label="$t('savingsCalculator.monthsSlider')" @input="updateMonths">
        </div>
        <p class="savings-calculator__hint">{{ $t('savingsCalculator.sliderHint') }}</p>
        <div v-if="result" class="savings-calculator__result" aria-live="polite">
          <span>{{ $t('savingsCalculator.total') }}</span>
          <strong class="savings-calculator__total">{{ money(result.totalCents) }}</strong>
          <dl>
            <div><dt>{{ $t('savingsCalculator.added') }}</dt><dd class="savings-calculator__added">{{ money(result.addedCents) }}</dd></div>
            <div><dt>{{ $t('savingsCalculator.target') }}</dt><dd class="savings-calculator__target">{{ targetMonth }}</dd></div>
          </dl>
        </div>
        <p v-else id="calculator-error" class="savings-calculator__error" role="alert">
          {{ $t(invalidInitial || invalidMonthly ? 'savingsPlan.invalidAmount' : 'savingsCalculator.invalidMonths') }}
        </p>
      </div>
    </template>
    <template #footer><BaseButton variant="transparent" @click="emit('close')">{{ $t('savingsPlan.close') }}</BaseButton></template>
  </Modal>
</template>

<style scoped>
.savings-calculator { display: grid; gap: 20px; min-width: 0; }
.savings-calculator label { display: grid; gap: 8px; min-width: 0; }
.savings-calculator input:not([type='range']) { width: 100%; min-width: 0; min-height: 44px; padding: 10px 12px; border: 1px solid var(--input-border-color); border-radius: 8px; background: transparent; color: inherit; }
.savings-calculator input:focus-visible { outline: 2px solid #2563eb; outline-offset: 3px; }
.savings-calculator input[aria-invalid='true'] { border-color: #b91c1c; }
.savings-calculator__control { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: end; gap: 16px; }
.savings-calculator input[type='range'] { width: 100%; min-width: 0; height: 44px; accent-color: #2563eb; }
.savings-calculator__hint { margin: 0; font-size: 12px; line-height: 1.5; opacity: 0.7; }
.savings-calculator__result { display: grid; gap: 10px; padding: 20px; border: 1px solid rgba(37, 99, 235, 0.15); border-radius: 14px; background: rgba(37, 99, 235, 0.06); }
.savings-calculator__total { font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.savings-calculator dl { display: grid; gap: 10px; margin: 4px 0 0; }
.savings-calculator dl > div { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; font-size: 14px; }
.savings-calculator dd { margin: 0; font-variant-numeric: tabular-nums; }
.savings-calculator__error { margin: 0; color: #b91c1c; }
:global(.dark) .savings-calculator__error { color: #fca5a5; }
@media (max-width: 480px) { .savings-calculator__control { grid-template-columns: minmax(0, 1fr); gap: 4px; } }
</style>
