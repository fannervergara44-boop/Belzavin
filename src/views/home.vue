<template>
  <div class="dashboard">
    <Sidebar />

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
          Acá vas a poder llevar tus materias, notas, horario y promedios en un solo lugar. Empieza
          creando tu primera materia.
        </p>
        <button type="button" @click="irAMateriasDesdeBienvenida">Empezar</button>
      </div>
    </div>

    <main class="dashboard-main">
      <header class="dashboard-topbar">
        <div class="saludo">
          <h1>Hola, {{ primerNombre }}</h1>
          <p class="saludo-motivacional">{{ mensajeMotivacional }}</p>
        </div>

        <div class="topbar-acciones">
          <div v-if="authStore.usuario" class="usuario-chip">
            <img
              v-if="authStore.usuario.photoURL"
              :src="authStore.usuario.photoURL"
              alt="Foto de perfil"
              class="usuario-chip-avatar"
            />
            <div v-else class="usuario-chip-avatar usuario-chip-avatar--inicial">
              {{ inicialUsuario }}
            </div>

            <div class="usuario-chip-meta">
              <span class="usuario-chip-nombre">{{ primerNombre }}</span>
              <span class="usuario-chip-email">{{ authStore.usuario.email }}</span>
            </div>

            <button
              type="button"
              class="usuario-chip-logout"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              @click="cerrarSesion"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div v-if="claseActual" class="clase-en-vivo">
        <span class="clase-en-vivo-punto"></span>
        <p>
          Ahora mismo tienes clase de
          <strong>{{ claseActual.nombre }}</strong>
          (hasta las {{ claseActual.horario.horaFin }})
        </p>
      </div>

      <section class="kpi-row">
        <div
          class="kpi-card kpi-card--promedio"
          :class="{ 'kpi-card--promedio-centrado': !pathAreaGeneral }"
        >
          <span class="kpi-label">Promedio general</span>
          <div class="kpi-promedio-valor-fila">
            <span class="kpi-promedio-valor">{{
              materiasStore.promedioGeneral !== null
                ? materiasStore.promedioGeneral.toFixed(1)
                : "—"
            }}</span>
            <span class="kpi-badge" :class="`kpi-badge--${badgePromedioGeneral.color}`">{{
              badgePromedioGeneral.texto
            }}</span>
          </div>

          <svg
            v-if="pathAreaGeneral"
            class="kpi-sparkline-grande"
            viewBox="0 0 480 110"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gradientePromedioGeneral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--color-accent-strong)" stop-opacity="0.35" />
                <stop offset="100%" stop-color="var(--color-accent-strong)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="pathAreaGeneral" fill="url(#gradientePromedioGeneral)" stroke="none" />
            <path
              :d="pathLineaGeneral"
              fill="none"
              stroke="var(--color-accent-strong)"
              stroke-width="2"
            />
          </svg>
          <p v-else-if="materiasStore.promedioGeneral === null" class="kpi-sparkline-vacio">
            Aún no hay histórico suficiente. Se irá completando con cada nota que registres.
          </p>
        </div>

        <div class="kpi-card">
          <span class="kpi-icono" :class="`kpi-icono--${colorProximaClase}`">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
              <path d="M8 2v6" />
              <path d="M16 2v6" />
            </svg>
          </span>
          <span class="kpi-label">Próxima clase</span>
          <span class="kpi-valor" :class="`kpi-valor--${colorProximaClase}`">{{
            proximaClaseTitulo
          }}</span>
          <span class="kpi-detalle"><span class="kpi-punto"></span>{{ proximaClaseDetalle }}</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-icono kpi-icono--info">
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
          <span class="kpi-label">Materias</span>
          <span class="kpi-valor">{{ materiasStore.materias.length }}</span>
          <span class="kpi-detalle">registradas</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-icono kpi-icono--info">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
            </svg>
          </span>
          <span class="kpi-label">Créditos</span>
          <span class="kpi-valor">{{ creditosRegistrados }}</span>
          <span class="kpi-detalle">registrados</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-icono" :class="`kpi-icono--${estadoAcademico.color}`">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M12 2 14.5 8.5 21 9.3l-5 4.6 1.3 6.6L12 17.6 6.7 20.5 8 13.9 3 9.3l6.5-.8Z"
              />
            </svg>
          </span>
          <span class="kpi-label">Estado académico</span>
          <span class="kpi-valor" :class="`kpi-valor--${estadoAcademico.color}`">{{
            estadoAcademico.titulo
          }}</span>
          <span class="kpi-detalle"
            ><span class="kpi-punto"></span>{{ estadoAcademico.detalle }}</span
          >
        </div>
      </section>

      <section class="materias-section">
        <h2>Mis materias</h2>

        <div v-if="materiasStore.materiasConPromedio.length === 0" class="materias-vacio">
          <p>Aún no has registrado materias.</p>
          <RouterLink :to="{ name: 'materias' }" class="link-materias"
            >Registrar mi primera materia →</RouterLink
          >
        </div>

        <div v-else class="materias-lista">
          <button
            v-for="materia in materiasStore.materiasConPromedio"
            :key="materia.id"
            type="button"
            class="materia-fila"
            :aria-label="`Ver notas de ${materia.nombre}`"
            :title="`Ver notas de ${materia.nombre}`"
            @click="irANotas(materia.id)"
          >
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
                {{
                  materia.horario?.dia
                    ? `${materia.horario.dia} ${materia.horario.horaInicio} - ${materia.horario.horaFin}`
                    : "Horario no registrado"
                }}
              </small>
            </div>

            <div class="materia-meta">
              <span class="meta-icono" :class="`meta-icono--${colorPromedio(materia)}`">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M12 2 14.5 8.5 21 9.3l-5 4.6 1.3 6.6L12 17.6 6.7 20.5 8 13.9 3 9.3l6.5-.8Z"
                  />
                </svg>
              </span>
              <div class="meta-texto">
                <span class="meta-titulo">Meta {{ materia.meta }}</span>
                <template v-if="!materia.tieneNotas">
                  <p class="mensaje-progreso">Aún no registras notas para esta materia.</p>
                </template>
                <template v-else-if="materia.completa">
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

            <div class="materia-promedio-bloque">
              <div class="materia-promedio-numeros">
                <span class="promedio-label">Promedio</span>
                <span class="promedio-valor" :class="`promedio-valor--${colorPromedio(materia)}`">{{
                  materia.tieneNotas ? materia.promedio.toFixed(1) : "—"
                }}</span>
              </div>

              <svg
                v-if="materiasStore.historialValoresDeMateria(materia.id).length > 1"
                class="materia-sparkline"
                viewBox="0 0 120 40"
                preserveAspectRatio="none"
              >
                <path
                  :d="crearPathLinea(materiasStore.historialValoresDeMateria(materia.id), 120, 40)"
                  fill="none"
                  :class="`sparkline-linea--${colorPromedio(materia)}`"
                  stroke-width="2"
                />
              </svg>
            </div>
          </button>
        </div>
      </section>

      <div v-if="mostrarConsejo" class="consejo-banner">
        <span class="consejo-icono" aria-hidden="true"></span>
        <p><strong>Consejo del día:</strong> {{ consejoActual }}</p>
        <button
          type="button"
          class="consejo-cerrar"
          aria-label="Cerrar consejo"
          @click="mostrarConsejo = false"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useMateriasStore } from "../stores/materias";
