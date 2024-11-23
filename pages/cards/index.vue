<template>
  <div class="cards-page">
    <h1>Here are all your cards</h1>

    <ul
     v-if="cardsList.length > 0"
     class="cards-list">
      <li
       v-for="card in cardsList"
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

    <template v-if="isModalOpen">
      <AddEditCardModal
       :isOpen="isModalOpen"
       :is-edit-mode="isEditMode"
       :card="currentEditingCard"
       @cardSaved="isEditMode ? handleUpdateCard($event) : handleAddCard($event)"
       @update:isOpen="isModalOpen = $event"
      />
    </template>

  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from "vue";
import repositoryFactory from "~/repositories/repositoryFactory";
import AddEditCardModal from "~/components/Modals/AddEditCardModal.vue";

const isModalOpen = ref(false);
const isEditMode = ref(false);
const cardsList = ref([]);
const currentEditingCard = ref({});

const handleAddCardClicked = () => {
  isEditMode.value = false;
  isModalOpen.value = true;
};

const handleAddCard = async (cardData: any) => {
  const newCard = await repositoryFactory.get('Card').createCard({
    ...cardData
  });

  if (newCard?.status === 200) {
    cardsList.value.push(cardData);
  }

  isModalOpen.value = false;
  await fetchCards();
};

const handleUpdateCardClicked = async (cardId: string) => {
  isEditMode.value = true;
  isModalOpen.value = true;

  const currCard = cardsList.value.find(card => card._id === cardId);
  currentEditingCard.value = {...currCard};

  await fetchCards();
};

const handleUpdateCard = async (cardData: any) => {
  const cardId = currentEditingCard.value._id;
  await repositoryFactory.get('Card').updateCard(cardId, {
    ...cardData
  });

  isModalOpen.value = false;
  isEditMode.value = false;
};

const handleDeleteCardClicked = async (cardId) => {
  await repositoryFactory.get('Card').deleteCard(cardId);
  cardsList.value = cardsList.value.filter(card => card._id !== cardId);

  await fetchCards();
};

const fetchCards = async () => {
  const {cards} = await repositoryFactory.get('Card').getAllCards();
  cardsList.value = [...cards];
};

onMounted(async () => {
  await fetchCards();
});
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>