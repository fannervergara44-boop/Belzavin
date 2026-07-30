<template>
  <div class="layout-app">
    <Sidebar />
    <main class="layout-contenido">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from "./Sidebar.vue";
</script>

<style scoped>
.layout-app {
  min-height: 100vh;
  background: #f4f7fb;
}

.layout-contenido {
  margin-left: 150px;
  transition: margin-left 0.25s ease;
}

@media (max-width: 768px) {
  .layout-contenido {
    margin-left: 0;
  }
}
</style>