import Sidebar from "@/layout/Sidebar.vue";
import { signOut } from "firebase/auth";
import { auth } from "../service/firebase";
import Swal from "sweetalert2";
import "@/assets/base.css";

const authStore = useAuthStore();
const router = useRouter();
const materiasStore = useMateriasStore();

const irANotas = (materiaId) => {
  router.push({ name: "notas_materia", params: { materiaId } });
};

const inicialUsuario = computed(() => {
  const nombre = authStore.usuario?.displayName || "";
  return nombre.charAt(0).toUpperCase() || "U";
});

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

// Color del badge/borde: puramente por valor numérico del promedio,
// independiente de si el estudiante cumplió su meta personal o no.
function colorPromedio(materia) {
  if (!materia.tieneNotas) return "vacio";
  const p = materia.promedio;
  if (p >= 4.0) return "exito";
  if (p >= 3.5) return "info";
  if (p >= 3.0) return "advertencia";
  return "riesgo";
}

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const diaHoy = computed(() => diasSemana[new Date().getDay()]);

const primerNombre = computed(() => {
  const nombre = authStore.usuario?.displayName || "";
  return nombre.split(" ")[0] || "Usuario";
});

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
function horaAMinutos(horaStr) {
  if (!horaStr) return null;
  const [h, m] = horaStr.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

const horaActual = ref(obtenerHoraActual());
const minutosActuales = computed(() => horaAMinutos(horaActual.value));
let intervaloReloj = null;

const claseActual = computed(() =>
  clasesDeHoy.value.find((m) => {
    const inicio = horaAMinutos(m.horario?.horaInicio);
    const fin = horaAMinutos(m.horario?.horaFin);
    if (inicio === null || fin === null) return false;
    return minutosActuales.value >= inicio && minutosActuales.value <= fin;
  }),
);

const proximasClasesHoy = computed(() =>
  clasesDeHoy.value.filter((m) => {
    const inicio = horaAMinutos(m.horario?.horaInicio);
    return inicio !== null && inicio > minutosActuales.value;
  }),
);

// Título corto para la tarjeta KPI de próxima clase
const proximaClaseTitulo = computed(() => {
  if (claseActual.value) return claseActual.value.nombre;
  if (proximasClasesHoy.value.length > 0) return proximasClasesHoy.value[0].nombre;
  return `Hoy, ${diaHoy.value}`;
});

const proximaClaseDetalle = computed(() => {
  if (claseActual.value) return `En curso hasta las ${claseActual.value.horario.horaFin}`;
  if (proximasClasesHoy.value.length > 0) {
    return `A las ${proximasClasesHoy.value[0].horario.horaInicio}`;
  }
  return "Sin clases pendientes";
});

// Color de la tarjeta "Próxima clase": verde cuando hay una clase en curso ahora mismo
const colorProximaClase = computed(() => (claseActual.value ? "exito" : "info"));

// Estado académico resumido: cuántas materias con notas están en meta
const materiasConNotas = computed(() =>
  materiasStore.materiasConPromedio.filter((m) => m.tieneNotas),
);

const estadoAcademico = computed(() => {
  const total = materiasConNotas.value.length;
  if (total === 0) {
    return { titulo: "Sin notas", detalle: "Aún no registras notas", color: "vacio" };
  }
  const enMeta = materiasConNotas.value.filter((m) => m.promedio >= m.meta).length;
  const detalle = `${enMeta} de ${total} materias`;
  if (enMeta === total) return { titulo: "En meta", detalle, color: "exito" };
  if (enMeta > 0) return { titulo: "Cerca de la meta", detalle, color: "advertencia" };
  return { titulo: "Por mejorar", detalle, color: "riesgo" };
});

// Mensaje motivacional corto, basado en el promedio general
const mensajeMotivacional = computed(() => {
  const promedio = materiasStore.promedioGeneral;
  if (promedio === null) return "Registra tus primeras notas para ver tu progreso.";
  if (promedio >= 4.0) return "Vas excelente este semestre, sigue así.";
  if (promedio >= 3.5) return "Buen ritmo, estás cerca de tus metas.";
  if (promedio >= 3.0) return "Vas bien, un poco más de esfuerzo y llegas a tu meta.";
  return "Es momento de reforzar — todavía puedes mejorar esto.";
});

const badgePromedioGeneral = computed(() => {
  const p = materiasStore.promedioGeneral;
  if (p === null) return { texto: "Sin datos", color: "vacio" };
  if (p >= 4.0) return { texto: "Excelente", color: "exito" };
  if (p >= 3.5) return { texto: "Bien", color: "info" };
  if (p >= 3.0) return { texto: "Regular", color: "advertencia" };
  return { texto: "En riesgo", color: "riesgo" };
});

const creditosRegistrados = computed(() =>
  materiasStore.materias.reduce((acc, m) => acc + (m.creditos || 0), 0),
);

// --- Sparklines: convierten un array de promedios en un path SVG ---
function crearPathLinea(valores, ancho, alto, min = 0, max = 5) {
  if (!valores || valores.length === 0) return "";
  if (valores.length === 1) {
    const y = alto - ((valores[0] - min) / (max - min)) * alto;
    return `M0,${y.toFixed(1)} L${ancho},${y.toFixed(1)}`;
  }
  const paso = ancho / (valores.length - 1);
  return valores
    .map((v, i) => {
      const x = i * paso;
      const clamped = Math.min(Math.max(v, min), max);
      const y = alto - ((clamped - min) / (max - min)) * alto;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function crearPathArea(valores, ancho, alto, min = 0, max = 5) {
  const linea = crearPathLinea(valores, ancho, alto, min, max);
  if (!linea) return "";
  return `${linea} L${ancho},${alto} L0,${alto} Z`;
}

const pathLineaGeneral = computed(() =>
  crearPathLinea(materiasStore.historialValoresGeneral, 480, 110),
);
const pathAreaGeneral = computed(() => {
  // Con un solo punto no hay tendencia real que mostrar todavía.
  if (materiasStore.historialValoresGeneral.length < 2) return "";
  return crearPathArea(materiasStore.historialValoresGeneral, 480, 110);
});

// --- Consejo del día ---
const consejos = [
  "La consistencia es la clave del éxito. ¡Sigue así!",
  "Repasa tus apuntes 10 minutos antes de dormir, se fija mejor la memoria.",
  "Divide las tareas grandes en pasos pequeños, es más fácil empezar.",
  "Celebra tus pequeños logros académicos, cuentan tanto como los grandes.",
];
const consejoActual = ref(consejos[Math.floor(Math.random() * consejos.length)]);
const mostrarConsejo = ref(true);

//--bienvenida de primer inicio de la pagina --//
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
  }, 15000);
});

