import { computed, ref, watch } from "vue";
import { useFinanceStore } from "~/stores/financeStore";

export function useCardsList(additionalItems: { value: any; label: string }[] = []) {
  const financeStore = useFinanceStore();
  const cardsList = ref([]);

  const updateCardsList = () => {
    cardsList.value = [
      ...additionalItems,
      ...financeStore.cardsList.map(card => ({
        value: card._id,
        label: card.number,
      })),
    ];
  };

  watch(() => financeStore.cardsList, updateCardsList, { immediate: true });

  return {
    cardsList: computed(() => cardsList.value),
  };
}
