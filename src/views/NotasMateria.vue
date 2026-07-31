<template>
  <div class="notas-wrapper">
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

.notas-wrapper {
  position: relative;
  min-height: 100vh;
  max-width: 100%;
  margin: 0;
  padding: 2rem 1rem 3rem;
  color: var(--color-text);
  background: var(--color-background);
  box-sizing: border-box;
}

.volver {
  position: relative;
  z-index: 1;
  display: inline-block;
  max-width: 700px;
  margin: 0 auto 1rem;
  color: var(--color-link);
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
  font-weight: 800;
  color: var(--color-text);
  animation: fadeInDown 0.7s ease both;
}

.promedio-general {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto 1.5rem;
  color: var(--color-text-muted);
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  padding: 1.1rem 1.3rem;
  animation: fadeInUp 0.5s ease both;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.corte-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(15, 27, 45, 0.1);
}

.corte-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.corte-info strong {
  color: var(--color-text);
}

.promedio-corte {
  background: var(--color-button);
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
  color: var(--color-text-muted);
}

.lista-notas li {
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--color-border);
}

.lista-notas li:last-child {
  border-bottom: none;
}

.sin-notas {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
}

.volver-resumen {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 1000;
}
</style>
