<template>
  <div class="home">
    <div
      v-if="mostrarBienvenida"
      class="bienvenida-overlay"
      @click.self="mostrarBienvenida = false"
    >
      <div class="bienvenida-modal">
        <h2>¡Bienvenido a Belzavin, {{ authStore.usuario?.displayName }}!</h2>
        <p>
          Acá vas a poder llevar tus materias, notas, horario y promedios en un solo lugar. Empezá
          creando tu primera materia desde el menú.
        </p>
        <button @click="irAMateriasDesdeBienvenida">Empezar</button>
      </div>
    </div>

    <header class="top-bar">
      <div v-if="authStore.cargando" class="user-bar user-bar-empty">
        <p>Cargando...</p>
      </div>

      <div v-else-if="authStore.usuario" class="user-bar">
        <div class="user-info">
          <img
            v-if="authStore.usuario.photoURL"
            :src="authStore.usuario.photoURL"
            alt="Foto de perfil"
            class="profile-pic"
          />

          <div class="user-meta">
            <h2>Hola {{ authStore.usuario.displayName || "Usuario" }}</h2>
            <p class="email">{{ authStore.usuario.email }}</p>
          </div>
        </div>

        <div class="user-actions">
          <div class="promedio-general-card">
            <span class="promedio-general-label">Promedio general</span>
            <span class="promedio-general-valor">{{
              materiasStore.promedioGeneral.toFixed(1)
            }}</span>
          </div>

          <button class="logout-btn" @click="cerrarSesion">Cerrar sesión</button>
        </div>
      </div>

      <div v-else class="user-bar user-bar-empty">
        <p>No hay usuario conectado</p>
      </div>
    </header>

    <Sidebar />

    <main class="home-content">
      <section class="dashboard-panel">
        <div class="dashboard-header">
          <Titulo
            titulo="Bienvenido a Belzavin"
            subtitulo="Tu resumen académico en un solo lugar"
          />
        </div>

        <div class="widget-hoy">
          <h3>Hoy es {{ diaHoy }}</h3>
          <div v-if="clasesDeHoy.length === 0" class="hoy-vacio">
            No tienes clases programadas hoy
          </div>
          <div v-else class="lista-hoy">
            <div v-for="materia in clasesDeHoy" :key="materia.id" class="clase-hoy">
              <p>
                Hoy tienes clase de <strong>{{ materia.nombre }}</strong> de
                {{ materia.horario.horaInicio }} a {{ materia.horario.horaFin }}
              </p>
            </div>
          </div>
        </div>

        <div class="resumen-materias">
          <div
            v-for="materia in materiasStore.materiasConPromedio"
            :key="materia.id"
            class="materia-card"
            @click="irANotas(materia.id)"
          >
            <div class="materia-info">
              <strong>{{ materia.nombre }}</strong>
              <p class="docente">{{ materia.docente }}</p>
              <small>
                {{ materia.horario?.dia }} {{ materia.horario?.horaInicio }} -
                {{ materia.horario?.horaFin }}
              </small>

              <div class="meta-info">
                <template v-if="materia.completa">
                  <p v-if="materia.promedio >= materia.meta" class="mensaje-exito">
                    ¡Meta alcanzada! Superaste tu meta de {{ materia.meta }}.
                  </p>
                  <p v-else class="mensaje-fallo">
                    No alcanzaste tu meta de {{ materia.meta }}. Te faltó
                    {{ materia.diferenciaMeta.toFixed(1) }}.
                  </p>
                </template>
                <template v-else>
                  <p v-if="materia.diferenciaMeta > 0" class="mensaje-progreso">
                    Te faltan {{ materia.diferenciaMeta.toFixed(1) }} puntos para tu meta de
                    {{ materia.meta }}.
                  </p>
                  <p v-else class="mensaje-progreso">
                    ¡Vas superando tu meta de {{ materia.meta }} por ahora!
                  </p>
                </template>
              </div>
            </div>

            <div class="promedio-badge">
              <span class="promedio-label">Promedio</span>
              <span class="promedio-valor">{{ materia.promedio.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import Sidebar from "../layout/Sidebar.vue";
import { useAuthStore } from "../stores/auth";
import { signOut } from "firebase/auth";
import { auth } from "../service/firebase";
import { useMateriasStore } from "../stores/materias";
import Titulo from "@/components/titulo.vue";
import Swal from "sweetalert2";

const authStore = useAuthStore();
const router = useRouter();
const materiasStore = useMateriasStore();

const cerrarSesion = async () => {
  try {
    await signOut(auth);

    await Swal.fire({
      icon: "success",
      title: "Sesión cerrada",
      text: "La sesión se cerró correctamente.",
      confirmButtonText: "Aceptar",
    });

    router.push({ name: "inicio_sesion" });
  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cerrar la sesión.",
      confirmButtonText: "Aceptar",
    });
  }
};
const irANotas = (materiaId) => {
  router.push({ name: "notas_materia", params: { materiaId } });
};

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const diaHoy = computed(() => diasSemana[new Date().getDay()]);

const clasesDeHoy = computed(() =>
  materiasStore.materias
    .filter((m) => m.horario?.dia === diaHoy.value)
    .sort((a, b) => (a.horario.horaInicio || "").localeCompare(b.horario.horaInicio || "")),
);

