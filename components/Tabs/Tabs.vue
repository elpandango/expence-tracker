<template>
  <div class="w-full">
    <ul class="tabs-header flex m-0 p-0 list-none">
      <li
       v-for="tab in tabs"
       :key="tab.id"
       :data-tab-id="tab.id"
       :class="{ active: activeTab === tab.id }"
       class="py-2 px-5 cursor-pointer"
       @click="setActiveTab(tab.id)"
      >
        {{ tab.label }}
      </li>
    </ul>

    <div class="tabs-content">
      <div
       v-for="tab in tabs"
       :key="tab.id"
       :data-content-id="tab.id"
       :class="{ active: activeTab === tab.id }"
      >
        <slot :name="tab.slotName"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

const props = defineProps({
  tabs: {
    type: Array,
    default: () => ([])
  }
})

const activeTab = ref('login');

const setActiveTab = (tabId) => {
  activeTab.value = tabId;
};
</script>

<style>
.tabs-header li {
  border-bottom: 2px solid transparent;
}

.tabs-header li.active {
  border-bottom: 2px solid var(--accent-color);
  font-weight: bold;
}

.tabs-content > div {
  display: none;
}

.tabs-content > div.active {
  display: block;
}
</style>
