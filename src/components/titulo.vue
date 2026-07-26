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
  font-weight: 700;

  color: #d7f5e6;

  letter-spacing: 0.5px;

  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

p {
  margin-top: 10px;

  font-size: 1rem;
  font-weight: 400;

  color: rgba(230, 255, 242, 0.65);
}
</style>
