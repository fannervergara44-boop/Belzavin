<template>
  <div class="perfil-dashboard">
    <Sidebar />

    <main class="perfil-wrapper">
      <header class="perfil-header">
        <h1>Mi perfil</h1>
        <p class="perfil-subtitulo">Tu información personal y tu progreso académico.</p>
      </header>

      <!-- Datos del usuario -->
      <div class="perfil-card" data-tour="perfil-card">
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

        <div v-if="!editando" class="perfil-stats">
          <div class="perfil-stat">
            <span class="perfil-stat-valor">{{ materiasStore.materias.length }}</span>
            <span class="perfil-stat-label">Materias</span>
          </div>
          <div class="perfil-stat-divisor" aria-hidden="true"></div>
          <div class="perfil-stat">
            <span class="perfil-stat-valor perfil-stat-valor--acento">{{
              materiasStore.promedioGeneral !== null
                ? materiasStore.promedioGeneral.toFixed(1)
                : "—"
            }}</span>
            <span class="perfil-stat-label">Promedio general</span>
          </div>
          <div class="perfil-stat-divisor" aria-hidden="true"></div>
          <div class="perfil-stat">
            <span class="perfil-stat-valor">{{ creditosRegistrados }}</span>
            <span class="perfil-stat-label">Créditos</span>
          </div>
        </div>
      </div>

      <div class="perfil-grid">
        <!-- Ranking por promedio -->
        <section class="columna-ranking" data-tour="perfil-ranking">
          <h2 class="titulo-columna">Ranking por promedio</h2>

          <div class="ranking-card" :class="{ 'ranking-card--vacio': !rankingMaterias.length }">
            <ol v-if="rankingMaterias.length">
              <li v-for="(materia, index) in rankingMaterias" :key="materia.id">
                <div class="ranking-fila-superior">
                  <span class="ranking-pos" :class="`ranking-pos--${index}`">{{ index + 1 }}</span>
                  <span class="ranking-nombre">{{ materia.nombre }}</span>
                  <span class="ranking-valor">{{ materia.promedio.toFixed(1) }}</span>
                </div>
              </li>
            </ol>

            <div v-else class="ranking-vacio">
              <span class="ranking-vacio-icono" aria-hidden="true">🏆</span>
              <p class="ranking-vacio-titulo">Sin materias aún</p>
              <p class="ranking-vacio-texto">
                Cuando tengas notas registradas vas a ver acá tu ranking por promedio.
              </p>
            </div>
          </div>
        </section>

        <!-- Historial de materias -->
        <section class="columna-historial" data-tour="perfil-historial">
          <h2 class="titulo-columna">Historial académico</h2>

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
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { updateProfile } from "firebase/auth";
import { auth } from "../service/firebase";
import { useAuthStore } from "../stores/auth";
import { useMateriasStore } from "../stores/materias";
import Sidebar from "@/layout/Sidebar.vue";

const authStore = useAuthStore();
const materiasStore = useMateriasStore();

const editando = ref(false);
const nuevoNombre = ref("");

const rankingMaterias = computed(() =>
  materiasStore.materiasConPromedio
    .filter((m) => m.tieneNotas)
    .slice()
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 3),
);

const creditosRegistrados = computed(() =>
  materiasStore.materias.reduce((acc, m) => acc + (m.creditos || 0), 0),
);

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

/* Fondo */

.perfil-dashboard {
  min-height: 100vh;
  background: var(--color-background);
}

.perfil-wrapper {
  position: relative;

  min-height: 100vh;
  width: calc(100% - var(--sidebar-width, 236px));

  margin-left: var(--sidebar-width, 236px);
  padding: 2rem clamp(1.5rem, 3vw, 3rem) 3rem;

  background: var(--color-background);
  color: var(--color-text);

  box-sizing: border-box;
}

/* Header */

.perfil-header {
  position: relative;
  z-index: 1;
  margin-bottom: 1.75rem;
}

.perfil-header h1 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-heading, var(--color-text));
  letter-spacing: -0.01em;
}

.perfil-subtitulo {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

/* Tarjeta perfil */

.perfil-card {
  position: relative;
  z-index: 1;

  width: 100%;

  padding: 1.5rem 1.75rem;

  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;

  background: var(--color-surface);

  border: 1px solid var(--color-border);

  border-radius: 18px;

  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);

  animation: fadeUp 0.6s ease;
}

.perfil-avatar {
  width: 80px;
  height: 80px;
  flex-shrink: 0;

  border-radius: 50%;

  object-fit: cover;

  border: 2px solid var(--color-border);
}

/* Mini-estadísticas dentro de la tarjeta de perfil */

.perfil-stats {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  margin-left: auto;
  flex-shrink: 0;
}

.perfil-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  min-width: 5.5rem;
}

