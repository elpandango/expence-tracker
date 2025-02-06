<template>
  <div
   class="accordion"
   :class="[{'active': isActive}, type]">
    <div class="accordion-inner-content">
      <div
       :style="{height: props.height}"
       class="header-block"
       :class="align"
       @click="accordionTrigger">
        <slot name="header">
          <div class="value">
            default value
          </div>
        </slot>
        <div
         v-if="!noCaret"
         class="icon-wrap">
          <svg
           class="dropdown-arrow"
           :class="{'is-active': isActive}"
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
       class="content-block">
        <div
         ref="contentBlock"
         class="content-items-list">
          <div class="content-item">
            <slot name="accordion-body">default body</slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {computed, onMounted, ref} from 'vue';

const props = defineProps({
  height: {
    type: String,
    default: '50px'
  },
  type: {
    type: String,
    default: ''
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
  }
});

const isActive = ref<boolean>(false);
const contentBlock = ref<HTMLElement | null>(null);

const computedHeight = computed(() => {
  return contentBlock.value ? contentBlock.value.offsetHeight : 0;
});

const accordionTrigger = (e: event) => {
  e.stopPropagation();
  isActive.value = !isActive.value;
};

onMounted(() => {
  if (props.isActiveOnInit) {
    isActive.value = true;
  }
});
</script>

<style
 lang="scss">
.accordion {
  width: 100%;
  overflow: hidden;
  transition: height .3s;
  border-style: var(--border-style);
  border-width: var(--border-width);
  border-color: var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);

  .accordion-inner-content {
    position: relative;
  }

  .header-block {
    padding: 0 16px;
    display: flex;
    height: 52px;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    &.left {
      justify-content: flex-start;
    }

    &.right {
      justify-content: flex-end;
    }

    &.center {
      justify-content: center;
    }
  }

  .link-text {
    font-size: 18px;
  }

  .icon-wrap {
    width: 18px;
    height: 18px;
    display: flex;
    cursor: pointer;
    position: relative;

    .dropdown-arrow {
      position: absolute;
      right: 8px;
      transition: transform 0.3s;

      top: 50%;
      transform: translateY(-50%) rotate(0deg);
    }
  }

  .content-block {
    overflow: hidden;
    max-height: 0;
    transition: all .3s;
    border: 0 solid var(--neutral-500);
    border-radius: 0 0 4px 4px;
  }

  .description {
    padding: 16px;
  }
}

.accordion.active {
  .accordion-inner-content {
    background-color: inherit;
    border-radius: 0 25px 25px 0;
  }

  .icon-wrap {

    .dropdown-arrow {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  .content-block {
    visibility: visible;
    position: relative;
    pointer-events: all;
  }
}

.accordion.basic {
  .header-block {
    background-color: var(--bg-color);
    padding: 0 20px;
    transition: background-color .3s;

    &:hover {
      background-color: var(--bg-color);
    }
  }

  .content-item {
    padding: 16px 20px;
  }
}

.accordion.basic.active {
  .content-block {
    border: 1px solid var(--border-color);
  }
}

</style>
