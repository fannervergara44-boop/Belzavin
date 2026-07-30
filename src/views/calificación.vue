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

.calificaciones-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f4f7fb;
  color: #0f1b2d;
}

.calificaciones-wrapper h1 {
  position: relative;
  z-index: 1;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 800;
  color: #0f1b2d;
  text-align: center;
  animation: fadeInDown 0.7s ease;
}

.paso-materias,
.paso-cortes,
.paso-nota {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border: 1px solid #e5eaf1;
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(15, 27, 45, 0.08);
  animation: fadeInUp 0.6s ease;
}

.paso-materias h3,
.paso-cortes h3,
.paso-nota h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
  color: #0f1b2d;
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
  border: 1px solid #dde4ee;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f1b2d;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-materia:hover,
.btn-corte:hover {
  border-color: #0b5fff;
  background: #eaf1ff;
  box-shadow: var(--shadow-card-sm, 0 8px 20px rgba(15, 27, 45, 0.06));
}

.btn-corte {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-corte span {
  color: #0b5fff;
  font-weight: bold;
}

.btn-volver {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  background: #0b5fff;
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s ease;
}

.btn-volver:hover {
  background: #0a52dd;
}

.vacio {
  text-align: center;
  color: #7a8aa0;
}

.porcentaje-disponible {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #5b6b7f;
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
  border: 1px solid #dde4ee;
  background: #f8fafc;
  color: #0f1b2d;
  text-align: center;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

form input::placeholder {
  color: #a3adba;
}

form select option {
  background: #ffffff;
  color: #0f1b2d;
}

form input:focus,
form select:focus {
  outline: none;
  border-color: #0b5fff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(11, 95, 255, 0.12);
}

form button {
  padding: 0.9rem;
  border: none;
  border-radius: 10px;
  background: #0b5fff;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

form button:hover {
  background: #0a52dd;
}

form button:active {
  transform: scale(0.98);
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
