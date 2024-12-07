<template>
  <div class="cards-page">
    <h1>Here are all your cards</h1>
    <Preloader
     height="50vh"
     v-if="uiStore.state.isLoading"/>
    <template v-else>
      <ul
       v-if="financeStore.cardsList && financeStore.cardsList.length > 0"
       class="cards-list">
        <li
         v-for="card in financeStore.cardsList"
         :key="card.name">
          <PaymentCard
           :data="card"
           @update-card="handleUpdateCardClicked(card._id)"
           @delete-card="handleDeleteCardClicked(card._id)"/>
        </li>
        <li>
          <button
           class="add-card-btn"
           @click="handleAddCardClicked">
            <span class="plus-icon">+</span>
            <span class="btn-text">Add a new card</span>
          </button>
        </li>
      </ul>

      <div
       v-else
       class="add-card-block">
        <h3>Oh, it seems like you haven’t added any cards yet!</h3>
        <p class="info">Feel free to explore the app without them, but
          adding cards will let you link transactions and get detailed stats for each one.</p>
        <button
         class="add-card-btn"
         @click="handleAddCardClicked">
          <span class="plus-icon">+</span>
          <span class="btn-text">Add a new card</span>
        </button>
      </div>
    </template>

    <template v-if="isDeleteConfirmationModalOpen">
      <DeleteConfirmationModal
       :isOpen="isDeleteConfirmationModalOpen"
       @delete="handleDeleteCard"
       @update:isOpen="isDeleteConfirmationModalOpen = $event"
      />
    </template>

    <template v-if="isCardModalOpen">
      <AddEditCardModal
       :isOpen="isCardModalOpen"
       :is-edit-mode="isEditMode"
       :card="currentEditingCard"
       @cardSaved="isEditMode ? handleUpdateCard($event) : handleAddCard($event)"
       @update:isOpen="isCardModalOpen = $event"
      />
    </template>

  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from "vue";
import {useFinanceStore} from "~/stores/finance";
import {useUIStore} from "~/stores/ui";
import AddEditCardModal from "~/components/Modals/AddEditCardModal.vue";
import DeleteConfirmationModal from "~/components/Modals/DeleteConfirmationModal.vue";
import {emitter} from "~/classes/uiEventBus";

const financeStore = useFinanceStore();
const uiStore = useUIStore();
const isDeleteConfirmationModalOpen = ref(false);
const isCardModalOpen = ref(false);
const isEditMode = ref(false);
const currentEditingCard = ref({});
const cardIdToDelete = ref('');

const handleAddCardClicked = () => {
  isEditMode.value = false;
  isCardModalOpen.value = true;
};

const handleAddCard = async (cardData: any) => {
  isCardModalOpen.value = false;
  await financeStore.addCard(cardData);
};

const handleUpdateCardClicked = async (cardId: string) => {
  isEditMode.value = true;
  isCardModalOpen.value = true;

  const currCard = financeStore.cardsList.find(card => card._id === cardId);
  currentEditingCard.value = {...currCard};
};

const handleUpdateCard = async (cardData: any) => {
  const cardId = currentEditingCard.value._id;
  isCardModalOpen.value = false;
  await financeStore.updateCard(cardId, cardData);
  isEditMode.value = false;
};

const handleDeleteCardClicked = async (cardId: string) => {
  cardIdToDelete.value = cardId;
  isDeleteConfirmationModalOpen.value = true;
};

const handleDeleteCard = async() => {
  const cardId = cardIdToDelete.value;
  isDeleteConfirmationModalOpen.value = false;
  await financeStore.deleteCard(cardId);
};

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  await financeStore.fetchCardsIfNeeded();
  emitter.emit('ui:stopLoading', 'default');
});
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>