onUnmounted(() => {
  clearInterval(intervaloReloj);
});
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

.dashboard {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-body, var(--color-text));
}

.dashboard-main {
  margin-left: var(--sidebar-width, 236px);
  padding: 2rem clamp(1.5rem, 3vw, 3rem) 3rem;
}

.bienvenida-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 20;
  padding: 1.5rem;
}

.bienvenida-modal {
  width: min(600px, 100%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.4);
  animation: fadeInUp 0.32s ease;
}

.bienvenida-modal h2 {
  margin: 0 0 0.8rem;
  font-size: 1.8rem;
  line-height: 1.2;
  color: var(--color-heading);
}

.bienvenida-modal p {
  margin: 0 0 1.5rem;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.bienvenida-modal button {
  border: none;
  border-radius: 999px;
  padding: 0.95rem 1.6rem;
  background: var(--color-button);
  color: white;
  font-weight: 700;
  cursor: pointer;
  font: inherit;
  transition:
    background 200ms ease,
    transform 200ms ease;
}

.bienvenida-modal button:hover {
  background: var(--color-button-hover);
  transform: translateY(-1px);
}

/* ---------- Topbar ---------- */
.dashboard-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
}

.saludo h1 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.saludo-motivacional {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

.topbar-acciones {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-shrink: 0;
}

.usuario-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.4rem 0.5rem 0.4rem 0.4rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.usuario-chip-avatar {
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.usuario-chip-avatar--inicial {
  display: grid;
  place-items: center;
  background: var(--color-accent-strong, var(--color-button));
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
}

.usuario-chip-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.usuario-chip-nombre {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 9rem;
}

.usuario-chip-email {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 9rem;
}

.usuario-chip-logout {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.usuario-chip-logout svg {
  width: 1.05rem;
  height: 1.05rem;
}

.usuario-chip-logout:hover {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger, #ef4444);
}

/* ---------- Clase en vivo ---------- */
.clase-en-vivo {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  background: #0f2e29;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.32s ease;
}

.clase-en-vivo-punto {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  animation: clasePulso 1.8s infinite;
}

@keyframes clasePulso {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.clase-en-vivo p {
  margin: 0;
  font-size: 0.88rem;
  color: #d7e7e2;
}

.clase-en-vivo strong {
  color: #4ade80;
  font-weight: 700;
}

/* ---------- KPI row ---------- */
.kpi-row {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.35rem 1.5rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14);
  animation: fadeInUp 0.32s ease;
}

.kpi-card--promedio {
  justify-content: space-between;
}

.kpi-card--promedio-centrado {
  justify-content: center;
  gap: 0.85rem;
  flex-grow: 1;
}

.kpi-label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.kpi-promedio-valor-fila {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.kpi-promedio-valor {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-accent-strong);
  line-height: 1;
}

.kpi-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
}

.kpi-badge--exito {
  background: rgba(34, 197, 94, 0.14);
  color: var(--color-success);
}
.kpi-badge--info {
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}
.kpi-badge--advertencia {
  background: rgba(245, 158, 11, 0.14);
  color: var(--color-warning);
}
.kpi-badge--riesgo {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}
.kpi-badge--vacio {
  background: rgba(148, 163, 184, 0.14);
  color: var(--color-text-muted);
}

.kpi-sparkline-grande {
  width: 100%;
  height: 5.5rem;
  margin-top: 0.25rem;
}

.kpi-sparkline-vacio {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--color-text-muted);
}

.kpi-icono {
  display: grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 10px;
  margin-bottom: 0.2rem;
}

.kpi-icono svg {
  width: 1.15rem;
  height: 1.15rem;
}

.kpi-icono--info {
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}
.kpi-icono--exito {
  background: rgba(34, 197, 94, 0.14);
  color: var(--color-success);
}
.kpi-icono--advertencia {
  background: rgba(245, 158, 11, 0.14);
  color: var(--color-warning);
}
.kpi-icono--riesgo {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}
.kpi-icono--vacio {
  background: rgba(148, 163, 184, 0.14);
  color: var(--color-text-muted);
}

.kpi-valor {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-heading);
}

