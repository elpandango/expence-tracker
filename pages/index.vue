<template>
  <div class="index-page">
    <div class="card-details-block">
      <Card class="mar-b-6">
        <BalanceDetails/>
      </Card>
      <Card>
        <TransactionsHistory
         :expenses="expenses"
         :options="transactionsHistoryOptions">
          <template v-slot:header>
            <TitleWithDropdown
             placeholder="See All"
             :options="transactionsHistoryOptions">
              Transactions History
            </TitleWithDropdown>
          </template>
        </TransactionsHistory>
      </Card>
    </div>
    <div class="statistics-block">
      <Card>
        Transactions Statistics
      </Card>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import {onMounted, ref} from "vue";
import repositoryFactory from "~/repositories/repositoryFactory";
import Card from "~/components/Card/Card.vue";

// const route = useRoute();
// const currentUrl = computed(() => process.client ? `${window.location.origin}${route.fullPath}` : '');
const expenses = ref([]);

// useSeoMeta({
//   title: 'Главная - Ольга Радченко',
//   description: 'Ольга Радченко — психолог и консультант. Узнайте больше о её услугах и подходе к работе, чтобы найти поддержку в трудные моменты жизни.',
//   ogTitle: 'Главная - Ольга Радченко',
//   ogDescription: 'Ольга Радченко — профессиональный психолог, который помогает людям справиться с жизненными трудностями. Узнайте больше о её методах и услугах.',
//   ogImage: '/images/olga-photo-1.webp',
//   ogUrl: currentUrl,
//   twitterTitle: 'Главная - Ольга Радченко',
//   twitterDescription: 'Ольга Радченко — психолог, который помогает в решении жизненных трудностей. Откройте для себя её подход к психологической поддержке.',
//   twitterImage: '/images/olga-photo-1.webp',
//   twitterCard: 'summary'
// });

// definePageMeta({
//   layout: 'site-default-layout',
// });

useHead({
  htmlAttrs: {
    lang: 'en'
  },
});


const transactionsHistoryOptions = ref([]);
// const isLoaded = ref(false);


const fetchCards = async () => {
  const {cards} = await repositoryFactory.get('Card').getAllCards();
  const cardsArray = cards.map(card => {
    return {
      value: card._id,
      label: card.number,
    }
  });

  cardsArray.unshift({
    value: null,
    label: 'Cash'
  });

  return cardsArray;
};

const fetchExpenses = async () => {
  const response = await repositoryFactory.get('Expense').getExpenses();
  expenses.value = response?.expenses;
};

onMounted(async () => {
  transactionsHistoryOptions.value = await fetchCards();
  await fetchExpenses();
});

</script>

<style
 lang="scss"
 src="./styles.scss"></style>