<template>
  <div class="calificaciones-dashboard">
    <Sidebar />

    <main class="calificaciones-main">
      <header class="calificaciones-header">
        <h1>Registrar calificaciones</h1>
        <p class="calificaciones-subtitulo">Escoge tu materia para registrar tus notas.</p>
      </header>

      <div class="calificaciones-content">
        <div class="paso-card paso-materias" data-tour="calificaciones-materias">
          <h3>Selecciona la materia</h3>

          <div v-if="materiasStore.materias.length === 0" class="vacio">
            No tienes materias registradas todavía.
          </div>

          <div v-else class="opciones-materia">
            <button
              v-for="materia in materiasStore.materias"
              :key="materia.id"
              type="button"
              class="btn-opcion"
              :class="{ 'btn-opcion--activa': materiaSeleccionada === materia.id }"
              @click="seleccionarMateria(materia.id)"
            >
              <span class="opcion-icono">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z" />
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                </svg>
              </span>
              <span class="opcion-texto">{{ materia.nombre }}</span>
            </button>
          </div>
        </div>

        <div v-if="!materiaSeleccionada" class="paso-card paso-detalle paso-detalle--vacio">
          <p>Selecciona una materia para continuar.</p>
        </div>

        <!-- Paso: elegir el corte -->
        <div v-else-if="!corteSeleccionado" class="paso-card paso-detalle">
          <h3>Selecciona el corte</h3>

          <div class="opciones-corte">
            <button
              v-for="corte in cortes"
              :key="corte.id"
              type="button"
              class="btn-opcion btn-corte"
              @click="corteSeleccionado = corte.id"
            >
              <span class="opcion-texto">Corte {{ corte.numero }}</span>
              <span class="corte-peso">{{ corte.peso }}%</span>
            </button>
          </div>
        </div>

        <!-- Paso: registrar la nota -->
        <div v-else class="paso-card paso-detalle">
          <button type="button" class="btn-volver" @click="corteSeleccionado = null">
            ← Cambiar corte
          </button>

          <h3>Nueva nota — Corte {{ corteInfo.numero }} ({{ corteInfo.peso }}%)</h3>
          <p class="porcentaje-disponible">
            Porcentaje usado en este corte: <strong>{{ porcentajeUsado }}%</strong> / 100%
          </p>

          <form @submit.prevent="registrarNota">
            <div class="campo">
              <label for="nombreNota">Nombre de la nota</label>
              <input
                id="nombreNota"
                type="text"
                v-model="nombreNota"
                placeholder="Ej. Quiz de repaso"
                autocomplete="off"
              />
            </div>

            <div class="campo">
              <label for="tipoNota">Tipo de nota</label>
              <select id="tipoNota" v-model="tipoNota">
                <option disabled value="">Selecciona un tipo</option>
                <option>Examen</option>
                <option>Quiz</option>
                <option>Taller</option>
                <option>Parcial</option>
                <option>Otro</option>
              </select>
            </div>

            <div class="campo-fila">
              <div class="campo">
                <label for="porcentajeNota">Porcentaje del corte</label>
                <input
                  id="porcentajeNota"
                  type="number"
                  v-model.number="porcentajeNota"
                  placeholder="Ej. 30"
                  min="1"
                  max="100"
                  autocomplete="off"
                />
              </div>

              <div class="campo">
                <label for="valorNota">Valor (0-5)</label>
                <input
                  id="valorNota"
                  type="number"
                  v-model.number="valorNota"
                  placeholder="Ej. 4.5"
                  step="0.1"
                  min="0"
                  max="5"
                  autocomplete="off"
                />
              </div>
            </div>

            <button type="submit">Registrar nota</button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useMateriasStore } from "../stores/materias";
import Swal from "sweetalert2";
import Sidebar from "@/layout/Sidebar.vue";

const materiasStore = useMateriasStore();

const materiaSeleccionada = ref(null);
const corteSeleccionado = ref(null);

