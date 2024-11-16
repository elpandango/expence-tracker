<template>
  <teleport to="body">
    <div class="preloader-wrap">
      <div class="preloader">
        <svg
         class="loader"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 256 256"
         width="256"
         height="256"
        >
          <path
           ref="svgPath"
           d="M112 24.4v8.4l-4.7.7c-2.7.4-8 1.7-12 3C67.7 45.2 52.1 67.3 56 92.2c3.1 20.4 17.5 33.3 45.3 40.4l10.7 2.7v59.8l-2.2-.7c-16.4-5.1-24.5-14.3-27.3-30.7l-.6-3.7H48v2.7c.1 5.8 3.1 17.1 6.4 23.8 8.7 17.5 26.7 30 49.4 34.3l8.2 1.6V240h32v-8.5c0-8 .1-8.5 2.3-8.9 16-3.2 22.9-5.3 30.8-9.3 19.8-9.9 30.7-26.2 30.8-46.3.2-13.7-4.8-24.9-15.4-34.8-8.2-7.7-16-11.4-32.1-15.2-7.1-1.7-13.7-3.3-14.6-3.6-1.7-.5-1.8-2.7-1.8-27 0-14.5.3-26.4.6-26.4s3.3 1.4 6.6 3.2c9 4.8 14 11.6 16.2 22l.6 2.8h34v-3.9c0-5.9-3.5-16-7.8-22.7-8.2-12.7-23.1-22.3-41.1-26.7l-9.1-2.2V16h-32v8.4zm0 57.6v23l-5.2-2.1c-5.8-2.2-11.1-6-14.2-10.2-1.5-2-2.1-4.7-2.4-9.7-.4-6.1-.1-7.5 2.2-11.4 1.4-2.5 4-5.5 5.7-6.7 2.8-1.9 11.2-5.7 13.2-5.9.4 0 .7 10.3.7 23zm43.1 64.5c12.9 4.3 18.1 10.9 18.3 22.5.1 12.2-6.5 20.4-19.8 25-10.5 3.5-9.6 5.8-9.6-24.6v-26.5l2.3.6c1.2.4 5.2 1.7 8.8 3z"
           fill="none"
           stroke="black"
           stroke-width="4"
           :stroke-dasharray="dashArray"
           :stroke-dashoffset="dashOffset"
          />
        </svg>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import {ref, onMounted} from 'vue';

const dashArray = ref(0);
const dashOffset = ref(0);

onMounted(() => {
  const loader = document.querySelector('.loader');
  const svgPath = document.querySelector('.preloader-wrap path');
  const length = svgPath.getTotalLength();

  dashArray.value = length;
  dashOffset.value = length;

  loader.style.opacity = 1;

  setTimeout(() => {
    svgPath.style.opacity = '1';

    svgPath.style.transition = 'stroke-dashoffset .8s ease';
    svgPath.style.strokeDashoffset = '0';

    setTimeout(() => {
      svgPath.style.transition = 'stroke-dashoffset .8s ease';
      svgPath.style.strokeDashoffset = length;
    }, 600);
  }, 50);
});
</script>

<style
 scoped
 lang="scss"
 src="./styles.scss">
</style>