.kpi-valor--exito {
  color: var(--color-success);
}
.kpi-valor--advertencia {
  color: var(--color-warning);
}
.kpi-valor--riesgo {
  color: var(--color-danger);
}
.kpi-valor--vacio {
  color: var(--color-text-muted);
}

.kpi-detalle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.kpi-punto {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: var(--color-text-muted);
  flex-shrink: 0;
}

/* ---------- Materias ---------- */
.materias-section h2 {
  margin: 0 0 1.1rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-heading);
}

.materias-vacio {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.6rem 1.75rem;
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
  min-height: 98px;
}

.materias-vacio p {
  margin: 0;
  line-height: 1.7;
}

.link-materias {
  display: inline-flex;
  margin-top: 1rem;
  color: var(--color-link);
  font-weight: 700;
  text-decoration: none;
  transition: color 200ms ease;
}

.link-materias:hover {
  color: var(--color-accent-strong);
  text-decoration: underline;
}

.materias-lista {
  display: grid;
  gap: 0.9rem;
}

.materia-fila {
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1.3fr) minmax(0, 1.6fr) auto;
  align-items: center;
  gap: 1.35rem;
  padding: 1.1rem 1.4rem;
  text-align: left;
  background: var(--color-surface);
  color: var(--color-text-body, var(--color-text));
  border: 1px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  transition:
    transform 200ms ease,
    box-shadow 200ms ease;
  font: inherit;
}

