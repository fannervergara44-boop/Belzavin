<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'auth-slide-left'" mode="out-in">
        <component :is="Component" :key="route.name" />
      </transition>
    </RouterView>
  </div>
</template>

<script setup></script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
  overflow: hidden;
  position: relative;
}

:deep(.auth-slide-left-enter-active),
:deep(.auth-slide-left-leave-active),
:deep(.auth-slide-right-enter-active),
:deep(.auth-slide-right-leave-active) {
  transition:
    opacity 0.45s ease,
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

:deep(.auth-slide-left-enter-from),
:deep(.auth-slide-right-leave-to) {
  opacity: 0;
  transform: translateX(36px);
}

:deep(.auth-slide-left-leave-to),
:deep(.auth-slide-right-enter-from) {
  opacity: 0;
  transform: translateX(-36px);
}
</style>