const mostrarBienvenida = ref(false);
const irAMateriasDesdeBienvenida = () => {
  mostrarBienvenida.value = false;
  router.push({ name: "materias" });
};

onMounted(() => {
  const usuario = authStore.usuario;
  if (!usuario) return;

  const esRegistroNuevo = usuario.metadata?.creationTime === usuario.metadata?.lastSignInTime;
  const yaVioBienvenida = localStorage.getItem(`bienvenida_vista_${usuario.uid}`);

  if (esRegistroNuevo && !yaVioBienvenida) {
    mostrarBienvenida.value = true;
    localStorage.setItem(`bienvenida_vista_${usuario.uid}`, "true");
  }
});
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

.home {
  --top-bar-height: 7.5rem;
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #05080a;
  color: #e9f8ef;
  overflow: hidden;
}

.home::before {
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

.home::after {
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

.bienvenida-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.bienvenida-modal {
  max-width: 420px;
  background: linear-gradient(180deg, #0a1410 0%, #060b0f 100%);
  border: 1px solid rgba(46, 125, 91, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  color: #e6fff2;
}

.bienvenida-modal h2 {
  margin: 0 0 1rem;
  color: #d7f5e6;
  font-size: 1.4rem;
}

.bienvenida-modal p {
  color: rgba(230, 255, 242, 0.8);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.bienvenida-modal button {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #0b5fff 0%, #2e7d5b 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.top-bar {
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(7, 17, 24, 0.92);
  color: #ffffff;
  border-bottom: 1px solid rgba(46, 125, 91, 0.25);
  z-index: 10;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
}

.user-bar {
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.user-bar-empty {
  justify-content: center;
  padding: 1rem 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-pic {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.18);
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-meta h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.user-meta .email {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.promedio-general-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(19, 95, 175, 0.25), rgba(80, 135, 106, 0.18));
  border: 1px solid rgba(94, 153, 113, 0.24);
  min-width: 118px;
}

.promedio-general-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.78);
}

.promedio-general-valor {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}

.logout-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #2f7d5a 0%, #2d78c8 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 10px 24px rgba(47, 125, 90, 0.18);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.logout-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transform: translateX(-120%);
  transition: transform 0.5s ease;
}

.logout-btn:hover::before,
.logout-btn:focus-visible::before {
  transform: translateX(120%);
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(47, 125, 90, 0.24);
}

.logout-btn:active {
  transform: scale(0.97);
}

.home-content {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 7.5rem 1.5rem 2rem;
  margin-left: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: margin-left 0.25s ease;
}

.dashboard-panel {
  width: 100%;
  max-width: 920px;
  padding: 1.5rem;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(10, 20, 16, 0.95) 0%, rgba(6, 11, 15, 0.95) 100%);
  border: 1px solid rgba(46, 125, 91, 0.25);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.dashboard-header {
  margin-bottom: 1.25rem;
  text-align: center;
}

.dashboard-header h1 {
  margin: 0 0 0.45rem;
  font-size: 2rem;
  color: #dcefe4;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
  animation: fadeInDown 0.7s ease both;
}

.dashboard-header p {
  margin: 0;
  color: rgba(230, 255, 242, 0.78);
  line-height: 1.7;
}

.widget-hoy {
  width: 100%;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 125, 91, 0.15), rgba(11, 95, 255, 0.1));
  border: 1px solid rgba(46, 125, 91, 0.25);
}

.widget-hoy h3 {
  margin: 0 0 0.6rem;
  color: #d7f5e6;
  font-size: 1.05rem;
}

.hoy-vacio {
  color: rgba(230, 255, 242, 0.6);
  font-size: 0.9rem;
}

.lista-hoy {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.clase-hoy {
  font-size: 0.9rem;
  color: rgba(230, 255, 242, 0.85);
}

.clase-hoy strong {
  color: #a8e6c9;
}
.resumen-materias {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.materia-card {
  background: linear-gradient(135deg, rgba(11, 95, 255, 0.14), rgba(46, 125, 91, 0.08));
  padding: 0.9rem 1rem;
  border-radius: 12px;
  text-align: left;
  color: #e6f0ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(46, 125, 91, 0.18);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  animation: fadeInUp 0.6s ease both;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.resumen-materias .materia-card:nth-child(2) {
  animation-delay: 0.08s;
}

.resumen-materias .materia-card:nth-child(3) {
  animation-delay: 0.16s;
}

.materia-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
}

.materia-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.docente {
  margin: 0;
  color: rgba(230, 240, 255, 0.8);
  font-size: 0.95rem;
}

.materia-card small {
  color: rgba(230, 240, 255, 0.6);
}

.meta-info {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.mensaje-exito {
  color: #7ee6a8;
  font-weight: 600;
}

.mensaje-fallo {
  color: #ff8a8a;
  font-weight: 600;
}

.mensaje-progreso {
  color: rgba(230, 240, 255, 0.7);
}

.promedio-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 86px;
  background: linear-gradient(135deg, #2d78c8, #5e9971);
  color: white;
  padding: 0.5rem 0.7rem;
  border-radius: 999px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(11, 95, 255, 0.2);
}

.promedio-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

.promedio-valor {
  font-size: 1rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .user-bar {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .user-info {
    justify-content: center;
  }

  .home-content {
    padding-top: 9.5rem;
    margin-left: 0;
  }

  .dashboard-panel {
    padding: 1.25rem;
  }
}
</style>
