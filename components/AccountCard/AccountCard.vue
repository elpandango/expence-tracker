<template>
  <div
   class="account-card"
   :class="props.class">
    <div class="account-details">
      <div class="details-row">
        <div class="row-name">Account name:</div>
        <div class="row-value">{{ data.name }}</div>
      </div>

      <div class="details-row">
        <div class="row-name">Account type:</div>
        <div class="row-value">{{ data.type }}</div>
      </div>

      <div class="details-row">
        <div class="row-name">Balance:</div>
        <div class="row-value">{{ data.balance }}{{ data.currency }}</div>
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
         @click="$emit('update-account')">Edit Account
        </button>
        <button
         class="action-btn"
         @click="$emit('delete-account')">Delete Account
        </button>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from "vue";

const props = defineProps({
  class: {
    type: String
  },
  data: {
    type: Object
  }
});

const emit = defineEmits(['update-account', 'delete-account']);

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