<template>
  <div
   class="account-card h-auto shadow-xl py-2.5 pr-10 pl-5 relative bg-card-bg rounded-xl dark:border-[1px] border-stone-200 dark:border-neutral-600"
   :class="props.class">
    <div class="account-details">
      <div class="details-row flex items-center justify-between py-2.5 border-b-[1px] border-stone-200 dark:border-neutral-600">
        <div class="row-name">{{ $t('components.accountsPage.accountName') }}:</div>
        <div class="row-value font-semibold capitalize">{{ data.name }}</div>
      </div>

      <div class="details-row flex items-center justify-between py-2.5 border-b-[1px] border-stone-200 dark:border-neutral-600">
        <div class="row-name">{{ $t('components.accountsPage.accountName') }}:</div>
        <div class="row-value font-semibold capitalize">{{ data.type }}</div>
      </div>

      <div class="details-row flex items-center justify-between py-2.5">
        <div class="row-name">{{ $t('components.accountsPage.balance') }}:</div>
        <div class="row-value font-semibold capitalize">{{ formatCurrency(data.balance, data.currency) }}</div>
      </div>
    </div>

    <div
     ref="actions"
     class="action-menu absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
     @click="toggleActions">
      <span class="material-symbols-outlined">more_vert</span>
      <div
       v-if="isOpen"
       class="actions-list absolute z-10 right-[10px] bottom-full bg-card-bg shadow-xl rounded-md flex flex-col items-start p-1 dark:border-[1px] border-stone-200 dark:border-neutral-600">
        <button
         class="action-btn w-full text-md cursor-pointer py-1.5 px-2.5 transition-all duration-300 whitespace-nowrap text-left hover:bg-bg"
         @click="emit('update-account')">{{ $t('components.accountsPage.editAccountTitle') }}
        </button>
        <button
         class="action-btn w-full text-md cursor-pointer py-1.5 px-2.5 transition-all duration-300 whitespace-nowrap text-left hover:bg-bg"
         @click="emit('delete-account')">{{ $t('components.accountsPage.deleteAccountTitle') }}
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
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update-account', 'delete-account']);

const {formatCurrency} = useCurrencyFormatter();
const isOpen = ref(false);
const actions = ref(null);

const toggleActions = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event: event) => {
  if (actions.value && !actions.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style>
</style>