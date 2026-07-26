<template>
  <div class="notas-texto-wrapper">
    <h1>Mis notas</h1>
    <botonvolver ruta="home" texto="Volver al inicio" class="volver-notas" />
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
import botonvolver from "@/components/botonvolver.vue";

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

.notas-texto-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 2rem 1rem 3rem;
  color: #e6fff2;
  background: #05080a;
  box-sizing: border-box;
}

.notas-texto-wrapper::before {
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
  pointer-events: none;
}

.notas-texto-wrapper::after {
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
  pointer-events: none;
}

.notas-texto-wrapper > h1 {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: #d7f5e6;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
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
  background: linear-gradient(180deg, #0a1410 0%, #060b0f 100%);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(46, 125, 91, 0.25);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.form-nota input,
.form-nota textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(47, 125, 90, 0.35);
  background: linear-gradient(135deg, rgba(14, 39, 48, 0.98), rgba(8, 26, 34, 0.98));
  color: #f2fff8;
  font-family: inherit;
  resize: vertical;
  box-shadow: inset 0 0 0 1px rgba(74, 166, 116, 0.12);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-nota input:focus,
.form-nota textarea:focus {
  outline: none;
  border-color: rgba(74, 166, 116, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 0 0 3px rgba(47, 125, 90, 0.22);
}

.form-nota input::placeholder,
.form-nota textarea::placeholder {
  color: rgba(230, 240, 255, 0.5);
}

.form-botones {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.form-nota button {
  position: relative;
  overflow: hidden;
  padding: 0.7rem 1.3rem;
  background: linear-gradient(135deg, #0b5fff 0%, #2e7d5b 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(11, 95, 255, 0.18);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.form-nota button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(46, 125, 91, 0.28);
}

.btn-cancelar {
  background: rgba(255, 255, 255, 0.08) !important;
  box-shadow: none !important;
}

.vacio {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  color: rgba(230, 255, 242, 0.6);
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
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.14), rgba(46, 125, 91, 0.08));
  border: 1px solid rgba(46, 125, 91, 0.18);
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.18);
  padding: 1.1rem 1.3rem;
  animation: fadeInUp 0.6s ease both;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.nota-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

.nota-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.nota-header strong {
  color: #f2fff8;
}

.fecha {
  font-size: 0.75rem;
  color: rgba(230, 255, 242, 0.5);
}

.nota-contenido {
  margin: 0 0 0.85rem;
  color: rgba(230, 255, 242, 0.8);
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
  background: rgba(11, 95, 255, 0.15);
  color: #a8c9ff;
  transition: transform 0.15s ease;
}

.nota-acciones button:hover {
  transform: translateY(-1px);
}

.btn-eliminar {
  background: linear-gradient(135deg, rgba(255, 99, 99, 0.95), rgba(188, 44, 44, 0.95)) !important;
  color: #fff !important;
}

.volver-notas {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 1000;
}
</style>
