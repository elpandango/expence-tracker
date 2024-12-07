import Highcharts from 'highcharts';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.provide('highcharts', Highcharts);
});