.materia-fila:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
}

.materia-fila:focus-visible {
  outline: 2px solid var(--color-accent-strong);
  outline-offset: 3px;
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

.materia-meta {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  min-width: 0;
}

.meta-icono {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.meta-icono svg {
  width: 0.95rem;
  height: 0.95rem;
}

.meta-icono--exito {
  background: rgba(34, 197, 94, 0.14);
  color: var(--color-success);
}
.meta-icono--info {
  background: rgba(56, 189, 248, 0.14);
  color: var(--color-info, var(--color-accent-strong));
}
.meta-icono--advertencia {
  background: rgba(245, 158, 11, 0.14);
  color: var(--color-warning);
}
.meta-icono--riesgo {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}
.meta-icono--vacio {
  background: rgba(148, 163, 184, 0.14);
  color: var(--color-text-muted);
}

.meta-texto {
  min-width: 0;
}

.meta-titulo {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.15rem;
}

.mensaje-progreso,
.mensaje-exito,
.mensaje-fallo {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
}

.mensaje-progreso {
  color: var(--color-warning);
}
.mensaje-exito {
  color: var(--color-success);
}
.mensaje-fallo {
  color: var(--color-danger);
}

.materia-promedio-bloque {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-self: end;
}

.materia-promedio-numeros {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.promedio-label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.promedio-valor {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-heading);
  padding: 0.2rem 0.65rem;
  border-radius: 8px;
}

.promedio-valor--exito {
  background: rgba(34, 197, 94, 0.18);
  color: var(--color-success);
}
.promedio-valor--info {
  background: rgba(56, 189, 248, 0.18);
  color: var(--color-info, var(--color-accent-strong));
}
.promedio-valor--advertencia {
  background: rgba(245, 158, 11, 0.18);
  color: var(--color-warning);
}
.promedio-valor--riesgo {
  background: rgba(239, 68, 68, 0.18);
  color: var(--color-danger);
}

.materia-sparkline {
  width: 5.5rem;
  height: 2.2rem;
  flex-shrink: 0;
}

.sparkline-linea--exito {
  stroke: var(--color-success);
}
.sparkline-linea--info {
  stroke: var(--color-info, var(--color-accent-strong));
}
.sparkline-linea--advertencia {
  stroke: var(--color-warning);
}
.sparkline-linea--riesgo {
  stroke: var(--color-danger);
}
.sparkline-linea--vacio {
  stroke: var(--color-text-muted);
}

/* ---------- Consejo del día ---------- */
.consejo-banner {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-top: 1.5rem;
  padding: 1rem 1.4rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
}

.consejo-icono {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.consejo-banner p {
  margin: 0;
  flex: 1;
  font-size: 0.88rem;
  color: var(--color-text-body, var(--color-text));
  line-height: 1.6;
}

.consejo-cerrar {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.consejo-cerrar svg {
  width: 0.95rem;
  height: 0.95rem;
}

.consejo-cerrar:hover {
  background: var(--color-accent-soft);
}

/* ---------- Responsive ---------- */
@media (max-width: 1200px) {
  .kpi-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .kpi-card--promedio {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .dashboard-main {
    margin-left: 0;
  }
}

@media (max-width: 720px) {
  .dashboard-main {
    padding: 1.25rem;
  }

  .kpi-row {
    grid-template-columns: 1fr 1fr;
  }

  .materia-fila {
    grid-template-columns: 1fr;
    row-gap: 0.85rem;
  }

  .materia-promedio-bloque {
    justify-self: start;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
