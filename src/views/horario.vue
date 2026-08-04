<template>
  <div class="horario-dashboard">
    <Sidebar />

    <main class="horario-main">
      <header class="horario-header">
        <h1>Mi horario</h1>
        <p class="horario-subtitulo">Así se ve tu semana de clases, de un vistazo.</p>
      </header>

      <div v-if="materiasStore.materias.length === 0" class="horario-vacio">
        <p>No tienes materias con horario todavía.</p>
      </div>

      <div v-else class="grilla-wrapper">
        <div class="grilla" :style="gridStyle">
          <div class="celda encabezado" :style="{ gridColumn: 1, gridRow: 1 }"></div>

          <div
            v-for="(dia, i) in dias"
            :key="dia"
            class="celda encabezado"
            :class="{ 'columna-hoy': dia === diaHoy }"
            :style="{ gridColumn: i + 2, gridRow: 1 }"
          >
            {{ dia }}
          </div>

          <template v-for="(hora, horaIndex) in horas" :key="hora">
            <div
              class="celda hora-label"
              :style="{
                gridColumn: 1,
                gridRow: `${filaDeHora(horaIndex)} / span ${bloquesPorHora}`,
              }"
            >
              {{ hora }}:00
            </div>

            <div
              v-for="(dia, i) in dias"
              :key="dia + hora"
              class="celda"
              :class="{ 'columna-hoy': dia === diaHoy }"
              :style="{
                gridColumn: i + 2,
                gridRow: `${filaDeHora(horaIndex)} / span ${bloquesPorHora}`,
              }"
            ></div>
          </template>

          <div
            v-for="materia in materiasConHorario"
            :key="materia.id"
            class="evento"
            :style="estiloEvento(materia)"
          >
            {{ materia.nombre }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useMateriasStore } from "../stores/materias";
import Sidebar from "@/layout/Sidebar.vue";

const materiasStore = useMateriasStore();

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const horaInicioGrilla = 6; // 6am
const horaFinGrilla = 22; // 10pm
const bloquesPorHora = 4; // cada bloque = 15 minutos
const altoBloque = 12.5; // px por bloque de 15 min (12.5 * 4 = 50px por hora, igual que antes)

const horas = Array.from(
  { length: horaFinGrilla - horaInicioGrilla },
  (_, i) => horaInicioGrilla + i,
);

// Día actual, para resaltar su columna en la grilla
const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const diaHoy = computed(() => diasSemana[new Date().getDay()]);

// Solo materias que sí tienen horario completo
const materiasConHorario = computed(() =>
  materiasStore.materias.filter(
    (m) => m.horario?.dia && m.horario?.horaInicio && m.horario?.horaFin,
  ),
);

// Convierte "08:30" a un número decimal: 8.5
function horaADecimal(horaTexto) {
  const [horas, minutos] = horaTexto.split(":").map(Number);
  return horas + minutos / 60;
}

const gridStyle = computed(() => ({
  gridTemplateColumns: `80px repeat(${dias.length}, 1fr)`,
  gridTemplateRows: `40px repeat(${horas.length * bloquesPorHora}, ${altoBloque}px)`,
}));

// Fila donde empieza cada hora (cada hora ocupa bloquesPorHora filas)
function filaDeHora(horaIndex) {
  return horaIndex * bloquesPorHora + 2; // +2 por la fila de encabezado
}

function estiloEvento(materia) {
  const diaIndex = dias.indexOf(materia.horario.dia);
  const inicio = horaADecimal(materia.horario.horaInicio);
  const fin = horaADecimal(materia.horario.horaFin);

  // Redondeamos al bloque de 15 min más cercano para garantizar filas enteras
  const filaInicio = Math.round((inicio - horaInicioGrilla) * bloquesPorHora) + 2;
  const filaFin = Math.round((fin - horaInicioGrilla) * bloquesPorHora) + 2;

  return {
    gridColumn: diaIndex + 2, // +2 por la columna de horas
    gridRow: `${filaInicio} / ${filaFin}`,
  };
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

.horario-dashboard {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-body, var(--color-text));
}

.horario-main {
  margin-left: var(--sidebar-width, 236px);
  padding: 2rem clamp(1.5rem, 3vw, 3rem) 3rem;
}

/* ---------- Header ---------- */
.horario-header {
  margin-bottom: 1.75rem;
}

.horario-header h1 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.horario-subtitulo {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

/* ---------- Estado vacío ---------- */
.horario-vacio {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.6rem 1.75rem;
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
  min-height: 98px;
}

.horario-vacio p {
  margin: 0;
}

/* ---------- Grilla ---------- */
.grilla-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
  padding: 1.25rem;
  overflow-x: auto;
  animation: fadeInUp 0.32s ease;
}

.grilla {
  display: grid;
  min-width: 720px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.celda {
  border: 1px solid var(--color-border);
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
}

.encabezado {
  background: var(--color-surface-soft);
  color: var(--color-heading);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.encabezado.columna-hoy {
  background: rgba(56, 189, 248, 0.16);
  color: var(--color-info, var(--color-accent-strong));
}

.hora-label {
  color: var(--color-text-muted);
  text-align: right;
  font-size: 0.78rem;
}

.celda.columna-hoy {
  background: rgba(56, 189, 248, 0.06);
}

.evento {
  background: var(--color-button);
  color: white;
  border-radius: 8px;
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 2px;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 6px 16px rgba(11, 95, 255, 0.25);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.evento:hover {
  transform: translateY(-1px) scale(1.02);
  background: var(--color-button-hover);
  box-shadow: 0 8px 20px rgba(11, 95, 255, 0.35);
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .horario-main {
    margin-left: 0;
  }
}

@media (max-width: 720px) {
  .horario-main {
    padding: 1.25rem;
  }

  .grilla-wrapper {
    padding: 0.85rem;
  }
}
</style>
