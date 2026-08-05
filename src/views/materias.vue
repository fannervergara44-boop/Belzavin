<template>
  <div class="materias-dashboard">
    <Sidebar />

    <main class="materias-main">
      <header class="materias-header">
        <h1>Registro de materias</h1>
        <p class="materias-subtitulo">Agrega tus materias y llévalas todas en un solo lugar.</p>
      </header>

      <div class="materias-content">
        <form class="form-materia" @submit.prevent="agregarMateria">
          <div class="campo">
            <label for="nombre">Nombre de la materia</label>
            <input
              id="nombre"
              type="text"
              v-model="nombre"
              placeholder="Ej. Lógica y programación"
              autocomplete="off"
            />
          </div>

          <div class="campo">
            <label for="docente">Nombre del docente</label>
            <input
              id="docente"
              type="text"
              v-model="docente"
              placeholder="Ej. Belze"
              autocomplete="off"
            />
          </div>

          <div class="campo-fila">
            <div class="campo">
              <label for="meta">Meta</label>
              <input
                id="meta"
                type="number"
                v-model.number="meta"
                placeholder="Ej. 3.5"
                step="0.1"
                min="0"
                max="5"
                autocomplete="off"
              />
            </div>

            <div class="campo">
              <label for="creditos">Créditos</label>
              <input
                id="creditos"
                type="number"
                v-model.number="creditos"
                placeholder="Ej. 3"
                min="1"
                max="10"
                autocomplete="off"
              />
            </div>
          </div>

          <div class="campo">
            <label for="dia">Día de la semana</label>
            <select id="dia" v-model="dia">
              <option disabled value="">Selecciona un día</option>
              <option>Lunes</option>
              <option>Martes</option>
              <option>Miércoles</option>
              <option>Jueves</option>
              <option>Viernes</option>
              <option>Sábado</option>
            </select>
          </div>

          <div class="campo">
            <label>Horario</label>
            <div class="horas">
              <input type="time" v-model="horaInicio" />
              <span>a</span>
              <input type="time" v-model="horaFin" />
            </div>
          </div>

          <button type="submit">Agregar materia</button>
        </form>

        <div class="lista-materias-wrapper">
          <h2>Materias registradas</h2>

          <div v-if="materiasStore.materias.length" class="lista-materias">
            <div v-for="materia in materiasStore.materias" :key="materia.id" class="materia-fila">
              <span class="materia-icono">
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

              <div class="materia-datos">
                <strong>{{ materia.nombre }}</strong>
                <p class="docente">{{ materia.docente }}</p>
                <small>
                  {{ materia.horario?.dia }} {{ materia.horario?.horaInicio }} -
                  {{ materia.horario?.horaFin }}
                </small>
              </div>

              <button class="btn-eliminar" type="button" @click="eliminarMateria(materia)">
                Eliminar
              </button>
            </div>
          </div>

          <p v-else class="lista-vacia">Aún no tienes materias registradas.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMateriasStore } from "../stores/materias";
import Swal from "sweetalert2";
import Sidebar from "@/layout/Sidebar.vue";

const materiasStore = useMateriasStore();

const nombre = ref("");
const docente = ref("");
const meta = ref(null);
const creditos = ref(null);
const dia = ref("");
const horaInicio = ref("");
const horaFin = ref("");

