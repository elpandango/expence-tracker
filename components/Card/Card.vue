<script
 setup
 lang="ts">
const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '100%'
  },
  withScroll: {
    type: Boolean,
    default: false
  },
  withHeader: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div
   class="card w-full flex flex-wrap"
   :class="[
     props.class,
     withScroll ? 'overflow-auto' : ''
   ]"
   :style="{ maxWidth }">
    <div
     v-if="withHeader"
     class="card__header">
      <slot name="header"/>
    </div>
    <div class="card__content">
      <slot/>
    </div>
  </div>
</template>

<style scoped>
.card {
  --card-background: var(--color-white, #fff);

  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid rgba(1, 29, 58, 0.08);
  border-radius: 18px;
  background: transparent;
  box-shadow: 0 1px 2px 0 rgba(1, 29, 58, 0.08);
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: var(--card-background);
  opacity: 1;
  pointer-events: none;
  transition: opacity 120ms ease;
}

.card__header {
  width: 100%;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(1, 29, 58, 0.06);
  background: rgba(1, 29, 58, 0.025);
  font-weight: 600;
  font-size: 18px;
}

.card__content {
  width: 100%;
  padding: 0.75rem 1rem;
}

@media (min-width: 768px) {
  .card__content {
    padding: 1.25rem;
  }
}

:global(.dark) .card {
  border-color: rgb(82 82 91);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.18);
}

:global(.dark) .card::before {
  background: rgb(39 39 42);
}

:global(.dark) .card__header {
  border-bottom-color: rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
}
</style>
