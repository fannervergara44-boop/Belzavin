<template>
  <div class="perfil-wrapper">
    <titulo titulo="Mi perfil" />
    <h1></h1>

    <botonvolver ruta="/home" texto="Volver al inicio" class="volver-perfil" />

    <!-- Datos del usuario -->
    <div class="perfil-card">
      <img
        v-if="authStore.usuario?.photoURL"
        :src="authStore.usuario.photoURL"
        alt="Foto de perfil"
        class="perfil-avatar"
      />

      <div v-if="!editando" class="perfil-info">
        <h2>{{ authStore.usuario?.displayName || "Usuario" }}</h2>
        <p class="email">{{ authStore.usuario?.email }}</p>
        <button class="btn-editar" @click="abrirEdicion">Editar perfil</button>
      </div>

      <form v-else class="form-editar" @submit.prevent="guardarPerfil">
        <input type="text" v-model="nuevoNombre" placeholder="Nombre de usuario" />
        <div class="form-botones">
          <button type="button" class="btn-cancelar" @click="editando = false">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar</button>
        </div>
      </form>
    </div>

    <!-- Historial de materias -->
    <h2 class="titulo-historial">Historial académico</h2>

    <div v-if="materiasStore.materias.length === 0" class="vacio">
      Aún no tienes materias registradas.
    </div>

    <div class="lista-historial">
      <div
        v-for="materia in materiasStore.materiasConPromedio"
        :key="materia.id"
        class="materia-historial"
      >
        <div class="materia-resumen" @click="toggleExpandida(materia.id)">
          <div>
            <strong>{{ materia.nombre }}</strong>
            <span class="docente"> — {{ materia.docente }}</span>
          </div>
          <div class="resumen-derecha">
            <span class="promedio-chip">Promedio: {{ materia.promedio.toFixed(1) }}</span>
            <span class="flecha">{{ expandida === materia.id ? "▲" : "▼" }}</span>
          </div>
        </div>

        <div v-if="expandida === materia.id" class="materia-detalle">
          <div
            v-for="corteId in ['corte1', 'corte2', 'corte3']"
            :key="corteId"
            class="corte-detalle"
          >
            <p class="corte-titulo">
              Corte {{ corteId.slice(-1) }} — Promedio:
              {{ promedioCorte(materia.id, corteId).toFixed(1) }}
            </p>
            <ul v-if="notasDeCorte(materia.id, corteId).length">
              <li v-for="nota in notasDeCorte(materia.id, corteId)" :key="nota.id">
                {{ nota.nombre }} ({{ nota.tipo || "Nota" }}) — {{ nota.valor }} ·
                {{ nota.porcentaje }}%
              </li>
            </ul>
            <p v-else class="sin-notas">Sin notas registradas.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { updateProfile } from "firebase/auth";
import { auth } from "../service/firebase";
import { useAuthStore } from "../stores/auth";
import { useMateriasStore } from "../stores/materias";
import botonvolver from "@/components/botonvolver.vue";
import titulo from "@/components/titulo.vue";
import Titulo from "@/components/titulo.vue";

const authStore = useAuthStore();
const materiasStore = useMateriasStore();

const editando = ref(false);
const nuevoNombre = ref("");

function abrirEdicion() {
  nuevoNombre.value = authStore.usuario?.displayName || "";
  editando.value = true;
}

