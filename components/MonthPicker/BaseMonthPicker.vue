<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';

const props = withDefaults(defineProps<{
  id: string;
  label: string;
  modelValue: string;
  minMonth?: string;
  maxMonth?: string;
  invalid?: boolean;
  describedBy?: string;
}>(), {
  minMonth: '1900-01',
  maxMonth: '9999-12',
  invalid: false,
  describedBy: undefined,
});
const emit = defineEmits<{'update:modelValue': [value: string]}>();
const {locale} = useI18n();
const trigger = ref<HTMLButtonElement | null>(null);
const popup = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const visibleYear = ref(2000);
const position = ref({top: 0, left: 0, width: 280, maxHeight: 400});

const parseMonth = (value: string) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const [year, month] = value.split('-').map(Number);
  return year >= 1900 ? {year, month} : null;
};
const selected = computed(() => parseMonth(props.modelValue));
const min = computed(() => parseMonth(props.minMonth) ?? {year: 1900, month: 1});
const max = computed(() => parseMonth(props.maxMonth) ?? {year: 9999, month: 12});
const language = computed(() => locale.value === 'ua' ? 'uk' : locale.value);
const monthFormatter = computed(() => new Intl.DateTimeFormat(language.value, {month: 'short', timeZone: 'UTC'}));
const valueFormatter = computed(() => new Intl.DateTimeFormat(language.value, {month: 'long', year: 'numeric', timeZone: 'UTC'}));
const formatMonth = (month: number) => `${visibleYear.value}-${String(month).padStart(2, '0')}`;
const months = computed(() => Array.from({length: 12}, (_, index) => {
  const month = index + 1;
  const value = formatMonth(month);
  return {
    value,
    label: monthFormatter.value.format(new Date(Date.UTC(2000, index, 1))),
    selected: value === props.modelValue,
    disabled: value < props.minMonth || value > props.maxMonth,
  };
}));
const formattedValue = computed(() => selected.value
  ? valueFormatter.value.format(new Date(`${props.modelValue}-01T00:00:00Z`))
  : '');
const popupStyle = computed(() => ({
  top: `${position.value.top}px`, left: `${position.value.left}px`,
  width: `${position.value.width}px`, maxHeight: `${position.value.maxHeight}px`,
}));

const close = (restoreFocus = false) => {
  isOpen.value = false;
  if (restoreFocus) trigger.value?.focus();
};
const updatePosition = () => {
  if (!isOpen.value || !trigger.value || !popup.value) return;
  const rect = trigger.value.getBoundingClientRect();
  const padding = 12;
  const gap = 8;
  const width = Math.min(Math.max(rect.width, 280), window.innerWidth - padding * 2);
  const below = Math.max(0, window.innerHeight - rect.bottom - padding - gap);
  const above = Math.max(0, rect.top - padding - gap);
  const naturalHeight = popup.value.scrollHeight;
  const upward = naturalHeight > below && above > below;
  const maxHeight = Math.min(window.innerHeight - padding * 2, upward ? above : below);
  const height = Math.min(naturalHeight, maxHeight);
  position.value = {
    width, maxHeight,
    left: Math.max(padding, Math.min(rect.left, window.innerWidth - width - padding)),
    top: Math.max(padding, Math.min(upward ? rect.top - gap - height : rect.bottom + gap, window.innerHeight - height - padding)),
  };
};
const toggle = () => {
  if (isOpen.value) return close();
  const year = selected.value?.year ?? new Date().getFullYear();
  visibleYear.value = Math.max(min.value.year, Math.min(year, max.value.year));
  isOpen.value = true;
};
const selectMonth = (month: typeof months.value[number]) => {
  if (month.disabled) return;
  emit('update:modelValue', month.value);
  close(true);
};
const changeYear = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = Number(input.value);
  if (input.value && Number.isInteger(value)) {
    visibleYear.value = Math.max(min.value.year, Math.min(value, max.value.year));
  }
  input.value = String(visibleYear.value);
};
const handleOutside = (event: Event) => {
  const target = event.target as Node | null;
  if (isOpen.value && target && !trigger.value?.contains(target) && !popup.value?.contains(target)) close();
};
const handleEscape = (event: KeyboardEvent) => {
  if (isOpen.value && event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    close(true);
  }
};
const handleFocusOut = (event: FocusEvent) => {
  const nextTarget = event.relatedTarget as Node | null;
  if (nextTarget && !popup.value?.contains(nextTarget) && !trigger.value?.contains(nextTarget)) close();
};
const handleMonthKey = (event: KeyboardEvent, index: number) => {
  const offsets: Record<string, number> = {ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3};
  const offset = offsets[event.key];
  if (!offset) return;
  event.preventDefault();
  let next = index + offset;
  while (next >= 0 && next < 12) {
    if (!months.value[next].disabled) {
      popup.value?.querySelectorAll<HTMLButtonElement>('.month-picker__month')[next]?.focus();
      return;
    }
    next += offset;
  }
};

