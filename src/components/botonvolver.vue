<template>
  <RouterLink :to="ruta" class="volver"> ← {{ texto }} </RouterLink>
</template>

<script setup>
defineProps({
  ruta: {
    type: String,
    default: "/home",
  },
  texto: {
    type: String,
    default: "Volver al inicio",
  },
});
</script>

<style scoped>
.volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.4rem;
  border-radius: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.volver:hover {
  transform: translateY(-2px);
  background: var(--color-accent-soft);
  border-color: var(--color-accent-strong);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.volver:active {
  transform: scale(0.97);
}

.volver:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
}
</style>
