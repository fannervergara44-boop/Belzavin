<template>
  <div class="notas-texto-wrapper">
    <h1>Mis notas</h1>
    <form class="form-nota" @submit.prevent="guardarNota">
      <input type="text" v-model="titulo" placeholder="Título" />
      <textarea v-model="contenido" placeholder="Escribe tu nota..." rows="4"></textarea>
      <div class="form-botones">
        <button v-if="editandoId" type="button" class="btn-cancelar" @click="cancelarEdicion">
          Cancelar
        </button>
        <button type="submit">{{ editandoId ? "Guardar cambios" : "Agregar nota" }}</button>
      </div>
    </form>

    <div v-if="notasStore.notas.length === 0" class="vacio">Aún no tienes notas guardadas.</div>

    <div class="lista-notas">
      <div v-for="nota in notasStore.notas" :key="nota.id" class="nota-card">
        <div class="nota-header">
          <strong>{{ nota.titulo }}</strong>
          <span class="fecha">{{ formatearFecha(nota.createdAt) }}</span>
        </div>
        <p class="nota-contenido">{{ nota.contenido }}</p>
        <div class="nota-acciones">
          <button @click="editarNota(nota)">Editar</button>
          <button class="btn-eliminar" @click="eliminarNota(nota)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useNotasTextoStore } from "../stores/notasTexto";
import Swal from "sweetalert2";

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

  if (editandoId.value) {
    await notasStore.editarNota(editandoId.value, {
      titulo: titulo.value,
      contenido: contenido.value,
    });
  } else {
    await notasStore.crearNota({ titulo: titulo.value, contenido: contenido.value });
  }

  cancelarEdicion();
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

  await notasStore.eliminarNota(nota.id);
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

.notas-texto-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 2rem 1rem 3rem;
  color: var(--color-text);
  background: var(--color-background);
  box-sizing: border-box;
}

.notas-texto-wrapper > h1 {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text);
  animation: fadeInDown 0.7s ease both;
}

.form-nota {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
  animation: fadeInUp 0.6s ease both;
}

.form-nota input,
.form-nota textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-family: inherit;
  resize: vertical;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
  box-sizing: border-box;
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
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.form-nota button:hover {
  background: var(--color-button-hover);
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

.vacio {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  color: var(--color-text-muted);
}

.lista-notas {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.nota-card {
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

.nota-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(15, 27, 45, 0.1);
}

.nota-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.nota-header strong {
  color: var(--color-text);
}

.fecha {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.nota-contenido {
  margin: 0 0 0.85rem;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  line-height: 1.5;
}

.nota-acciones {
  display: flex;
  gap: 0.5rem;
}

.nota-acciones button {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--color-accent-soft);
  color: var(--color-link);
  transition: transform 0.15s ease;
}

.nota-acciones button:hover {
  transform: translateY(-1px);
}

.btn-eliminar {
  background: #dc2626 !important;
  color: #fff !important;
}

.btn-eliminar:hover {
  background: #b91c1c !important;
}

.volver-notas {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 1000;
}
</style>
