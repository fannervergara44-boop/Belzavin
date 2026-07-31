<template>
  <div class="materias-wrapper">
    <titulo titulo="Registro de materias" />
    <div class="materias-content">
      <form class="form-materia" @submit.prevent="agregarMateria">
        <input type="text" v-model="nombre" placeholder="Nombre de la materia" />
        <input type="text" v-model="docente" placeholder="Nombre del docente" />
        <input
          type="number"
          v-model.number="meta"
          placeholder="Meta (ej. 3.5)"
          step="0.1"
          min="0"
          max="5"
        />

        <input
          type="number"
          v-model.number="creditos"
          placeholder="Créditos (ej. 3)"
          min="1"
          max="10"
        />

        <select v-model="dia">
          <option disabled value="">Día de la semana</option>
          <option>Lunes</option>
          <option>Martes</option>
          <option>Miércoles</option>
          <option>Jueves</option>
          <option>Viernes</option>
          <option>Sábado</option>
        </select>

        <div class="horas">
          <input type="time" v-model="horaInicio" />
          <span>a</span>
          <input type="time" v-model="horaFin" />
        </div>

        <button type="submit">Agregar materia</button>
      </form>

      <div class="lista-materias-wrapper">
        <h2>Materias registradas</h2>
        <ul class="lista-materias" v-if="materiasStore.materias.length">
          <li v-for="materia in materiasStore.materias" :key="materia.id">
            <div class="materia-info">
              <strong>{{ materia.nombre }}</strong> — {{ materia.docente }}
              <br />
              <small>
                {{ materia.horario?.dia }} {{ materia.horario?.horaInicio }} -
                {{ materia.horario?.horaFin }}
              </small>
            </div>
            <button class="btn-eliminar" type="button" @click="eliminarMateria(materia)">
              Eliminar
            </button>
          </li>
        </ul>
        <p v-else class="lista-vacia">Aún no tienes materias registradas.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMateriasStore } from "../stores/materias";
import Swal from "sweetalert2";
import titulo from "@/components/titulo.vue";
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

  nombre.value = "";
  docente.value = "";
  meta.value = null;
  creditos.value = null;
  dia.value = "";
  horaInicio.value = "";
  horaFin.value = "";
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

  try {
    await materiasStore.eliminarMateria(materia.id);
  } catch (error) {
    console.error("No se pudo eliminar la materia:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar la materia.",
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

.materias-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 2rem 1rem 3rem;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
}

.materias-wrapper h1 {
  position: relative;
  z-index: 1;
  margin: 0 0 1.25rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text);
  animation: fadeInDown 0.7s ease both;
}

.form-materia {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 480px;
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
  animation: fadeInUp 0.6s ease both;
}

.form-materia input,
.form-materia select {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  text-align: center;
  appearance: none;
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
  gap: 0.5rem;
  color: var(--color-text-muted);
}

.horas input {
  flex: 1;
}

.form-materia button {
  padding: 0.85rem;
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

.form-materia button:hover {
  background: var(--color-button-hover);
}

.form-materia button:active {
  transform: scale(0.98);
}

.materias-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1180px;
  display: grid;
  grid-template-columns: minmax(320px, 480px) minmax(320px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.lista-materias-wrapper {
  width: 100%;
  padding: 1.25rem;
  border-radius: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
}

.lista-materias-wrapper h2 {
  margin: 0 0 0.9rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.lista-materias {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lista-materias li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: var(--color-surface-soft);
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  animation: fadeInUp 0.5s ease both;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.lista-materias li:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(15, 27, 45, 0.08);
  border-color: var(--color-border-hover);
}

.materia-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.materia-info small {
  color: var(--color-text-muted);
}

.btn-eliminar {
  padding: 0.6rem 0.8rem;
  border: none;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.btn-eliminar:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.lista-vacia {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

@media (max-width: 860px) {
  .materias-content {
    grid-template-columns: 1fr;
  }
}

.volver-materias {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 1000;
}
</style>
