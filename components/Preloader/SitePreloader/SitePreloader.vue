<template>
  <teleport to="body">
    <div class="preloader">
      <svg
       class="loader"
       xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 450 200"
      >
        <text
         ref="textName"
         x="10"
         y="80"
         font-family="Arial"
         font-size="80"
         fill="black"
         stroke="black"
         stroke-width="4"
         :stroke-dasharray="dashArray"
         :stroke-dashoffset="dashOffset"
         :style="{ fill: fillColorName }"
        >
          Olga
        </text>
        <text
         ref="textSurname"
         x="10"
         y="160"
         font-family="Arial"
         font-size="80"
         fill="black"
         stroke="black"
         stroke-width="4"
         :stroke-dasharray="dashArray"
         :stroke-dashoffset="dashOffset"
         :style="{ fill: fillColorSurname }"
        >
          Radchenko
        </text>
      </svg>
    </div>
  </teleport>
</template>

<script setup>
import {ref, onMounted} from 'vue';

const dashArray = ref(0);
const dashOffset = ref(0);
const fillColorName = ref('none');
const fillColorSurname = ref('none');

onMounted(() => {
  const loader = document.querySelector('.loader');
  const textNameElement = document.querySelector('text:nth-of-type(1)');
  const textSurnameElement = document.querySelector('text:nth-of-type(2)');
  const lengthName = textNameElement.getComputedTextLength();
  const lengthSurname = textSurnameElement.getComputedTextLength();

  const buffer = 10;
  dashArray.value = Math.max(lengthName, lengthSurname) + buffer;
  dashOffset.value = dashArray.value;
  loader.style.opacity = 1;

  setTimeout(() => {
    textNameElement.style.transition = 'stroke-dashoffset 0.8s linear';
    textSurnameElement.style.transition = 'stroke-dashoffset 0.8s linear';
    textNameElement.style.strokeDashoffset = '0';
    textSurnameElement.style.strokeDashoffset = '0';

    setTimeout(() => {
      textNameElement.style.transition = 'stroke-dashoffset 0.8s linear';
      textSurnameElement.style.transition = 'stroke-dashoffset 0.8s linear';
      textNameElement.style.strokeDashoffset = dashArray.value;
      textSurnameElement.style.strokeDashoffset = dashArray.value;

    }, 600);
  }, 10);

});
</script>

<style
 scoped
 src="./styles.scss"
 lang="scss">
</style>
