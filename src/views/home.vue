<template>
  <div class="home">
    <div
      v-if="mostrarBienvenida"
      class="bienvenida-overlay"
      @click.self="mostrarBienvenida = false"
    >
      <div
        class="bienvenida-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bienvenida-titulo"
      >
        <h2 id="bienvenida-titulo">
          ¡Bienvenido a Belzavin, {{ authStore.usuario?.displayName }}!
        </h2>
        <p>
          Acá vas a poder llevar tus materias, notas, horario y promedios en un solo lugar. Empezá
          creando tu primera materia desde el menú.
        </p>
        <button @click="irAMateriasDesdeBienvenida">Empezar</button>
      </div>
    </div>

    <header class="top-bar">
      <img :src="logo" alt="Logo Belzavin" class="logo-top-bar" />

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

          <div v-if="claseActual" class="clase-en-curso">
            <span class="pulso" aria-hidden="true"></span>
            <p>
              Ahora mismo tienes clase de <strong>{{ claseActual.nombre }}</strong> (hasta las
              {{ claseActual.horario.horaFin }})
            </p>
          </div>

          <div v-else-if="claseRecienTerminada" class="clase-terminada">
            <p>
              Terminó tu clase de <strong>{{ claseRecienTerminada.nombre }}</strong> 👋
            </p>
          </div>

          <div v-if="proximasClasesHoy.length > 0" class="proximas-hoy">
            <p class="proximas-titulo">
              {{ claseActual ? "Después tienes:" : "Más tarde hoy:" }}
            </p>
            <div v-for="materia in proximasClasesHoy" :key="materia.id" class="clase-proxima">
              <strong>{{ materia.nombre }}</strong> a las {{ materia.horario.horaInicio }}
            </div>
          </div>

          <div
            v-else-if="!claseActual && !claseRecienTerminada && clasesDeHoy.length === 0"
            class="hoy-vacio"
          >
            No tienes clases programadas hoy
          </div>

          <div
            v-else-if="!claseActual && !claseRecienTerminada && clasesDeHoy.length > 0"
            class="hoy-vacio"
          >
            Ya terminaron todas tus clases de hoy
          </div>
        </div>

        <div class="resumen-materias">
          <button
            v-for="materia in materiasStore.materiasConPromedio"
            :key="materia.id"
            type="button"
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
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { signOut } from "firebase/auth";
import { auth } from "../service/firebase";
import { useMateriasStore } from "../stores/materias";
import Titulo from "@/components/titulo.vue";
import Swal from "sweetalert2";
import logo from "@/assets/logo.png";

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
    .sort((a, b) => (a.horario?.horaInicio || "").localeCompare(b.horario?.horaInicio || "")),
);

// --- Reloj reactivo: hora actual en formato "HH:MM", se actualiza sola ---
function obtenerHoraActual() {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
}

