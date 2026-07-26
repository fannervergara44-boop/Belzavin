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
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.15), rgba(46, 125, 91, 0.15));
  border: 1px solid rgba(46, 125, 91, 0.25);
  color: #d7f5e6;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.volver:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.3), rgba(46, 125, 91, 0.3));
  border-color: rgba(74, 166, 116, 0.8);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.volver:active {
  transform: scale(0.97);
}

.volver:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(47, 125, 90, 0.25);
}
</style>
