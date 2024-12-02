<template>
  <div class="pagination-container">
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li>
          <BaseButton
           class="prev-next-btn"
           size="medium"
           :disabled="!props?.data?.hasPrevPage"
           @click="prevPage">
            Previous
          </BaseButton>
        </li>

        <li
         v-for="page in props.data.lastPage"
         :key="page">
          <BaseButton
           @click="gotoPage(page)"
           size="medium"
           :aria-label="`Go to page ${page}`"
           :variant="props?.data?.currentPage === page ? 'default' : 'transparent'">
            {{ page }}
          </BaseButton>
        </li>

        <li>
          <BaseButton
           class="prev-next-btn"
           size="medium"
           :disabled="!props?.data?.hasNextPage"
           @click="nextPage">
            Next
          </BaseButton>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script
 setup
 lang="ts">
import BaseButton from "~/components/Buttons/BaseButton.vue";

const emits = defineEmits(['page-changed']);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      lastPage: 1,
      nextPage: 1,
      previousPage: 0,
      totalItems: 0,
      posts: []
    })
  }
});

const prevPage = () => {
  emits('page-changed', props.data.previousPage);
};

const nextPage = () => {
  emits('page-changed', props.data.nextPage);
};

const gotoPage = (page: number) => {
  emits('page-changed', page);
};
</script>

<style
 lang="scss"
 src="./styles.scss">
</style>
