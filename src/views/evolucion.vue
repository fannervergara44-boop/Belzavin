<template>
  <div class="evolucion-dashboard">
    <Sidebar />

    <main class="evolucion-main">
      <header class="evolucion-header">
        <h1>Evolución académica</h1>
        <p class="evolucion-subtitulo">Así ha cambiado tu promedio a lo largo del tiempo.</p>
      </header>

      <!-- Gráfica grande: promedio general -->
      <section class="grafica-general-card">
        <div class="grafica-general-encabezado">
          <div>
            <span class="grafica-general-label">Promedio general</span>
            <div class="grafica-general-valor-fila">
              <span class="grafica-general-valor">{{
                materiasStore.promedioGeneral !== null
                  ? materiasStore.promedioGeneral.toFixed(1)
                  : "—"
              }}</span>
              <span
                v-if="materiasStore.promedioGeneral !== null"
                class="grafica-badge"
                :class="`grafica-badge--${colorPromedio(materiasStore.promedioGeneral)}`"
              >
                {{ etiquetaPromedio(materiasStore.promedioGeneral) }}
              </span>
            </div>
          </div>
        </div>

        <svg
          v-if="puntosGeneral.length > 1"
          class="grafica-general-svg"
          viewBox="0 0 760 240"
          preserveAspectRatio="none"
        >
          <line
            v-for="y in [0, 1, 2, 3, 4, 5]"
            :key="y"
            :x1="0"
            :x2="760"
            :y1="yDesdeValor(y)"
            :y2="yDesdeValor(y)"
            class="grafica-grid-linea"
          />

          <defs>
            <linearGradient id="gradienteGeneral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--color-accent-strong)" stop-opacity="0.32" />
              <stop offset="100%" stop-color="var(--color-accent-strong)" stop-opacity="0" />
            </linearGradient>
          </defs>

          <path :d="areaGeneral" fill="url(#gradienteGeneral)" stroke="none" />
          <path
            :d="lineaGeneral"
            fill="none"
            stroke="var(--color-accent-strong)"
            stroke-width="2.5"
          />

          <circle
            v-for="(punto, i) in puntosGeneral"
            :key="i"
            :cx="xDesdeIndice(i, puntosGeneral.length)"
            :cy="yDesdeValor(punto.promedio)"
            r="4"
            class="grafica-punto"
          >
            <title>{{ tooltipGeneral(punto) }}</title>
          </circle>
        </svg>

        <div v-else class="grafica-vacio">
          <p>Aún no hay histórico suficiente para graficar tu evolución general.</p>
        </div>

        <div v-if="puntosGeneral.length > 1" class="grafica-eje-x">
          <span>{{ formatearFecha(puntosGeneral[0].fecha) }}</span>
          <span>{{ formatearFecha(puntosGeneral[puntosGeneral.length - 1].fecha) }}</span>
        </div>
      </section>

      <!-- Grid de evolución por materia -->
      <section class="materias-evolucion-section">
        <h2>Evolución por materia</h2>

        <div v-if="materiasStore.materias.length === 0" class="materias-evolucion-vacio">
          <p>Aún no tienes materias registradas.</p>
        </div>

        <div v-else class="materias-evolucion-grid">
          <div
            v-for="materia in materiasStore.materiasConPromedio"
            :key="materia.id"
            class="materia-evolucion-card"
          >
            <div class="materia-evolucion-encabezado">
              <strong>{{ materia.nombre }}</strong>
              <span
                v-if="materia.tieneNotas"
                class="grafica-badge"
                :class="`grafica-badge--${colorPromedio(materia.promedio)}`"
              >
                {{ materia.promedio.toFixed(1) }}
              </span>
            </div>

            <svg
              v-if="notasOrdenadasDeMateria(materia.id).length > 1"
              class="materia-evolucion-svg"
              viewBox="0 0 300 90"
              preserveAspectRatio="none"
            >
              <path
                :d="areaDe(materia.id)"
                :class="`area-materia--${colorPromedio(materia.promedio)}`"
                stroke="none"
              />
              <path
                :d="lineaDe(materia.id)"
                fill="none"
                stroke-width="2"
                :class="`linea-materia--${colorPromedio(materia.promedio)}`"
              />
              <circle
                v-for="(nota, i) in notasOrdenadasDeMateria(materia.id)"
                :key="nota.id"
                :cx="xDesdeIndice(i, notasOrdenadasDeMateria(materia.id).length, 300)"
                :cy="yDesdeValor(nota.valor, 0, 5, 90)"
                r="3"
                :class="`punto-materia--${colorPromedio(materia.promedio)}`"
              >
                <title>{{ tooltipNota(nota) }}</title>
              </circle>
            </svg>

            <p v-else-if="!materia.tieneNotas" class="materia-evolucion-mensaje">
              Aún no tienes notas registradas en esta materia.
            </p>

            <p
              v-else-if="notasOrdenadasDeMateria(materia.id).length === 1"
              class="materia-evolucion-mensaje"
            >
              Solo tienes una nota registrada — con la próxima ya vas a ver la evolución acá.
            </p>

            <div v-else class="materia-evolucion-espacio"></div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useMateriasStore } from "../stores/materias";
