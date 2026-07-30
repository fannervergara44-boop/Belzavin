<template>
  <div class="titulo-belzavi">
    <div class="titulo-fila">
      <img v-if="imagen" :src="imagen" alt="" class="titulo-logo" />
      <h1>{{ titulo }}</h1>
    </div>
    <p v-if="subtitulo">{{ subtitulo }}</p>
  </div>
</template>

<script setup>
defineProps({
  titulo: {
    type: String,
    default: "Belzavi",
  },
  subtitulo: {
    type: String,
    default: "",
  },
  imagen: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.titulo-belzavi {
  text-align: center;
  margin-bottom: 35px;
}

.titulo-fila {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.titulo-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.titulo-belzavi h1 {
  margin: 0;
  font-family: "Poppins", sans-serif;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #3f51b5;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
}

.titulo-belzavi h1::after {
  content: "";
  position: absolute;
  left: 15%;
  bottom: -10px;
  width: 70%;
  height: 4px;
  border-radius: 10px;
  background: linear-gradient(90deg, #3f51b5, #5c6bc0);
}

.titulo-belzavi p {
  margin-top: 18px;
  font-family: "Poppins", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: #666;
}

@media (max-width: 768px) {
  .titulo-logo {
    width: 36px;
    height: 36px;
  }

  .titulo-belzavi h1 {
    font-size: 2.2rem;
    letter-spacing: 2px;
  }

  .titulo-belzavi p {
    font-size: 0.95rem;
  }
}
</style>
