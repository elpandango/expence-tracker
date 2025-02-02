<template>
  <div class="pagination-container">
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li>
          <BaseButton
           class="w-16 md:w-24"
           size="medium"
           :disabled="!props?.data?.hasPrevPage"
           @click="prevPage"
          >
            Prev
          </BaseButton>
        </li>

        <li v-if="pagesToShow[0] !== 1">
          <BaseButton
           size="medium"
           :aria-label="'Go to page 1'"
           :variant="props?.data?.currentPage === 1 ? 'default' : 'transparent'"
           @click="gotoPage(1)"
          >
            1
          </BaseButton>
        </li>
        <li
         v-if="pagesToShow[0] > 2"
         class="dots">...
        </li>

        <li
         v-for="page in pagesToShow"
         :key="page"
        >
          <BaseButton
           size="medium"
           :aria-label="`Go to page ${page}`"
           :variant="props?.data?.currentPage === page ? 'default' : 'transparent'"
           @click="gotoPage(page)"
          >
            {{ page }}
          </BaseButton>
        </li>

        <li
         v-if="pagesToShow[pagesToShow.length - 1] < props?.data?.lastPage - 1"
         class="inline-block px-2 text-gray-400">...
        </li>
        <li v-if="pagesToShow[pagesToShow.length - 1] !== props?.data?.lastPage">
          <BaseButton
           size="medium"
           :aria-label="`Go to page ${props?.data?.lastPage}`"
           :variant="props?.data?.currentPage === props?.data?.lastPage ? 'default' : 'transparent'"
           @click="gotoPage(props?.data?.lastPage)"
          >
            {{ props?.data?.lastPage }}
          </BaseButton>
        </li>

        <li>
          <BaseButton
           class="w-16 md:w-24"
           size="medium"
           :disabled="!props?.data?.hasNextPage"
           @click="nextPage"
          >
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

const pagesToShow = computed(() => {
  const {currentPage, lastPage} = props.data;
  const isMobile = window.innerWidth <= 768;
  const maxVisible = isMobile ? 1 : 5;
  const pages = [];

  const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(lastPage, start + maxVisible - 1);

  const adjustedStart = Math.max(1, end - maxVisible + 1);

  for (let i = adjustedStart; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
</script>

<style
 lang="scss">
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 2rem;

  .dots {
    display: inline-block;
    padding: 0 8px;
    color: #aaa;
  }

  .pagination {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .pagination li {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 5px;
  }
}
</style>