import Sidebar from "@/layout/Sidebar.vue";

const materiasStore = useMateriasStore();

// --- Color / etiqueta por promedio (mismos umbrales que el resto de la app) ---
function colorPromedio(promedio) {
  if (promedio >= 4.0) return "exito";
  if (promedio >= 3.5) return "info";
  if (promedio >= 3.0) return "advertencia";
  return "riesgo";
}

function etiquetaPromedio(promedio) {
  if (promedio >= 4.0) return "Excelente";
  if (promedio >= 3.5) return "Bien";
  if (promedio >= 3.0) return "Regular";
  return "En riesgo";
}

function formatearFecha(fecha) {
  if (!fecha?.seconds) return "";
  const d = new Date(fecha.seconds * 1000);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

function tooltipGeneral(punto) {
  const base = `${formatearFecha(punto.fecha)} — Promedio: ${punto.promedio.toFixed(1)}`;
  return punto.materiaNombre ? `${base} · Nota en ${punto.materiaNombre}` : base;
}

// --- Gráfica general ---
const puntosGeneral = computed(() => materiasStore.historialGeneral);

function xDesdeIndice(i, total, ancho = 760) {
  if (total <= 1) return 0;
  return (i / (total - 1)) * ancho;
}

function yDesdeValor(valor, min = 0, max = 5, alto = 240) {
  return alto - ((valor - min) / (max - min)) * alto;
}

function construirLinea(valores, ancho, alto) {
  if (!valores.length) return "";
  if (valores.length === 1) {
    const y = yDesdeValor(valores[0], 0, 5, alto);
    return `M0,${y.toFixed(1)} L${ancho},${y.toFixed(1)}`;
  }
  const paso = ancho / (valores.length - 1);
  return valores
    .map((v, i) => {
      const x = i * paso;
      const y = yDesdeValor(v, 0, 5, alto);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function construirArea(valores, ancho, alto) {
  const linea = construirLinea(valores, ancho, alto);
  if (!linea) return "";
  return `${linea} L${ancho},${alto} L0,${alto} Z`;
}

const lineaGeneral = computed(() =>
  construirLinea(
    puntosGeneral.value.map((p) => p.promedio),
    760,
    240,
  ),
);
const areaGeneral = computed(() =>
  construirArea(
    puntosGeneral.value.map((p) => p.promedio),
    760,
    240,
  ),
);

// --- Gráficas por materia: usan el valor real de cada nota individual,
// sin importar su porcentaje, ordenadas cronológicamente ---
function notasOrdenadasDeMateria(materiaId) {
  const cortes = materiasStore.notasPorMateria[materiaId] || {};
  const todas = ["corte1", "corte2", "corte3"].flatMap((corteId) => cortes[corteId] || []);
  return todas
    .filter((n) => n.createdAt?.seconds)
    .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
}

function tooltipNota(nota) {
  const fecha = formatearFecha(nota.createdAt);
  const tipo = nota.descripcion || "Nota";
  return `${nota.nombre} (${tipo}) — ${nota.valor} · ${nota.porcentaje}%${fecha ? " · " + fecha : ""}`;
}

function lineaDe(materiaId) {
  return construirLinea(
    notasOrdenadasDeMateria(materiaId).map((n) => n.valor),
    300,
    90,
  );
}

function areaDe(materiaId) {
  return construirArea(
    notasOrdenadasDeMateria(materiaId).map((n) => n.valor),
    300,
    90,
  );
}
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

.evolucion-dashboard {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-body, var(--color-text));
}

.evolucion-main {
  margin-left: var(--sidebar-width, 236px);
  padding: 2rem clamp(1.5rem, 3vw, 3rem) 3rem;
}

/* ---------- Header ---------- */
.evolucion-header {
  margin-bottom: 1.75rem;
}

.evolucion-header h1 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.evolucion-subtitulo {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

/* ---------- Gráfica general ---------- */
.grafica-general-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
  animation: fadeInUp 0.32s ease;
  margin-bottom: 2rem;
}

.grafica-general-encabezado {
  margin-bottom: 1rem;
}

.grafica-general-label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.grafica-general-valor-fila {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-top: 0.3rem;
}

.grafica-general-valor {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-accent-strong);
  line-height: 1;
}

.grafica-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}

.grafica-badge--exito {
  background: rgba(34, 197, 94, 0.18);
  color: var(--color-success);
}
.grafica-badge--info {
  background: rgba(56, 189, 248, 0.18);
  color: var(--color-info, var(--color-accent-strong));
}
.grafica-badge--advertencia {
  background: rgba(245, 158, 11, 0.18);
  color: var(--color-warning);
}
.grafica-badge--riesgo {
  background: rgba(239, 68, 68, 0.18);
  color: var(--color-danger);
}

.grafica-general-svg {
  width: 100%;
  height: 15rem;
}

.grafica-grid-linea {
  stroke: var(--color-border);
  stroke-width: 1;
}

.grafica-punto {
  fill: var(--color-accent-strong);
  stroke: var(--color-surface);
  stroke-width: 2;
  cursor: pointer;
  transition: r 0.15s ease;
}

.grafica-punto:hover {
  r: 6;
}

.grafica-vacio {
  display: grid;
  place-items: center;
  min-height: 15rem;
  color: var(--color-text-muted);
  text-align: center;
}

.grafica-vacio p {
  margin: 0;
  max-width: 320px;
}

.grafica-eje-x {
  display: flex;
  justify-content: space-between;
  margin-top: 0.6rem;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

/* ---------- Grid por materia ---------- */
.materias-evolucion-section h2 {
  margin: 0 0 1.1rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-heading);
}

.materias-evolucion-vacio {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.6rem 1.75rem;
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
  min-height: 98px;
}

.materias-evolucion-vacio p {
  margin: 0;
}

.materias-evolucion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.materia-evolucion-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
  animation: fadeInUp 0.32s ease;
}

