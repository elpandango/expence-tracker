<script setup lang="ts" generic="TValue extends string | number">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

export type BaseTabItem<T extends string | number> = {
  value: T;
  label: string;
  disabled?: boolean;
};

const props = withDefaults(defineProps<{
  modelValue: TValue;
  items: readonly BaseTabItem<TValue>[];
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layoutVersion?: number;
}>(), {
  disabled: false,
  size: 'md',
  layoutVersion: 0,
});

const emit = defineEmits<{
  (e: 'update:modelValue' | 'change', value: TValue): void;
}>();

defineSlots<{
  tab?: (props: { item: BaseTabItem<TValue>; active: boolean }) => unknown;
}>();

const rootRef = ref<HTMLElement | null>(null);
const buttonRefs = ref<(HTMLButtonElement | null)[]>([]);
const indicatorStyle = ref({
  left: '0px',
  width: '0px',
  opacity: 0,
});
const isIndicatorReady = ref(false);
const bumpValue = ref<TValue | null>(null);

let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;
let bumpTimeoutId: number | null = null;

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'base-tabs--sm';
    case 'lg':
      return 'base-tabs--lg';
    default:
      return 'base-tabs--md';
  }
});

const setButtonRef = (index: number) => (element: Element | null) => {
  buttonRefs.value[index] = element instanceof HTMLButtonElement ? element : null;
};

const clearScheduledMeasure = () => {
  if (typeof window === 'undefined') return;

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const measureIndicator = () => {
  const rootElement = rootRef.value;
  const selectedIndex = props.items.findIndex(item => item.value === props.modelValue);
  const selectedButton = selectedIndex >= 0 ? buttonRefs.value[selectedIndex] : null;

  if (!rootElement || !selectedButton) {
    indicatorStyle.value = {
      left: '0px',
      width: '0px',
      opacity: 0,
    };
    isIndicatorReady.value = false;
    return;
  }

  const rootRect = rootElement.getBoundingClientRect();
  const buttonRect = selectedButton.getBoundingClientRect();

  indicatorStyle.value = {
    left: `${buttonRect.left - rootRect.left}px`,
    width: `${buttonRect.width}px`,
    opacity: 1,
  };
  isIndicatorReady.value = true;
};

const scheduleMeasure = () => {
  if (typeof window === 'undefined') return;

  clearScheduledMeasure();
  rafId = requestAnimationFrame(() => {
    rafId = null;
    measureIndicator();
  });
};

const triggerBump = (value: TValue) => {
  bumpValue.value = value;

  if (bumpTimeoutId !== null) {
    window.clearTimeout(bumpTimeoutId);
  }

  bumpTimeoutId = window.setTimeout(() => {
    if (bumpValue.value === value) {
      bumpValue.value = null;
    }
  }, 180);
};

const handleSelect = (item: BaseTabItem<TValue>) => {
  if (props.disabled || item.disabled) return;

  if (item.value === props.modelValue) {
    triggerBump(item.value);
    scheduleMeasure();
    return;
  }

  emit('update:modelValue', item.value);
  emit('change', item.value);
};

onMounted(() => {
  nextTick(() => {
    scheduleMeasure();

    if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
      resizeObserver = new ResizeObserver(() => {
        scheduleMeasure();
      });

      resizeObserver.observe(rootRef.value);
    }
  });
});

onBeforeUnmount(() => {
  clearScheduledMeasure();
  resizeObserver?.disconnect();

  if (bumpTimeoutId !== null) {
    window.clearTimeout(bumpTimeoutId);
  }
});

watch(() => [props.modelValue, props.layoutVersion, props.items.length], () => {
  nextTick(() => {
    scheduleMeasure();
  });
}, {flush: 'post', immediate: true});
</script>

<template>
  <div
    ref="rootRef"
    class="base-tabs"
    :class="[sizeClass, {'base-tabs--disabled': disabled}]"
    role="tablist"
    aria-orientation="horizontal"
  >
    <div
      class="base-tabs__indicator"
      :class="{
        'base-tabs__indicator--ready': isIndicatorReady,
        'base-tabs__indicator--bump': bumpValue === modelValue,
      }"
      :style="indicatorStyle"
      aria-hidden="true"
    />

    <button
      v-for="(item, index) in items"
      :key="item.value"
      :ref="setButtonRef(index)"
      type="button"
      class="base-tabs__tab"
      role="tab"
      :aria-selected="item.value === modelValue"
      :disabled="disabled || item.disabled"
      @click="handleSelect(item)"
    >
      <slot
        name="tab"
        :item="item"
        :active="item.value === modelValue"
      >
        {{ item.label }}
      </slot>
    </button>
  </div>
</template>

<style scoped>
.base-tabs {
  --tabs-border-color: rgba(14, 14, 14, 0.08);
  --tabs-background: rgba(14, 14, 14, 0.03);
  --tabs-indicator-border: rgba(14, 14, 14, 0.06);
  --tabs-indicator-background: var(--modal-body-color);
  --tabs-text-color: rgba(14, 14, 14, 0.68);
  --tabs-text-color-active: var(--main-color);
  --tabs-focus-color: rgba(93, 102, 254, 0.35);

  position: relative;
  display: flex;
  align-items: stretch;
  gap: 4px;
  width: 100%;
  padding: 4px;
  border: 1px solid var(--tabs-border-color);
  border-radius: 16px;
  background: var(--tabs-background);
}

[data-theme='dark'] .base-tabs {
  --tabs-border-color: rgba(226, 232, 240, 0.12);
  --tabs-background: rgba(255, 255, 255, 0.04);
  --tabs-indicator-border: rgba(226, 232, 240, 0.1);
  --tabs-indicator-background: rgba(30, 41, 59, 0.95);
  --tabs-text-color: rgba(224, 224, 224, 0.72);
  --tabs-focus-color: rgba(93, 102, 254, 0.45);
}

.base-tabs--disabled {
  opacity: 0.7;
  pointer-events: none;
}

.base-tabs__indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  z-index: 0;
  border: 1px solid var(--tabs-indicator-border);
  border-radius: 12px;
  background: var(--tabs-indicator-background);
  box-shadow: 0 1px 2px 0 rgba(1, 29, 58, 0.08);
  transition:
    left 240ms cubic-bezier(0.22, 1, 0.36, 1),
    width 240ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 120ms ease;
}

.base-tabs__indicator--ready {
  opacity: 1;
}

.base-tabs__indicator--bump {
  animation: base-tabs-bump 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.base-tabs__tab {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-width: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--tabs-text-color);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: color 160ms ease;
}

.base-tabs__tab:hover {
  color: var(--tabs-text-color-active);
}

.base-tabs__tab[aria-selected='true'] {
  color: var(--tabs-text-color-active);
}

.base-tabs__tab:focus {
  outline: none;
}

.base-tabs__tab:focus-visible {
  outline: 3px solid var(--tabs-focus-color);
  outline-offset: 1px;
}

.base-tabs--sm .base-tabs__tab {
  min-height: 36px;
  padding: 0 12px;
  font-size: 0.875rem;
}

.base-tabs--md .base-tabs__tab {
  min-height: 42px;
  padding: 0 16px;
  font-size: 0.9375rem;
}

.base-tabs--lg .base-tabs__tab {
  min-height: 48px;
  padding: 0 18px;
  font-size: 1rem;
}

@keyframes base-tabs-bump {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-tabs__indicator,
  .base-tabs__tab {
    transition: none;
  }

  .base-tabs__indicator--bump {
    animation: none;
  }
}
</style>
