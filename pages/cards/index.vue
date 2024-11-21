<template>
  <div class="cards-page">
    <h1>Here are all your cards</h1>

    <ul
     v-if="cardsList.length > 0"
     class="cards-list">
      <li
       v-for="card in cardsList"
       :key="card.name">
        <PaymentCard :data="card"/>
      </li>
      <li>
        <button
         class="add-card-btn"
         @click="isModalOpen=true">
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
       @click="isModalOpen=true">
        <span class="plus-icon">+</span>
        <span class="btn-text">Add a new card</span>
      </button>
    </div>

    <template v-if="isModalOpen">
      <AddCardModal
       :isOpen="isModalOpen"
       @cardAdded="handleAddCard"
       @update:isOpen="isModalOpen = $event"
      />
    </template>

  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from "vue";
import AddCardModal from "~/components/Modals/AddCardModal.vue";

const isModalOpen = ref(false);
const cardsList = ref([]);

const handleAddCard = async (cardData: any) => {
  console.log('cardData: ', cardData);

  cardsList.value.push(cardData);
  isModalOpen.value = false;
};
</script>

<style
 scoped
 lang="scss">
.cards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.add-card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--accent-color);
  border-radius: var(--border-radius);
  background-color: transparent;
  outline: none;
  width: 400px;
  height: 250px;
  font-size: 18px;
  color: var(--btn-transparent-color);
  cursor: pointer;

  .plus-icon {
    font-size: 24px;
  }

  .btn-text {
    margin-left: 10px;
  }
}
</style>