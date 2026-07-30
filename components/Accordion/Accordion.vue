<script
 setup
 lang="ts">
import {computed, onMounted, ref} from 'vue';

const props = defineProps({
  height: {
    type: String,
    default: '50px'
  },
  isActiveOnInit: {
    type: Boolean,
    default: false
  },
  noCaret: {
    type: String,
    default: ''
  },
  align: {
    type: String,
    default: ''
  },
  headerClass: {
    type: String,
    default: 'px-5'
  },
  bodyClass: {
    type: String,
    default: 'py-4 px-5'
  },
  cardLike: {
    type: Boolean,
    default: false,
  }
});

const isActive = ref<boolean>(false);
const contentBlock = ref<HTMLElement | null>(null);

const computedHeight = computed(() => {
  return contentBlock.value ? contentBlock.value.offsetHeight : 0;
});

const accordionTrigger = (e: Event) => {
  e.stopPropagation();
  isActive.value = !isActive.value;
};

onMounted(() => {
  if (props.isActiveOnInit) {
    isActive.value = true;
  }
});
</script>

<template>
  <div
   class="accordion w-full transition-all duration-300 group"
   :class="[
     {'active': isActive},
     props.cardLike ? 'accordion--card-like' : 'accordion--default'
   ]">
    <div class="accordion-inner-content relative">
      <div
       :style="{height: props.height}"
       class="header-block flex items-center justify-between cursor-pointer h-[50px]"
       :class="[headerClass, align]"
       @click="accordionTrigger">
        <slot name="header">
          <div class="value">
            default value
          </div>
        </slot>
        <div
         v-if="!noCaret"
         class="icon-wrap flex relative w-[18px] h-[18px] cursor-pointer">
          <svg
           class="dropdown-arrow absolute top-1/2 transform -translate-y-1/2 right-2 transition-transform duration-300 group-[.active]:rotate-180"
           width="10"
           height="10"
           viewBox="0 0 10 10"
           fill="currentColor"
           xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 3L5 8L10 3H0Z"/>
          </svg>
        </div>
      </div>
      <div
       :style="{maxHeight: isActive ? computedHeight  + 'px' : '0px'}"
       class="content-block overflow-hidden max-h-0 transition-all duration-300">
       <div
          ref="contentBlock"
          class="content-items-list">
          <div
            class="content-item"
            :class="bodyClass">
            <slot name="accordion-body">default body</slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion--default {
  border: 1px solid rgb(231 229 228);
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  overflow: hidden;
}

:global(.dark) .accordion--default {
  border-color: rgb(82 82 91);
}

.accordion--default .header-block {
  background: var(--bg-color);
}

.accordion--default .content-block {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.accordion--card-like {
  position: relative;
  isolation: isolate;
  border: 1px solid rgba(1, 29, 58, 0.08);
  border-radius: 18px;
  background: transparent;
  box-shadow: 0 1px 2px 0 rgba(1, 29, 58, 0.08);
}

.accordion--card-like::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: var(--card-bg-color);
  opacity: 1;
  pointer-events: none;
}

.accordion--card-like .header-block {
  background: rgba(1, 29, 58, 0.025);
  border-bottom: 1px solid transparent;
}

.accordion--card-like.active .header-block {
  border-bottom-color: rgba(1, 29, 58, 0.06);
}

:global(.dark) .accordion--card-like {
  border-color: rgb(82 82 91);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.18);
}

:global(.dark) .accordion--card-like .header-block {
  background: rgba(255, 255, 255, 0.03);
}

:global(.dark) .accordion--card-like.active .header-block {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}
</style>