watch(isOpen, async (open, _, onCleanup) => {
  if (!open) return;
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
  onCleanup(() => {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
  });
  await nextTick();
  updatePosition();
  await nextTick();
  updatePosition();
  const selectedButton = popup.value?.querySelector<HTMLButtonElement>('.month-picker__month[aria-pressed="true"]:not(:disabled)');
  const firstButton = popup.value?.querySelector<HTMLButtonElement>('.month-picker__month:not(:disabled)');
  (selectedButton ?? firstButton)?.focus();
});
watch(() => props.modelValue, () => {
  if (isOpen.value && selected.value) visibleYear.value = selected.value.year;
});
onMounted(() => {
  document.addEventListener('pointerdown', handleOutside);
  document.addEventListener('keydown', handleEscape, true);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutside);
  document.removeEventListener('keydown', handleEscape, true);
});
</script>

<template>
  <div class="month-picker">
    <span :id="`${id}-label`">{{ label }}</span>
    <button
      :id="id" ref="trigger" type="button" class="month-picker__field"
      :class="{'is-open': isOpen}" aria-haspopup="dialog" :aria-expanded="isOpen"
      :aria-labelledby="`${id}-label ${id}-value`"
      :aria-controls="isOpen ? `${id}-popup` : undefined" :aria-invalid="invalid" :aria-describedby="describedBy"
      @click="toggle" @focusout="handleFocusOut">
      <span :id="`${id}-value`">{{ formattedValue || $t('monthPicker.placeholder') }}</span>
      <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
    </button>
    <Teleport to="body">
      <div
        v-if="isOpen" :id="`${id}-popup`" ref="popup" class="month-picker__popup"
        role="dialog" :aria-label="label" :style="popupStyle" @focusout="handleFocusOut">
        <div class="month-picker__header">
          <button type="button" class="month-picker__nav" :disabled="visibleYear <= min.year" :aria-label="$t('monthPicker.previousYear')" @click="visibleYear--">
            <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
          </button>
          <input
            type="number" class="month-picker__year" :value="visibleYear" :min="min.year" :max="max.year" step="1"
            :aria-label="$t('monthPicker.year')" @change="changeYear">
          <button type="button" class="month-picker__nav" :disabled="visibleYear >= max.year" :aria-label="$t('monthPicker.nextYear')" @click="visibleYear++">
            <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
          </button>
        </div>
        <div class="month-picker__grid">
          <button
            v-for="(month, index) in months" :key="index" type="button" class="month-picker__month"
            :disabled="month.disabled" :aria-pressed="month.selected" :class="{'is-selected': month.selected}"
            @click="selectMonth(month)" @keydown="handleMonthKey($event, index)">
            {{ month.label }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.month-picker { display: grid; gap: 8px; min-width: 0; width: 100%; }
.month-picker__field { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 46px; padding: 10px 12px; border: 1px solid var(--input-border-color); border-radius: 8px; background: transparent; color: inherit; text-align: left; }
.month-picker__field.is-open { border-color: #2563eb; }
.month-picker__field > span:first-child { min-width: 0; overflow-wrap: anywhere; }
.month-picker__field > .material-symbols-outlined { flex-shrink: 0; color: #78716c; }
.month-picker__field[aria-invalid='true'] { border-color: #b91c1c; }
.month-picker__popup { position: fixed; z-index: 90; overflow-y: auto; padding: 16px; border: 1px solid rgba(1, 29, 58, 0.08); border-radius: 16px; background: var(--card-bg-color, #fff); color: var(--main-color, #0e0e0e); box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12); }
.month-picker__header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.month-picker__nav { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 8px; }
.month-picker__year { width: 100px; min-width: 0; padding: 6px; border: 1px solid var(--input-border-color); border-radius: 8px; background: transparent; color: inherit; text-align: center; font-weight: 600; }
.month-picker__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.month-picker__month { min-height: 44px; padding: 8px 4px; border-radius: 8px; font-weight: 500; }
.month-picker__month:hover:not(:disabled):not(.is-selected), .month-picker__nav:hover:not(:disabled) { background: rgb(219 234 254); color: #1e40af; }
.month-picker__month.is-selected { background: #2563eb; color: #fff; }
button:disabled { opacity: 0.35; cursor: not-allowed; }
button:focus-visible, input:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
:global(.dark) .month-picker__popup { border-color: rgb(82 82 91); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28); }
</style>