const seleccionarMateria = (materiaId) => {
  materiaSeleccionada.value = materiaId;
  corteSeleccionado.value = null;
};

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

  Swal.fire({
    title: "Registrando nota...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    await materiasStore.agregarNota(materiaSeleccionada.value, corteSeleccionado.value, {
      nombre: nombreNota.value,
      descripcion: tipoNota.value,
      porcentaje: porcentajeNota.value,
      valor: valorNota.value,
    });

    nombreNota.value = "";
    tipoNota.value = "";
    porcentajeNota.value = null;
    valorNota.value = null;

    Swal.hideLoading();
    Swal.fire({
      icon: "success",
      title: "Registro Exitoso",
      text: "Nota registrada correctamente.",
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
  } catch (error) {
    console.error("No se pudo registrar la nota:", error);
    Swal.hideLoading();
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo registrar la nota. Intenta de nuevo.",
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
  }
};
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

.calificaciones-dashboard {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-body, var(--color-text));
}

.calificaciones-main {
  margin-left: var(--sidebar-width, 236px);
  padding: 2rem clamp(1.5rem, 3vw, 3rem) 3rem;
}

/* ---------- Header ---------- */
.calificaciones-header {
  margin-bottom: 1.75rem;
}

.calificaciones-header h1 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.calificaciones-subtitulo {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

/* ---------- Layout ---------- */
.calificaciones-content {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(320px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

/* ---------- Tarjeta de paso ---------- */
.paso-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.75rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
  animation: fadeInUp 0.32s ease;
}

.paso-card h3 {
  margin: 0 0 1.25rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-heading);
}

/* ---------- Botón volver ---------- */
.btn-volver {
  display: inline-flex;
  margin-bottom: 1.1rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font: inherit;
  transition: color 0.2s ease;
}

.btn-volver:hover {
  color: var(--color-accent-strong);
}

/* ---------- Opciones (materia / corte) ---------- */
.opciones-materia,
.opciones-corte {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-opcion {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease,
    background 200ms ease;
}

.btn-opcion:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-hover);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.18);
}

.btn-opcion--activa {
  border-color: var(--color-accent-strong);
  background: var(--color-accent-soft);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.btn-opcion--activa .opcion-icono {
  background: var(--color-accent-strong);
  color: #fff;
}

.paso-detalle--vacio {
  display: grid;
  place-items: center;
  min-height: 220px;
  color: var(--color-text-muted);
  text-align: center;
}

.paso-detalle--vacio p {
  margin: 0;
}

.opcion-icono {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 10px;
  flex-shrink: 0;
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}

.opcion-icono svg {
  width: 1.15rem;
  height: 1.15rem;
}

.opcion-texto {
  text-transform: capitalize;
}

.btn-corte {
  justify-content: space-between;
}

.corte-peso {
  color: var(--color-link);
  font-weight: 800;
}

.vacio {
  text-align: center;
  color: var(--color-text-muted);
  padding: 1rem 0;
}

/* ---------- Formulario ---------- */
.porcentaje-disponible {
  margin: -0.4rem 0 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.porcentaje-disponible strong {
  color: var(--color-heading);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.campo label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.campo-fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

form input,
form select {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  font: inherit;
  appearance: none;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

form input::placeholder {
  color: var(--color-text-muted);
}

form select option {
  background: var(--color-surface);
  color: var(--color-text);
}

form input:focus,
form select:focus {
  outline: none;
  border-color: var(--color-accent-strong);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

form button {
  margin-top: 0.3rem;
  padding: 0.85rem;
  border: none;
  border-radius: 10px;
  background: var(--color-button);
  color: white;
  font-weight: 700;
  cursor: pointer;
  font: inherit;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

form button:hover {
  background: var(--color-button-hover);
}

form button:active {
  transform: scale(0.98);
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .calificaciones-main {
    margin-left: 0;
  }
}

@media (max-width: 900px) {
  .calificaciones-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .calificaciones-main {
    padding: 1.25rem;
  }

  .paso-card {
    padding: 1.25rem;
  }

  .campo-fila {
    grid-template-columns: 1fr;
  }
}
</style>
