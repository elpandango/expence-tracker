<template>
  <div :id="chartId"/>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import {useNuxtApp} from '#app';

const props = defineProps({
  options: {
    type: Object,
    required: true,
  }
});

const highcharts = useNuxtApp().$highcharts;
const chartId = ref('chart-' + Math.random().toString(36).substring(2, 9));
let chartInstance = null;

onMounted(() => {
  if (props.options) {
    chartInstance = highcharts.chart(chartId.value, props.options);
  }
});

watch(
 () => props.options,
 (newOptions) => {
   if (chartInstance) {
     chartInstance.destroy();
   }
   chartInstance = highcharts.chart(chartId.value, newOptions);
 },
 {deep: true}
);
</script>
