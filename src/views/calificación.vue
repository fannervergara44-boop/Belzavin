<template>
  <div class="calificaciones-wrapper">
    <titulo
      titulo="Registrar calificaciones"
      subtitulo="Escoge tu materia para registrar tu notas"
    />

    <botonvolver ruta="/home" texto="volver al inicio" class="volver-calificaciones" />
    <!-- Paso 0: elegir la materia -->
    <div v-if="!materiaSeleccionada" class="paso-materias">
      <h3>Selecciona la materia</h3>
      <div v-if="materiasStore.materias.length === 0" class="vacio">
        No tienes materias registradas todavía.
      </div>
      <div v-else class="opciones-materia">
        <button
          v-for="materia in materiasStore.materias"
          :key="materia.id"
          class="btn-materia"
          @click="materiaSeleccionada = materia.id"
        >
          {{ materia.nombre }}
        </button>
      </div>
    </div>

    <!-- Paso 1: elegir el corte -->
    <div v-else-if="!corteSeleccionado" class="paso-cortes">
      <button class="btn-volver" @click="materiaSeleccionada = null">← Cambiar materia</button>
      <h3>Selecciona el corte</h3>
      <div class="opciones-corte">
        <button
          v-for="corte in cortes"
          :key="corte.id"
          class="btn-corte"
          @click="corteSeleccionado = corte.id"
        >
          Corte {{ corte.numero }}
          <span>{{ corte.peso }}%</span>
        </button>
      </div>
    </div>

    <!-- Paso 2: registrar la nota -->
    <div v-else class="paso-nota">
      <button class="btn-volver" @click="corteSeleccionado = null">← Cambiar corte</button>

      <h3>Nueva nota — Corte {{ corteInfo.numero }} ({{ corteInfo.peso }}%)</h3>
      <p class="porcentaje-disponible">
        Porcentaje usado en este corte: {{ porcentajeUsado }}% / 100%
      </p>

      <form @submit.prevent="registrarNota">
        <input type="text" v-model="nombreNota" placeholder="Nombre de la nota" />

        <select v-model="tipoNota">
          <option disabled value="">Tipo de nota</option>
          <option>Examen</option>
          <option>Quiz</option>
          <option>Taller</option>
          <option>Parcial</option>
          <option>Otro</option>
        </select>

        <input
          type="number"
          v-model.number="porcentajeNota"
          placeholder="Porcentaje que ocupa en el corte"
          min="1"
          max="100"
        />

        <input
          type="number"
          v-model.number="valorNota"
          placeholder="Valor de la nota (0-5)"
          step="0.1"
          min="0"
          max="5"
        />

        <button type="submit">Registrar nota</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useMateriasStore } from "../stores/materias";
import Swal from "sweetalert2";
import botonvolver from "@/components/botonvolver.vue";
import Titulo from "@/components/titulo.vue";

const materiasStore = useMateriasStore();

const materiaSeleccionada = ref(null);
const corteSeleccionado = ref(null);

const cortes = [
  { id: "corte1", numero: 1, peso: 33 },
  { id: "corte2", numero: 2, peso: 33 },
  { id: "corte3", numero: 3, peso: 34 },
];

const corteInfo = computed(() => cortes.find((c) => c.id === corteSeleccionado.value));

const nombreNota = ref("");
const tipoNota = ref("");
const porcentajeNota = ref(null);
const valorNota = ref(null);

const porcentajeUsado = computed(() => {
  const notas =
    materiasStore.notasPorMateria[materiaSeleccionada.value]?.[corteSeleccionado.value] || [];
  return notas.reduce((suma, nota) => suma + nota.porcentaje, 0);
});

