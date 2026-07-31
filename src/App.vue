<template>
  <div class="app-shell">
    <RouterView />
  </div>
</template>

<script setup></script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
}
</style>