const agregarMateria = async () => {
  if (
    !nombre.value.trim() ||
    !docente.value.trim() ||
    !meta.value ||
    !creditos.value ||
    !dia.value ||
    !horaInicio.value ||
    !horaFin.value
  ) {
    Swal.fire({
      icon: "warning",
      title: "Datos inconpletos",
      text: "Completa todos los campos.",
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
    return;
  }

  Swal.fire({
    title: "Agregando materia...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    await materiasStore.crearMateria({
      nombre: nombre.value,
      docente: docente.value,
      meta: meta.value,
      creditos: creditos.value,
      horario: {
        dia: dia.value,
        horaInicio: horaInicio.value,
        horaFin: horaFin.value,
      },
    });

    Swal.hideLoading();
    await Swal.update({
      icon: "success",
      title: "Materia agregada",
      text: `${nombre.value} se agregó correctamente.`,
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });

    nombre.value = "";
    docente.value = "";
    meta.value = null;
    creditos.value = null;
    dia.value = "";
    horaInicio.value = "";
    horaFin.value = "";
  } catch (error) {
    console.error("No se pudo agregar la materia:", error);
    Swal.hideLoading();
    Swal.update({
      icon: "error",
      title: "Error",
      text: "No se pudo agregar la materia. Intenta de nuevo.",
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
  }
};

const eliminarMateria = async (materia) => {
  const confirmar = await Swal.fire({
    title: `¿Deseas eliminar la materia ${materia.nombre}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmar.isConfirmed) return;

  Swal.fire({
    title: "Eliminando materia...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    await materiasStore.eliminarMateria(materia.id);

    Swal.hideLoading();
    Swal.update({
      icon: "success",
      title: "Materia eliminada",
      text: `${materia.nombre} fue eliminada.`,
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
  } catch (error) {
    console.error("No se pudo eliminar la materia:", error);
    Swal.hideLoading();
    Swal.update({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar la materia.",
      showConfirmButton: true,
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

.materias-dashboard {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-body, var(--color-text));
}

.materias-main {
  margin-left: var(--sidebar-width, 236px);
  padding: 2rem clamp(1.5rem, 3vw, 3rem) 3rem;
}

/* ---------- Header ---------- */
.materias-header {
  margin-bottom: 1.75rem;
}

.materias-header h1 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.materias-subtitulo {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

/* ---------- Layout ---------- */
.materias-content {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(320px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

/* ---------- Formulario ---------- */
.form-materia {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
  animation: fadeInUp 0.32s ease;
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

.form-materia input,
.form-materia select {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  appearance: none;
  font: inherit;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.form-materia input:focus,
.form-materia select:focus {
  outline: none;
  border-color: var(--color-accent-strong);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.form-materia input::placeholder {
  color: var(--color-text-muted);
}

.form-materia select option {
  background: var(--color-surface);
  color: var(--color-text);
}

.horas {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-text-muted);
}

.horas input {
  flex: 1;
}

.form-materia button {
  margin-top: 0.3rem;
  padding: 0.85rem;
  background: var(--color-button);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font: inherit;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.form-materia button:hover {
  background: var(--color-button-hover);
}

.form-materia button:active {
  transform: scale(0.98);
}

/* ---------- Lista de materias ---------- */
.lista-materias-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
  animation: fadeInUp 0.32s ease;
}

.lista-materias-wrapper h2 {
  margin: 0 0 1.1rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-heading);
}

.lista-materias {
  display: grid;
  gap: 0.9rem;
}

.materia-fila {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.1rem;
  padding: 1rem 1.2rem;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease;
}

.materia-fila:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
  border-color: var(--color-border-hover);
}

.materia-icono {
  display: grid;
  place-items: center;
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 12px;
  flex-shrink: 0;
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}

.materia-icono svg {
  width: 1.3rem;
  height: 1.3rem;
}

.materia-datos {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.materia-datos strong {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-heading);
  text-transform: capitalize;
}

.docente {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.materia-datos small {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.btn-eliminar {
  flex-shrink: 0;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger, #ef4444);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font: inherit;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.btn-eliminar:hover {
  background: var(--color-danger, #ef4444);
  color: #fff;
  transform: translateY(-1px);
}

.lista-vacia {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .materias-main {
    margin-left: 0;
  }
}

@media (max-width: 860px) {
  .materias-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .materias-main {
    padding: 1.25rem;
  }

  .materia-fila {
    grid-template-columns: 1fr;
    row-gap: 0.75rem;
  }

  .btn-eliminar {
    justify-self: start;
  }
}
</style>