// Convierte "HH:MM" (con o sin cero adelante) a minutos desde medianoche.
// Comparar horas como strings es frágil ("09:05" <= "9:00" da true por ser
// comparación de caracteres), así que todo pasa a número antes de comparar.
function horaAMinutos(horaStr) {
  if (!horaStr) return null;
  const [h, m] = horaStr.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

const horaActual = ref(obtenerHoraActual());
const minutosActuales = computed(() => horaAMinutos(horaActual.value));
let intervaloReloj = null;

// Materia que está en curso justo ahora (si hay alguna).
const claseActual = computed(() =>
  clasesDeHoy.value.find((m) => {
    const inicio = horaAMinutos(m.horario?.horaInicio);
    const fin = horaAMinutos(m.horario?.horaFin);
    if (inicio === null || fin === null) return false;
    return minutosActuales.value >= inicio && minutosActuales.value <= fin;
  }),
);

// Materias de hoy que todavía no han empezado
const proximasClasesHoy = computed(() =>
  clasesDeHoy.value.filter((m) => {
    const inicio = horaAMinutos(m.horario?.horaInicio);
    return inicio !== null && inicio > minutosActuales.value;
  }),
);

// Mensaje temporal: se llena justo cuando una clase termina, y se borra sola después
const claseRecienTerminada = ref(null);
let timeoutMensaje = null;

watch(claseActual, (nuevaClase, claseAnterior) => {
  if (!nuevaClase && claseAnterior) {
    claseRecienTerminada.value = claseAnterior;

    clearTimeout(timeoutMensaje);
    timeoutMensaje = setTimeout(() => {
      claseRecienTerminada.value = null;
    }, 10000); // el mensaje dura 10 segundos
  }
});

const mostrarBienvenida = ref(false);
const irAMateriasDesdeBienvenida = () => {
  mostrarBienvenida.value = false;
  router.push({ name: "materias" });
};

onMounted(() => {
  const usuario = authStore.usuario;
  if (usuario) {
    const esRegistroNuevo = usuario.metadata?.creationTime === usuario.metadata?.lastSignInTime;
    const yaVioBienvenida = localStorage.getItem(`bienvenida_vista_${usuario.uid}`);

    if (esRegistroNuevo && !yaVioBienvenida) {
      mostrarBienvenida.value = true;
      localStorage.setItem(`bienvenida_vista_${usuario.uid}`, "true");
    }
  }

  intervaloReloj = setInterval(() => {
    horaActual.value = obtenerHoraActual();
  }, 15000); // revisa cada 15 segundos
});

onUnmounted(() => {
  clearInterval(intervaloReloj);
  clearTimeout(timeoutMensaje);
});
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

@keyframes pulsoLive {
  0% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(22, 163, 74, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
  }
}

.home {
  /* --- Tokens: estilo belzavin --- */
  --color-bg: var(--color-background);
  --color-surface: var(--color-surface);
  --color-border: var(--color-border);
  --color-border-soft: var(--color-border);
  --color-input-bg: var(--color-surface-soft);

  --color-brand-blue: var(--color-accent-strong);
  --color-brand-blue-hover: var(--color-button-hover);
  --color-brand-blue-soft: var(--color-accent-soft);

  --color-text: var(--color-text);
  --color-text-muted: var(--color-text-muted);
  --color-text-faint: #8da3c2;

  --color-live: #22c55e;
  --color-live-soft: rgba(34, 197, 94, 0.16);
  --color-live-border: rgba(34, 197, 94, 0.35);
  --color-danger: #ef4444;

  --radius-lg: 20px;
  --radius-md: 12px;
  --radius-sm: 10px;

  --shadow-card: 0 20px 50px rgba(15, 27, 45, 0.08);
  --shadow-card-sm: 0 8px 20px rgba(15, 27, 45, 0.06);

  --top-bar-height: 7.5rem;

  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.bienvenida-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 27, 45, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1.5rem;
}

.bienvenida-modal {
  max-width: 420px;
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  color: var(--color-text);
  box-shadow: var(--shadow-card);
  animation: fadeInUp 0.4s ease both;
}

.bienvenida-modal h2 {
  margin: 0 0 1rem;
  color: var(--color-text);
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.bienvenida-modal p {
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.bienvenida-modal button {
  padding: 0.75rem 1.5rem;
  background: var(--color-brand-blue);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.bienvenida-modal button:hover {
  background: var(--color-brand-blue-hover);
}

.top-bar {
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(3, 7, 13, 0.92);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.5rem;
}

.logo-top-bar {
  height: 60px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.user-bar {
  flex: 1;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
}

.user-bar-empty {
  justify-content: center;
  padding: 0.4rem 0;
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
  border: 2px solid var(--color-border);
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-meta h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
}

.user-meta .email {
  margin: 0;
  color: var(--color-text-faint);
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
  background: var(--color-accent-soft);
  border: 1px solid var(--color-border);
  min-width: 118px;
}

.promedio-general-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-link);
}

.promedio-general-valor {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1rem;
  background: var(--color-button);
  color: white;
  border: 1px solid var(--color-button);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: 0.2s ease;
}

.logout-btn:hover {
  background: var(--color-button-hover);
  border-color: var(--color-button-hover);
  box-shadow: var(--shadow-card-sm);
}

.logout-btn:active {
  transform: scale(0.97);
}

.home-content {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 7.5rem 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-panel {
  width: 100%;
  max-width: 920px;
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(18, 28, 42, 0.98) 0%, rgba(10, 16, 24, 0.98) 100%);
  border: 1px solid rgba(63, 140, 255, 0.28);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.42);
  animation: fadeInUp 0.6s ease both;
}

.dashboard-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.dashboard-header :deep(h1) {
  margin: 0 0 0.45rem;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-text);
  animation: fadeInDown 0.7s ease both;
}

.dashboard-header :deep(p) {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.widget-hoy {
  width: 100%;
  margin-bottom: 1.5rem;
  padding: 1.1rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--color-accent-soft);
  border: 1px solid var(--color-border);
}

.widget-hoy h3 {
  margin: 0 0 0.6rem;
  color: var(--color-text);
  font-size: 1.05rem;
  font-weight: 700;
}

.hoy-vacio {
  color: var(--color-text-faint);
  font-size: 0.9rem;
}

.clase-en-curso {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--color-live-soft);
  border: 1px solid var(--color-live-border);
}

