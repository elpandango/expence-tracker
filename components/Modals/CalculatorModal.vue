<template>
  <Modal
   v-model="modalValue"
   @update:model-value="closeModal">
    <template #header>
      Calculator
    </template>
    <template #body>
      <div class="calculator">
        <div class="calculator-display">
          <input
           v-model="currentValue"
           type="text"
           readonly
           class="calculator-display-input"
          >
        </div>
        <div class="calculator-buttons">
          <div class="row">
            <button
             class="calc-btn"
             @click="handleInput('7')">7
            </button>
            <button
             class="calc-btn"
             @click="handleInput('8')">8
            </button>
            <button
             class="calc-btn"
             @click="handleInput('9')">9
            </button>
            <button
             class="calc-btn"
             @click="handleOperator('/')">÷
            </button>
          </div>
          <div class="row">
            <button
             class="calc-btn"
             @click="handleInput('4')">4
            </button>
            <button
             class="calc-btn"
             @click="handleInput('5')">5
            </button>
            <button
             class="calc-btn"
             @click="handleInput('6')">6
            </button>
            <button
             class="calc-btn"
             @click="handleOperator('*')">×
            </button>
          </div>
          <div class="row">
            <button
             class="calc-btn"
             @click="handleInput('1')">1
            </button>
            <button
             class="calc-btn"
             @click="handleInput('2')">2
            </button>
            <button
             class="calc-btn"
             @click="handleInput('3')">3
            </button>
            <button
             class="calc-btn"
             @click="handleOperator('-')">−
            </button>
          </div>
          <div class="row">
            <button
             class="calc-btn"
             @click="handleInput('0')">0
            </button>
            <button
             class="calc-btn"
             @click="handleInput('.')">.
            </button>
            <button
             class="calc-btn"
             @click="handlePercent">%
            </button>
            <button
             class="calc-btn"
             @click="handleOperator('+')">+
            </button>
          </div>
          <div class="row">
            <button
             class="calc-btn double-btn"
             @click="calculateResult">=
            </button>
            <button
             class="calc-btn"
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

<style
 lang="scss">
.form-row {
  margin-bottom: 22px;
}

.calculator {
  display: flex;
  flex-direction: column;
  align-items: center;


  .calculator-display {
    margin-bottom: 20px;
  }

  .calculator-display-input {
    width: 100%;
    padding: 10px;
    font-size: 24px;
    text-align: right;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .calculator-buttons {
    display: flex;
    flex-direction: column;

    .calc-btn {
      padding: 10px;
      font-size: 18px;
      border: none;
      background-color: #f0f0f0;
      border-radius: 4px;
      cursor: pointer;
      width: 60px;
      text-align: center;

      &:hover {
        background-color: #ddd;
      }
    }

    .calc-btn.double-btn {
      width: calc(120px + 5px);
    }

    .calc-btn.clear-button {
      width: 100%;
      background-color: #ff4d4f;
      color: white;
    }
  }

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 5px;
  }

}
</style>