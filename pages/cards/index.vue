<template>
  <div class="cards-page">
    <h1>Here are all your cards</h1>

    <!--    <ul class="cards-list">-->
    <!--      <li>-->
    <!--        <Card>-->
    <!--          <PaymentCard/>-->
    <!--          <div class="actions">-->
    <!--            <button>Edit</button>-->
    <!--            <button>Delete</button>-->
    <!--          </div>-->
    <!--        </Card>-->
    <!--      </li>-->
    <!--      <li>-->
    <!--        <Card>-->
    <!--          <PaymentCard/>-->
    <!--          <div class="actions">-->
    <!--            <button>Edit</button>-->
    <!--            <button>Delete</button>-->
    <!--          </div>-->
    <!--        </Card>-->
    <!--      </li>-->
    <!--    </ul>-->

    <template v-if="isModalOpen">
      <AddCardModal
       :isOpen="isModalOpen"
       @confirm="handleDeleteConfirmed"
       @update:isOpen="isModalOpen = $event"
      />
    </template>

    <button @click="isModalOpen=true">Open Modal</button>
  </div>
</template>

<script
 setup
 lang="ts">
import {ref} from "vue";
import AddCardModal from "~/components/Modals/AddCardModal.vue";

const isModalOpen = ref(false);

const handlePostDelete = (id) => {
  isModalOpen.value = true;
  // postIdToDelete.value = id;
};

const handleDeleteConfirmed = async () => {
  // await postRepository.delete(postIdToDelete.value);
  // await fetchPosts();
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
</style>