<template>
  <div class="horario-wrapper">
    <titulo titulo="Mi horario" />
    <botonvolver ruta="/home" texto="volver al incio" class="volver-horario" />

    <div v-if="materiasStore.materias.length === 0" class="vacio">
      No tienes materias con horario todavía.
    </div>

    <div v-else class="grilla" :style="gridStyle">
      <div class="celda encabezado" :style="{ gridColumn: 1, gridRow: 1 }"></div>

      <div
        v-for="(dia, i) in dias"
        :key="dia"
        class="celda encabezado"
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
</template>

<script setup>
import { computed } from "vue";
import { useMateriasStore } from "../stores/materias";
import botonvolver from "@/components/botonvolver.vue";
import titulo from "@/components/titulo.vue";
import Titulo from "@/components/titulo.vue";

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

.horario-wrapper {
  position: relative;
  min-height: 100vh;
  max-width: 100%;
  margin: 0;
  padding: 2rem 1rem 3rem;
  color: #0f1b2d;
  background: #f4f7fb;
  box-sizing: border-box;
}

.horario-wrapper h1 {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  font-weight: 800;
  color: #0f1b2d;
  animation: fadeInDown 0.7s ease both;
}

.vacio {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 2rem auto 0;
  text-align: center;
  color: #7a8aa0;
}

.grilla {
  position: relative;
  z-index: 1;
  display: grid;
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e5eaf1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(15, 27, 45, 0.08);
  animation: fadeInUp 0.6s ease both;
}

.celda {
  border: 1px solid #eef2f7;
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
}

.encabezado {
  background: #eaf1ff;
  color: #0f1b2d;
  font-weight: 700;
  text-align: center;
}

.hora-label {
  color: #a3adba;
  text-align: right;
}

.evento {
  background: #0b5fff;
  color: white;
  border-radius: 8px;
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 2px;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 6px 16px rgba(11, 95, 255, 0.2);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.evento:hover {
  transform: translateY(-1px) scale(1.02);
  background: #0a52dd;
  box-shadow: 0 8px 20px rgba(11, 95, 255, 0.3);
}

.volver-horario {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 1000;
}
</style>
