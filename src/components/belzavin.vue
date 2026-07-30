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
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 35px;
}

.titulo-fila {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 3rem;
  width: 100%;
}

.titulo-logo {
  width: 1em;
  height: 1em;
  object-fit: contain;
  flex-shrink: 0;
}

.titulo-belzavi h1 {
  margin: 0;
  font-family: "Poppins", sans-serif;
  font-size: 1em;
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
  .titulo-fila {
    font-size: 2.2rem;
  }

  .titulo-belzavi p {
    font-size: 0.95rem;
  }
}
</style>