function generarAvatar(nombre) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=0b5fff&color=fff`;
}

const guardarPerfil = async () => {
  if (!nuevoNombre.value.trim()) return;

  await updateProfile(auth.currentUser, {
    displayName: nuevoNombre.value,
    photoURL: generarAvatar(nuevoNombre.value),
  });

  await auth.currentUser.reload();
  authStore.usuario = auth.currentUser;

  editando.value = false;
};

const expandida = ref(null);

function toggleExpandida(materiaId) {
  expandida.value = expandida.value === materiaId ? null : materiaId;
}

function notasDeCorte(materiaId, corteId) {
  return materiasStore.notasPorMateria[materiaId]?.[corteId] || [];
}

function promedioCorte(materiaId, corteId) {
  const notas = notasDeCorte(materiaId, corteId);
  if (notas.length === 0) return 0;
  return notas.reduce((suma, n) => suma + n.valor * (n.porcentaje / 100), 0);
}
</script>

<style scoped>
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fondo */

.perfil-wrapper {
  position: relative;

  min-height: 100vh;
  width: 100%;

  padding: 2rem 1rem 3rem;

  background: #f4f7fb;
  color: #0f1b2d;

  box-sizing: border-box;
}

/* Volver */

.volver-materias {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 10;
}

/* Titulo */

.perfil-wrapper > h1 {
  position: relative;
  z-index: 1;

  margin: 0 0 1.5rem;

  color: #0f1b2d;

  font-size: 2rem;
  font-weight: 800;

  animation: fadeDown 0.7s ease;
}

/* Tarjeta perfil */

.perfil-card {
  position: relative;
  z-index: 1;

  max-width: 700px;

  margin: auto;

  padding: 1.8rem;

  display: flex;
  align-items: center;
  gap: 1.5rem;

  background: #ffffff;

  border: 1px solid #e5eaf1;

  border-radius: 18px;

  box-shadow: 0 20px 50px rgba(15, 27, 45, 0.08);

  animation: fadeUp 0.6s ease;
}

.perfil-avatar {
  width: 80px;
  height: 80px;

  border-radius: 50%;

  object-fit: cover;

  border: 2px solid #dde4ee;
}

/* Información */

.perfil-info h2 {
  margin: 0;

  color: #0f1b2d;
}

.email {
  margin: 0.4rem 0 1rem;

  color: #7a8aa0;
}

/* Inputs */

.form-editar {
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: 0.8rem;
}

.form-editar input {
  width: 100%;

  padding: 0.85rem 1rem;

  border-radius: 10px;

  border: 1px solid #dde4ee;

  background: #f8fafc;

  color: #0f1b2d;

  transition: 0.2s ease;
}

.form-editar input:focus {
  outline: none;

  border-color: #0b5fff;

  background: #ffffff;

  box-shadow: 0 0 0 3px rgba(11, 95, 255, 0.12);
}

/* Botones */

.btn-editar,
.btn-guardar,
.btn-cancelar {
  padding: 0.7rem 1.1rem;

  border: none;

  border-radius: 10px;

  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

.btn-editar,
.btn-guardar {
  background: #0b5fff;

  color: white;
}

.btn-editar:hover,
.btn-guardar:hover {
  background: #0a52dd;
}

.btn-cancelar {
  background: #ffffff;

  color: #5b6b7f;

  border: 1px solid #dde4ee;
}

.btn-cancelar:hover {
  border-color: #c4ccd8;

  background: #f8fafc;
}

/* Historial */

.titulo-historial,
.vacio,
.lista-historial {
  position: relative;
  z-index: 1;

  max-width: 700px;

  margin-left: auto;
  margin-right: auto;
}

.titulo-historial {
  margin-top: 2rem;
  font-weight: 700;

  color: #0f1b2d;
}

.lista-historial {
  display: flex;

  flex-direction: column;

  gap: 0.8rem;
}

.materia-historial {
  overflow: hidden;

  background: #ffffff;

  border: 1px solid #e5eaf1;

  border-radius: 12px;

  box-shadow: 0 8px 20px rgba(15, 27, 45, 0.06);

  animation: fadeUp 0.5s ease;
}

.materia-resumen {
  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 1rem 1.2rem;

  cursor: pointer;
}

.materia-resumen strong {
  color: #0f1b2d;
}

.docente {
  color: #7a8aa0;

  font-size: 0.9rem;
}

.promedio-chip {
  padding: 0.25rem 0.7rem;

  border-radius: 999px;

  background: #0b5fff;

  color: white;

  font-size: 0.8rem;
}

.flecha {
  color: #a3adba;
}

.materia-detalle {
  padding: 1rem 1.2rem;

  border-top: 1px solid #e5eaf1;
}

.corte-titulo {
  color: #0b5fff;
  font-weight: 600;
}

.corte-detalle li {
  list-style: none;

  padding: 0.25rem 0;

  color: #5b6b7f;
}

.sin-notas,
.vacio {
  color: #a3adba;
}

.volver-perfil {
  position: fixed;
  top: 20px;
  left: 50px;
  z-index: 1000;
}
</style>
