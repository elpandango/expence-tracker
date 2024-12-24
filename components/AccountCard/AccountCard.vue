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
 scoped
 lang="scss"
 src="./styles.scss">
</style>