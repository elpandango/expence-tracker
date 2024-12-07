import {computed, ref, watch} from "vue";
import {useFinanceStore} from "~/stores/finance";

export function useCardsList(additionalItems: { value: any; label: string }[] = []) {
  const financeStore = useFinanceStore();
  const cardsList = ref([]);
  const updateCardsList = () => {
    const cards = financeStore.cardsList || [];
    cardsList.value = [
      ...additionalItems,
      ...cards.map(card => ({
        value: card._id,
        label: card.number,
      })),
    ];
  };

  watch(() => financeStore.cardsList, updateCardsList, {immediate: true});

  return {
    cardsList: computed(() => cardsList.value),
  };
}