.materia-evolucion-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.materia-evolucion-encabezado strong {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-heading);
  text-transform: capitalize;
}

.materia-evolucion-svg {
  width: 100%;
  height: 5.6rem;
}

.linea-materia--exito {
  stroke: var(--color-success);
}
.linea-materia--info {
  stroke: var(--color-info, var(--color-accent-strong));
}
.linea-materia--advertencia {
  stroke: var(--color-warning);
}
.linea-materia--riesgo {
  stroke: var(--color-danger);
}

.area-materia--exito {
  fill: rgba(34, 197, 94, 0.22);
}
.area-materia--info {
  fill: rgba(56, 189, 248, 0.22);
}
.area-materia--advertencia {
  fill: rgba(245, 158, 11, 0.22);
}
.area-materia--riesgo {
  fill: rgba(239, 68, 68, 0.22);
}

.punto-materia--exito {
  fill: var(--color-success);
}
.punto-materia--info {
  fill: var(--color-info, var(--color-accent-strong));
}
.punto-materia--advertencia {
  fill: var(--color-warning);
}
.punto-materia--riesgo {
  fill: var(--color-danger);
}

.materia-evolucion-svg circle {
  stroke: var(--color-surface);
  stroke-width: 1.5;
  cursor: pointer;
  transition: r 0.15s ease;
}

.materia-evolucion-svg circle:hover {
  r: 5;
}

.materia-evolucion-mensaje {
  margin: 0;
  min-height: 5.6rem;
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.materia-evolucion-espacio {
  height: 5.6rem;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .evolucion-main {
    margin-left: 0;
  }
}

@media (max-width: 720px) {
  .evolucion-main {
    padding: 1.25rem;
  }

  .grafica-general-card {
    padding: 1.1rem;
  }
}
</style>
