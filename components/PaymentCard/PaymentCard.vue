<template>
  <div
   class="payment-card"
   :class="props.class">

    <div class="card-details">
      <div class="card-name">{{ data.name }}</div>

      <div class="bottom-part">
        <div class="card-balance">Balance: <strong>{{ data.balance }}{{ data.currency }}</strong></div>
        <div class="card-number">{{ formattedNumber }}</div>
      </div>
    </div>

    <div class="actions">
      <div class="btn-block">
        <BaseButton
         @click="$emit('update-card')"
         variant="green"
         size="big">Edit
        </BaseButton>
        <BaseButton
         @click="$emit('delete-card')"
         variant="red"
         size="big">Delete
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {useFormatCardNumber} from "~/use/useFormatCardNumber";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const props = defineProps({
  class: {
    type: String
  },
  data: {
    type: Object
  }
});

const emit = defineEmits(['update-card', 'delete-card']);

const {formattedNumber} = useFormatCardNumber(props.data.number);
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>