.perfil-stat-valor {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-heading, var(--color-text));
}

.perfil-stat-valor--acento {
  color: var(--color-accent-strong);
}

.perfil-stat-label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  text-align: center;
}

.perfil-stat-divisor {
  width: 1px;
  height: 2.6rem;
  background: var(--color-border);
  flex-shrink: 0;
}

/* Información */

.perfil-info h2 {
  margin: 0;
  font-weight: 800;

  color: var(--color-heading, var(--color-text));
}

.email {
  margin: 0.4rem 0 1rem;

  color: var(--color-text-muted);
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

  border: 1px solid var(--color-border);

  background: var(--color-surface-soft);

  color: var(--color-text);

  transition: 0.2s ease;
}

.form-editar input:focus {
  outline: none;

  border-color: var(--color-accent-strong);

  background: var(--color-surface);

  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
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
  background: var(--color-button);

  color: white;
}

.btn-editar:hover,
.btn-guardar:hover {
  background: var(--color-button-hover);
}

.btn-cancelar {
  background: var(--color-surface);

  color: var(--color-text-muted);

  border: 1px solid var(--color-border);
}

.btn-cancelar:hover {
  border-color: var(--color-border-hover);

  background: var(--color-surface-soft);
}

/* Grid de dos columnas: ranking a la izquierda, historial a la derecha */

.perfil-grid {
  position: relative;
  z-index: 1;

  width: 100%;
  margin-top: 1.75rem;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 1.5rem;
  align-items: start;
}

.titulo-columna {
  margin: 0 0 1.1rem;
  font-size: 1.15rem;
  font-weight: 800;

  color: var(--color-heading, var(--color-text));
}

.lista-historial {
  display: flex;

  flex-direction: column;

  gap: 0.8rem;
}

.materia-historial {
  overflow: hidden;

  background: var(--color-surface);

  border: 1px solid var(--color-border);

  border-radius: 16px;

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);

  transition: box-shadow 200ms ease;

  animation: fadeUp 0.5s ease;
}

.materia-historial:hover {
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
}

.materia-resumen {
  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 1.1rem 1.4rem;

  cursor: pointer;
}

.materia-resumen strong {
  font-weight: 800;
  color: var(--color-heading, var(--color-text));
}

.docente {
  color: var(--color-text-muted);

  font-size: 0.85rem;
  font-weight: 600;
}

.promedio-chip {
  padding: 0.3rem 0.75rem;

  border-radius: 999px;
  font-weight: 700;

  background: rgba(56, 189, 248, 0.14);

  color: var(--color-info, var(--color-accent-strong));

  font-size: 0.78rem;
}

.flecha {
  color: var(--color-text-muted);
}

.materia-detalle {
  padding: 1rem 1.4rem 1.2rem;

  border-top: 1px solid var(--color-border);
}

.corte-titulo {
  color: var(--color-link);
  font-weight: 600;
}

.corte-detalle li {
  list-style: none;

  padding: 0.25rem 0;

  color: var(--color-text-muted);
}

.sin-notas {
  color: var(--color-text-muted);
}

.vacio {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.6rem 1.75rem;
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
  min-height: 98px;
  text-align: center;
}

/* Ranking */

.ranking-card {
  padding: 1.35rem 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
}

.ranking-card--vacio {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-card ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.9rem;
}

.ranking-card li {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.1rem 1.3rem;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.08);
  transition:
    background 200ms ease,
    transform 200ms ease;
}

.ranking-card li:hover {
  background: var(--color-accent-soft);
  transform: translateY(-1px);
}

.ranking-fila-superior {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.9rem;
  align-items: center;
}

.ranking-pos {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  flex-shrink: 0;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}

.ranking-pos--0 {
  background: rgba(34, 197, 94, 0.16);
  color: var(--color-success);
}

.ranking-pos--1 {
  background: rgba(56, 189, 248, 0.16);
  color: var(--color-info, var(--color-accent-strong));
}

.ranking-pos--2 {
  background: rgba(245, 158, 11, 0.16);
  color: var(--color-warning);
}

.ranking-nombre {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading, var(--color-text));
  text-transform: capitalize;
}

.ranking-valor {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-heading, var(--color-text));
}

.ranking-vacio {
  display: grid;
  gap: 0.6rem;
  justify-items: center;
  text-align: center;
  color: var(--color-text-muted);
}

.ranking-vacio-icono {
  font-size: 1.9rem;
}

.ranking-vacio-titulo {
  margin: 0;
  font-size: 0.98rem;
  color: var(--color-heading, var(--color-text));
}

.ranking-vacio-texto {
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .perfil-wrapper {
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 800px) {
  .perfil-grid {
    grid-template-columns: 1fr;
  }

  .perfil-stats {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
