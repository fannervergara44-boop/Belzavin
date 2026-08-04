<template>
  <div class="notas-dashboard">
    <Sidebar />

    <main class="notas-main">
      <RouterLink :to="{ name: 'home' }" class="btn-volver">← Volver a inicio</RouterLink>

      <header class="notas-header">
        <h1>{{ materia?.nombre }}</h1>
        <p class="notas-subtitulo">
          Promedio de la materia: {{ promedioMateria.toFixed(1) }}
          <span class="separador">·</span>
          Créditos: {{ materia?.creditos ?? "—" }}
        </p>
      </header>

      <div class="cortes-lista">
        <div v-for="corteId in ['corte1', 'corte2', 'corte3']" :key="corteId" class="corte-card">
          <div class="corte-info">
            <strong>Corte {{ corteId.slice(-1) }} ({{ pesos[corteId] }}%)</strong>
            <span class="promedio-corte">Promedio: {{ promedioCorte(corteId).toFixed(1) }}</span>
          </div>

          <ul class="lista-notas" v-if="notasDeCorte(corteId).length">
            <li v-for="nota in notasDeCorte(corteId)" :key="nota.id">
              <span class="nota-nombre">{{ nota.nombre }}</span>
              <span class="nota-tipo">({{ nota.tipo || "Nota" }})</span>
              <span class="nota-datos">{{ nota.valor }} · {{ nota.porcentaje }}%</span>
            </li>
          </ul>
          <p v-else class="sin-notas">Sin notas registradas todavía.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useMateriasStore } from "../stores/materias";
import Sidebar from "@/layout/Sidebar.vue";

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
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notas-dashboard {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-body, var(--color-text));
}

.notas-main {
  margin-left: var(--sidebar-width, 236px);
  padding: 2rem clamp(1.5rem, 3vw, 3rem) 3rem;
  max-width: 760px;
}

/* ---------- Volver ---------- */
.btn-volver {
  display: inline-flex;
  margin-bottom: 1.1rem;
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.btn-volver:hover {
  color: var(--color-accent-strong);
}

/* ---------- Header ---------- */
.notas-header {
  margin-bottom: 1.75rem;
}

.notas-header h1 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-heading);
  letter-spacing: -0.01em;
  text-transform: capitalize;
}

.notas-subtitulo {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

.separador {
  margin: 0 0.4rem;
  color: var(--color-border-hover);
}

/* ---------- Cortes ---------- */
.cortes-lista {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.corte-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  padding: 1.1rem 1.3rem;
  animation: fadeInUp 0.32s ease;
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease;
}

.corte-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
  border-color: var(--color-border-hover);
}

.corte-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.corte-info strong {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-heading);
}

.promedio-corte {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.78rem;
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}

.lista-notas {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.lista-notas li {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.lista-notas li:last-child {
  border-bottom: none;
}

.nota-nombre {
  color: var(--color-heading);
  font-weight: 600;
  text-transform: capitalize;
}

.nota-tipo {
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.nota-datos {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.sin-notas {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .notas-main {
    margin-left: 0;
    max-width: none;
  }
}

@media (max-width: 720px) {
  .notas-main {
    padding: 1.25rem;
  }

  .corte-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .lista-notas li {
    flex-wrap: wrap;
  }

  .nota-datos {
    margin-left: 0;
  }
}
</style>
