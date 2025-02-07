<template>
  <Modal
   v-model="modalValue"
   @update:model-value="closeModal">
    <template #header>
      Calculator
    </template>
    <template #body>
      <div class="flex flex-col items-center">
        <div class="mb-5">
          <input
           v-model="currentValue"
           type="text"
           readonly
           class="w-full p-2.5 text-2xl text-right rounded-md border-[1px] border-stone-300"
          >
        </div>
        <div class="flex flex-col">
          <div class="flex justify-between mb-2.5 gap-1">
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('7')">7
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('8')">8
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('9')">9
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleOperator('/')">÷
            </button>
          </div>
          <div class="flex justify-between mb-2.5 gap-1">
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('4')">4
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('5')">5
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('6')">6
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleOperator('*')">×
            </button>
          </div>
          <div class="flex justify-between mb-2.5 gap-1">
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('1')">1
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('2')">2
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('3')">3
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleOperator('-')">−
            </button>
          </div>
          <div class="flex justify-between mb-2.5 gap-1">
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('0')">0
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleInput('.')">.
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handlePercent">%
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="handleOperator('+')">+
            </button>
          </div>
          <div class="flex justify-between mb-2.5 gap-1">
            <button
             class="w-[126px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="calculateResult">=
            </button>
            <button
             class="w-[60px] p-2.5 text-lg border-none rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 text-center"
             @click="clear">C
            </button>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <BaseButton
       variant="transparent"
       size="big"
       @click="closeModal">{{ $t('components.buttons.cancelText') }}
      </BaseButton>
      <BaseButton
       variant="green"
       size="big"
       @click="handleSaveNewAmount">{{ $t('components.buttons.saveText') }}
      </BaseButton>
    </template>
  </Modal>
</template>

<script
 setup
 lang="ts">
import {ref} from 'vue';
import Modal from './Modal.vue';
import BaseButton from "~/components/Buttons/BaseButton.vue";
import {useUIStore} from "~/stores/ui";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
});

const uiStore = useUIStore();
const modalValue = ref(props.isOpen);
const currentValue = ref('');
const operator = ref('');
const previousValue = ref('');

const emit = defineEmits(['close']);

const closeModal = () => emit('close');

const handleInput = (value: string) => {
  if (operator.value && currentValue.value === previousValue.value) {
    currentValue.value = value;
  } else {
    currentValue.value += value;
  }
};

const handleOperator = (op: string) => {
  if (currentValue.value !== '') {
    if (operator.value && previousValue.value) {
      calculateResult();
    }

    previousValue.value = currentValue.value;
    operator.value = op;
  }
};

const calculateResult = () => {
  if (previousValue.value && operator.value && currentValue.value) {
    const num1 = parseFloat(previousValue.value);
    const num2 = parseFloat(currentValue.value);
    let result = 0;

    switch (operator.value) {
      case '+':
        result = num1 + num2;
        break;
      case '-':
        result = num1 - num2;
        break;
      case '*':
        result = num1 * num2;
        break;
      case '/':
        result = num2 !== 0 ? num1 / num2 : NaN;
        break;
      default:
        return;
    }

    previousValue.value = result.toString();
    currentValue.value = result.toString();
    operator.value = '';
  }
};

const clear = () => {
  currentValue.value = '';
  operator.value = '';
  previousValue.value = '';
};

const handlePercent = () => {
  if (currentValue.value) {
    const num = parseFloat(currentValue.value);

    if (operator.value && previousValue.value) {
      const base = parseFloat(previousValue.value);
      currentValue.value = ((base * num) / 100).toString();
    } else {
      currentValue.value = (num / 100).toString();
    }
  }
};

const handleSaveNewAmount = () => {
  uiStore.setCalculatorValue(currentValue.value);
  clear();
  closeModal();
};

onMounted(() => {
  currentValue.value = uiStore.calculatorValue || '';
});
</script>

<style>
</style>