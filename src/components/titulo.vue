<template>
  <div class="titulo-container">
    <h1>{{ titulo }}</h1>
    <p v-if="subtitulo">{{ subtitulo }}</p>
  </div>
</template>

<script setup>
defineProps({
  titulo: {
    type: String,
    required: true,
  },
  subtitulo: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.titulo-container {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;

  color: #0f1b2d;

  letter-spacing: 0.5px;
}

p {
  margin-top: 10px;

  font-size: 1rem;
  font-weight: 400;

  color: #7a8aa0;
}
</style>
