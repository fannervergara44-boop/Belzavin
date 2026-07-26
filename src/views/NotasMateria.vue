<template>
  <div class="notas-wrapper">
    <botonvolver ruta="/home" texto="Volver al inicio" class="volver-resumen" />

    <h1>{{ materia?.nombre }}</h1>
    <p class="promedio-general">Promedio de la materia: {{ promedioMateria.toFixed(1) }}</p>

    <div class="cortes-lista">
      <div v-for="corteId in ['corte1', 'corte2', 'corte3']" :key="corteId" class="corte-row">
        <div class="corte-info">
          <strong>Corte {{ corteId.slice(-1) }} ({{ pesos[corteId] }}%)</strong>
          <span class="promedio-corte">Promedio: {{ promedioCorte(corteId).toFixed(1) }}</span>
        </div>

        <ul class="lista-notas" v-if="notasDeCorte(corteId).length">
          <li v-for="nota in notasDeCorte(corteId)" :key="nota.id">
            {{ nota.nombre }} ({{ nota.tipo || "Nota" }}) — {{ nota.valor }} ·
            {{ nota.porcentaje }}%
          </li>
        </ul>
        <p v-else class="sin-notas">Sin notas registradas todavía.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useMateriasStore } from "../stores/materias";
import botonvolver from "@/components/botonvolver.vue";

const route = useRoute();
const materiasStore = useMateriasStore();
const materiaId = route.params.materiaId;

const pesos = { corte1: 33, corte2: 33, corte3: 34 };

const materia = computed(() => materiasStore.materias.find((m) => m.id === materiaId));

const notasDeCorte = (corteId) => materiasStore.notasPorMateria[materiaId]?.[corteId] || [];

function promedioCorte(corteId) {
  const notas = notasDeCorte(corteId);
  if (notas.length === 0) return 0;
  return notas.reduce((suma, n) => suma + n.valor * (n.porcentaje / 100), 0);
}

const promedioMateria = computed(() => {
  const pesosDecimal = { corte1: 0.33, corte2: 0.33, corte3: 0.34 };
  let total = 0;
  for (const corteId in pesosDecimal) {
    total += promedioCorte(corteId) * pesosDecimal[corteId];
  }
  return total;
});
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes orbFloatA {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -20px) scale(1.08);
  }
}

@keyframes orbFloatB {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-25px, 25px) scale(1.05);
  }
}

.notas-wrapper {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  max-width: 100%;
  margin: 0;
  padding: 2rem 1rem 3rem;
  color: #e6fff2;
  background: #05080a;
  box-sizing: border-box;
}

.notas-wrapper::before {
  content: "";
  position: absolute;
  top: -10%;
  left: -10%;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 125, 91, 0.4) 0%, rgba(46, 125, 91, 0) 70%);
  filter: blur(40px);
  animation: orbFloatA 12s ease-in-out infinite;
  pointer-events: none;
}

.notas-wrapper::after {
  content: "";
  position: absolute;
  bottom: -15%;
  right: -10%;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(11, 95, 255, 0.32) 0%, rgba(11, 95, 255, 0) 70%);
  filter: blur(50px);
  animation: orbFloatB 14s ease-in-out infinite;
  pointer-events: none;
}

.volver {
  position: relative;
  z-index: 1;
  display: inline-block;
  max-width: 700px;
  margin: 0 auto 1rem;
  color: #a8e6c9;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.volver:hover {
  opacity: 0.75;
}

.notas-wrapper h1 {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  font-size: 2rem;
  color: #d7f5e6;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
  animation: fadeInDown 0.7s ease both;
}

.promedio-general {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto 1.5rem;
  color: rgba(230, 255, 242, 0.75);
}

.cortes-lista {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.corte-row {
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.14), rgba(46, 125, 91, 0.08));
  border: 1px solid rgba(46, 125, 91, 0.18);
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.18);
  padding: 1.1rem 1.3rem;
  animation: fadeInUp 0.6s ease both;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.corte-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

.corte-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.corte-info strong {
  color: #f2fff8;
}

.promedio-corte {
  background: linear-gradient(135deg, #0b5fff 0%, #2e7d5b 100%);
  color: white;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.lista-notas {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  color: rgba(230, 255, 242, 0.8);
}

.lista-notas li {
  padding: 0.35rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.lista-notas li:last-child {
  border-bottom: none;
}

.sin-notas {
  font-size: 0.85rem;
  color: rgba(230, 255, 242, 0.35);
  margin: 0;
}

.volver-resumen {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 1000;
}
</style>