.clase-en-curso p {
  margin: 0;
  font-size: 0.92rem;
  color: var(--color-text);
}

.clase-en-curso strong {
  color: var(--color-live);
}

.pulso {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-live);
  animation: pulsoLive 1.6s infinite;
}

.clase-terminada {
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border-soft);
}

.clase-terminada p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.clase-terminada strong {
  color: var(--color-text);
}

.proximas-hoy {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border-soft);
}

.proximas-titulo {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-faint);
}

.clase-proxima {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin-bottom: 0.3rem;
}

.clase-proxima strong {
  color: var(--color-text);
}

.resumen-materias {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.materia-card {
  appearance: none;
  font: inherit;
  background: linear-gradient(135deg, rgba(28, 39, 58, 0.95) 0%, rgba(14, 21, 33, 0.95) 100%);
  padding: 1rem 1.1rem;
  border-radius: var(--radius-md);
  text-align: left;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  border: 1px solid rgba(63, 140, 255, 0.24);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  cursor: pointer;
  animation: fadeInUp 0.5s ease both;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.resumen-materias .materia-card:nth-child(2) {
  animation-delay: 0.06s;
}

.resumen-materias .materia-card:nth-child(3) {
  animation-delay: 0.12s;
}

.materia-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 27, 45, 0.1);
  border-color: var(--color-border-hover);
}

.materia-card:focus-visible {
  outline: 2px solid var(--color-brand-blue);
  outline-offset: 2px;
}

.materia-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.materia-info strong {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.docente {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.materia-card small {
  color: var(--color-text-faint);
}

.meta-info {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.mensaje-exito {
  color: var(--color-live);
  font-weight: 600;
}

.mensaje-fallo {
  color: var(--color-danger);
  font-weight: 600;
}

.mensaje-progreso {
  color: var(--color-text-muted);
}

.promedio-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 86px;
  background: var(--color-brand-blue);
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

@media (prefers-reduced-motion: reduce) {
  .bienvenida-modal,
  .dashboard-panel,
  .dashboard-header :deep(h1),
  .materia-card,
  .pulso {
    animation: none !important;
  }

  .materia-card:hover,
  .logout-btn:hover,
  .bienvenida-modal button:hover {
    transform: none;
  }
}

@media (max-width: 768px) {
  .top-bar {
    padding: 0.5rem 1rem;
  }

  .logo-top-bar {
    height: 44px;
  }

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
  }

  .dashboard-panel {
    padding: 1.25rem;
  }

  .materia-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .promedio-badge {
    align-self: flex-end;
  }
}
</style>