const registrarNota = async () => {
  if (!nombreNota.value.trim() || !tipoNota.value || !porcentajeNota.value || !valorNota.value) {
    Swal.fire({
      icon: "warning",
      title: "Campos Inncompletos",
      text: "Completa todos los campos.",
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
    return;
  }

  if (porcentajeUsado.value + porcentajeNota.value > 100) {
    const disponible = 100 - porcentajeUsado.value;
    Swal.fire({
      icon: "info",
      title: "Porcentaje",
      text: `Este corte ya tiene ${porcentajeUsado.value}% asignado. Solo quedan ${disponible}% disponibles.`,
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
    return;
  }

  await materiasStore.agregarNota(materiaSeleccionada.value, corteSeleccionado.value, {
    nombre: nombreNota.value,
    tipo: tipoNota.value,
    porcentaje: porcentajeNota.value,
    valor: valorNota.value,
  });

  nombreNota.value = "";
  tipoNota.value = "";
  porcentajeNota.value = null;
  valorNota.value = null;
  Swal.fire({
    icon: "success",
    title: "Registro Exitoso",
    text: "Nota registrada correctamente.",
    confirmButtonText: "Aceptar",
    showCloseButton: true,
  });
};
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

.calificaciones-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #05080a;
  color: #e6fff2;
}

.calificaciones-wrapper::before {
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
}

.calificaciones-wrapper::after {
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
}

.calificaciones-wrapper h1 {
  position: relative;
  z-index: 1;
  margin-bottom: 1rem;
  font-size: 2rem;
  color: #d7f5e6;
  text-align: center;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
  animation: fadeInDown 0.7s ease;
}

.paso-materias,
.paso-cortes,
.paso-nota {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
  background: linear-gradient(180deg, #0a1410 0%, #060b0f 100%);
  border: 1px solid rgba(46, 125, 91, 0.25);
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
  animation: fadeInUp 0.7s ease;
}

.paso-materias h3,
.paso-cortes h3,
.paso-nota h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #d7f5e6;
}

.opciones-materia,
.opciones-corte {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-materia,
.btn-corte {
  padding: 1rem;
  border: 1px solid rgba(46, 125, 91, 0.25);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.15), rgba(46, 125, 91, 0.1));
  color: #f2fff8;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-materia:hover,
.btn-corte:hover {
  transform: translateY(-2px);
  border-color: rgba(74, 166, 116, 0.8);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.btn-corte {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-corte span {
  color: #7dc9ff;
  font-weight: bold;
}

.btn-volver {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0b5fff, #2e7d5b);
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s;
}

.btn-volver:hover {
  transform: translateY(-2px);
}

.vacio {
  text-align: center;
  color: rgba(230, 255, 242, 0.75);
}

.porcentaje-disponible {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #9fd9b9;
  font-weight: 600;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

form input,
form select {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(47, 125, 90, 0.35);
  background: linear-gradient(135deg, rgba(14, 39, 48, 0.98), rgba(8, 26, 34, 0.98));
  color: #f2fff8;
  text-align: center;
  transition: all 0.25s ease;
}

form input::placeholder {
  color: rgba(230, 240, 255, 0.6);
}

form select option {
  background: #0b1418;
  color: #f2fff8;
}

form input:focus,
form select:focus {
  outline: none;
  border-color: rgba(74, 166, 116, 0.9);
  box-shadow: 0 0 0 3px rgba(47, 125, 90, 0.22);
  transform: translateY(-1px);
}

form button {
  position: relative;
  overflow: hidden;
  padding: 0.9rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0b5fff 0%, #2e7d5b 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
  box-shadow: 0 10px 24px rgba(11, 95, 255, 0.18);
}

form button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-120%);
  transition: transform 0.5s ease;
}

form button:hover::before {
  transform: translateX(120%);
}

form button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(46, 125, 91, 0.28);
}

form button:active {
  transform: scale(0.97);
}

@media (max-width: 768px) {
  .paso-materias,
  .paso-cortes,
  .paso-nota {
    padding: 1.5rem;
  }

  .calificaciones-wrapper h1 {
    font-size: 1.7rem;
  }
}

.volver-calificaciones {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 1000;
}
</style>
