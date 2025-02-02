<template>
  <div class="tabs">
    <ul class="tabs-header">
      <li
       v-for="tab in tabs"
       :key="tab.id"
       :data-tab-id="tab.id"
       :class="{ active: activeTab === tab.id }"
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
    type: Array
  }
})

const activeTab = ref('login');

const setActiveTab = (tabId) => {
  activeTab.value = tabId;
};
</script>

<style>
.tabs {
  width: 100%;
}
.tabs-header {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tabs-header li {
  padding: 10px 20px;
  cursor: pointer;
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
