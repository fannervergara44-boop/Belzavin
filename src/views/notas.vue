<template>
  <div class="notas-dashboard">
    <Sidebar />

    <main class="notas-main">
      <header class="notas-header">
        <h1>Mis notas</h1>
        <p class="notas-subtitulo">Guarda ideas, recordatorios o resúmenes rápidos de clase.</p>
      </header>

      <div class="notas-content">
        <form class="form-nota" @submit.prevent="guardarNota" data-tour="notas-form">
          <div class="campo">
            <label for="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              v-model="titulo"
              placeholder="Ej. Repaso parcial"
              autocomplete="off"
            />
          </div>

          <div class="campo">
            <label for="contenido">Contenido</label>
            <textarea
              id="contenido"
              v-model="contenido"
              placeholder="Escribe tu nota..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-botones">
            <button v-if="editandoId" type="button" class="btn-cancelar" @click="cancelarEdicion">
              Cancelar
            </button>
            <button type="submit">{{ editandoId ? "Guardar cambios" : "Agregar nota" }}</button>
          </div>
        </form>

        <section class="notas-lista-section">
          <h2>Notas guardadas</h2>

          <div v-if="notasStore.notas.length === 0" class="notas-vacio">
            <p>Aún no tienes notas guardadas.</p>
          </div>

          <div v-else class="lista-notas">
            <div v-for="nota in notasStore.notas" :key="nota.id" class="nota-card">
              <span class="nota-icono">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                  <path d="M9 13h6" />
                  <path d="M9 17h6" />
                </svg>
              </span>

              <div class="nota-datos">
                <div class="nota-header">
                  <strong>{{ nota.titulo }}</strong>
                  <span class="fecha">{{ formatearFecha(nota.createdAt) }}</span>
                </div>
                <p class="nota-contenido">{{ nota.contenido }}</p>
              </div>

              <div class="nota-acciones">
                <button type="button" class="btn-editar" @click="editarNota(nota)">Editar</button>
                <button type="button" class="btn-eliminar" @click="eliminarNota(nota)">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useNotasTextoStore } from "../stores/notasTexto";
import Swal from "sweetalert2";
import Sidebar from "@/layout/Sidebar.vue";

const notasStore = useNotasTextoStore();

const titulo = ref("");
const contenido = ref("");
const editandoId = ref(null);

const guardarNota = async () => {
  if (!titulo.value.trim() || !contenido.value.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Datos incompletos",
      text: "Completa el título y el contenido.",
    });
    return;
  }

  Swal.fire({
    title: editandoId.value ? "Guardando cambios..." : "Agregando nota...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    if (editandoId.value) {
      await notasStore.editarNota(editandoId.value, {
        titulo: titulo.value,
        contenido: contenido.value,
      });
    } else {
      await notasStore.crearNota({ titulo: titulo.value, contenido: contenido.value });
    }

    Swal.hideLoading();
    await Swal.fire({
      icon: "success",
      title: editandoId.value ? "Cambios guardados" : "Nota agregada",
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });

    cancelarEdicion();
  } catch (error) {
    console.error("No se pudo guardar la nota:", error);
    Swal.hideLoading();
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo guardar la nota. Intenta de nuevo.",
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
  }
};

const editarNota = (nota) => {
  editandoId.value = nota.id;
  titulo.value = nota.titulo;
  contenido.value = nota.contenido;
};

const cancelarEdicion = () => {
  editandoId.value = null;
  titulo.value = "";
  contenido.value = "";
};

const eliminarNota = async (nota) => {
  const confirmar = await Swal.fire({
    icon: "question",
    title: "Confirmar",
    text: `¿Eliminar la nota "${nota.titulo}"?`,
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmar.isConfirmed) return;

  Swal.fire({
    title: "Eliminando nota...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    await notasStore.eliminarNota(nota.id);
    Swal.hideLoading();
    Swal.fire({
      icon: "success",
      title: "Nota eliminada",
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
  } catch (error) {
    console.error("No se pudo eliminar la nota:", error);
    Swal.hideLoading();
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar la nota.",
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
  }
};

function formatearFecha(timestamp) {
  if (!timestamp?.seconds) return "";
  const fecha = new Date(timestamp.seconds * 1000);
  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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

.notas-dashboard {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-body, var(--color-text));
}

.notas-main {
  margin-left: var(--sidebar-width, 236px);
  padding: 2rem clamp(1.5rem, 3vw, 3rem) 3rem;
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
}

.notas-subtitulo {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

/* ---------- Layout ---------- */
.notas-content {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(320px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

/* ---------- Formulario ---------- */
.form-nota {
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

.form-nota input,
.form-nota textarea {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-family: inherit;
  font: inherit;
  resize: vertical;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.form-nota input:focus,
.form-nota textarea:focus {
  outline: none;
  border-color: var(--color-accent-strong);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.form-nota input::placeholder,
.form-nota textarea::placeholder {
  color: var(--color-text-muted);
}

.form-botones {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.form-nota button {
  padding: 0.7rem 1.3rem;
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

.form-nota button:hover {
  background: var(--color-button-hover);
}

.form-nota button:active {
  transform: scale(0.98);
}

.btn-cancelar {
  background: var(--color-surface) !important;
  color: var(--color-text-muted) !important;
  border: 1px solid var(--color-border) !important;
}

.btn-cancelar:hover {
  border-color: var(--color-border-hover) !important;
  background: var(--color-surface-soft) !important;
}

/* ---------- Lista de notas ---------- */
.notas-lista-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
  animation: fadeInUp 0.32s ease;
}

.notas-lista-section h2 {
  margin: 0 0 1.1rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-heading);
}

.notas-vacio {
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
  min-height: 90px;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
}

.notas-vacio p {
  margin: 0;
}

.lista-notas {
  display: grid;
  gap: 0.9rem;
}

.nota-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 1.1rem;
  padding: 1.1rem 1.3rem;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  animation: fadeInUp 0.32s ease;
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease;
}

.nota-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
  border-color: var(--color-border-hover);
}

.nota-icono {
  display: grid;
  place-items: center;
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 12px;
  flex-shrink: 0;
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}

.nota-icono svg {
  width: 1.3rem;
  height: 1.3rem;
}

.nota-datos {
  min-width: 0;
}

.nota-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
}

.nota-header strong {
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--color-heading);
}

.fecha {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.nota-contenido {
  margin: 0;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  line-height: 1.55;
  font-size: 0.9rem;
}

.nota-acciones {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.nota-acciones button {
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  font: inherit;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.nota-acciones button:hover {
  transform: translateY(-1px);
}

.btn-editar {
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}

.btn-editar:hover {
  background: var(--color-accent-strong);
  color: #fff;
}

.btn-eliminar {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger, #ef4444);
}

.btn-eliminar:hover {
  background: var(--color-danger, #ef4444);
  color: #fff;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .notas-main {
    margin-left: 0;
  }
}

@media (max-width: 980px) {
  .notas-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .notas-main {
    padding: 1.25rem;
  }

  .nota-card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .nota-acciones {
    grid-column: 1 / -1;
    flex-direction: row;
  }
}
</style>
