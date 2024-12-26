<template>
  <div
   class="account-card"
   :class="props.class">
    <div class="account-details">
      <div class="details-row">
        <div class="row-name">{{ $t('components.accountsPage.accountName') }}:</div>
        <div class="row-value">{{ data.name }}</div>
      </div>

      <div class="details-row">
        <div class="row-name">{{ $t('components.accountsPage.accountName') }}:</div>
        <div class="row-value">{{ data.type }}</div>
      </div>

      <div class="details-row">
        <div class="row-name">{{ $t('components.accountsPage.balance') }}:</div>
        <div class="row-value">{{ formatCurrency(data.balance, data.currency) }}</div>
      </div>
    </div>

    <div
     @click="toggleActions"
     ref="actions"
     class="action-menu">
      <span class="material-symbols-outlined">more_vert</span>
      <div
       class="actions-list"
       v-if="isOpen">
        <button
         class="action-btn"
         @click="$emit('update-account')">{{ $t('components.accountsPage.editAccountTitle') }}
        </button>
        <button
         class="action-btn"
         @click="$emit('delete-account')">{{ $t('components.accountsPage.deleteAccountTitle') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from "vue";
import {useCurrencyFormatter} from "~/use/useCurrencyFormatter";

const props = defineProps({
  class: {
    type: String
  },
  data: {
    type: Object
  }
});

const emit = defineEmits(['update-account', 'delete-account']);

const {formatCurrency} = useCurrencyFormatter();
const isOpen = ref(false);
const actions = ref(null);

const toggleActions = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event: any) => {
  if (actions.value && !actions.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style
 lang="scss">
.account-card {
  height: auto;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  background-color: var(--card-bg-color);
  border-style: var(--border-style);
  border-width: var(--border-width);
  border-color: var(--border-color);
  position: relative;
  padding: 10px 40px 10px 20px;

  .details-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--input-border-color);
    padding: 10px 0;

    &:last-child {
      border-bottom: none;
    }

    .row-name {

    }

    .row-value {
      font-weight: 600;
      text-transform: capitalize;
    }
  }

  .action-menu {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;

    .actions-list {
      position: absolute;
      z-index: 10;
      right: 10px;
      bottom: 100%;
      background-color: var(--card-bg-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      box-shadow: var(--box-shadow);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 4px;

      .action-btn {
        padding: 6px 10px;
        font-size: 16px;
        width: 100%;
        border: none;
        outline: none;
        background-color: transparent;
        cursor: pointer;
        transition: all .3s;
        text-align: left;
        white-space: nowrap;
        color: var(--main-color);

        &:hover {
          background-color: var(--bg-color);
        }
      }
    }
  }
}
</style>