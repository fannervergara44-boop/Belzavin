<template>
  <div class="materias-wrapper">
    <titulo titulo="Registro de materias" />
    <botonvolver ruta="/home" texto="volver al inicio" class="volver-materias" />
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
import botonvolver from "@/components/botonvolver.vue";
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

.materias-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 2rem 1rem 3rem;
  color: #e6fff2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #05080a;
}

.materias-wrapper::before {
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

.materias-wrapper::after {
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

.materias-wrapper h1 {
  position: relative;
  z-index: 1;
  margin: 0 0 1.25rem;
  text-align: center;
  font-size: 2rem;
  color: #d7f5e6;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
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
  background: linear-gradient(180deg, #0a1410 0%, #060b0f 100%);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(46, 125, 91, 0.25);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.form-materia input,
.form-materia select {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(47, 125, 90, 0.35);
  background: linear-gradient(135deg, rgba(14, 39, 48, 0.98), rgba(8, 26, 34, 0.98));
  color: #f2fff8;
  text-align: center;
  appearance: none;
  box-shadow: inset 0 0 0 1px rgba(74, 166, 116, 0.12);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.form-materia input:focus,
.form-materia select:focus {
  outline: none;
  border-color: rgba(74, 166, 116, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 0 0 3px rgba(47, 125, 90, 0.22);
}

.form-materia input::placeholder {
  color: rgba(230, 240, 255, 0.6);
}

.form-materia select option {
  background: #0b1418;
  color: #f2fff8;
}

.horas {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.horas input {
  flex: 1;
}

.form-materia button {
  position: relative;
  overflow: hidden;
  padding: 0.85rem;
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

.form-materia button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-120%);
  transition: transform 0.5s ease;
}

.form-materia button:hover::before,
.form-materia button:focus-visible::before {
  transform: translateX(120%);
}

.form-materia button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(46, 125, 91, 0.28);
}

.form-materia button:active {
  transform: scale(0.97);
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
  background: rgba(10, 20, 16, 0.85);
  border: 1px solid rgba(46, 125, 91, 0.2);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

.lista-materias-wrapper h2 {
  margin: 0 0 0.9rem;
  font-size: 1.1rem;
  color: #d7f5e6;
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
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.14), rgba(46, 125, 91, 0.08));
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(46, 125, 91, 0.18);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.18);
  color: #e6f0ff;
  animation: fadeInUp 0.6s ease both;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.lista-materias li:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

.materia-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.btn-eliminar {
  padding: 0.6rem 0.8rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 99, 99, 0.95), rgba(188, 44, 44, 0.95));
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-eliminar:hover {
  transform: translateY(-1px);
}

.lista-vacia {
  margin: 0;
  color: rgba(230, 255, 242, 0.75);
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
