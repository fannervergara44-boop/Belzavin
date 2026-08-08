import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTourStore = defineStore("tour", () => {
  // Tour simplificado: solo recorre las opciones del menú lateral.
  // No requiere cambiar de ruta porque el sidebar es parte del layout
  // persistente (LayoutConSidebar.vue) y está visible en todas las páginas.
  const pasos = [
    {
      selector: '[data-tour="nav-home"]',
      titulo: "Inicio",
      texto: "Tu punto de partida: un resumen de tu día, tu promedio y tus materias.",
    },
    {
      selector: '[data-tour="nav-materias"]',
      titulo: "Mis materias",
      texto: "Registra cada materia: nombre, docente, meta, créditos y horario.",
    },
    {
      selector: '[data-tour="nav-notas"]',
      titulo: "Notas",
      texto: "Un espacio para apuntes libres y recordatorios rápidos.",
    },
    {
      selector: '[data-tour="nav-horario"]',
      titulo: "Horario",
      texto:
        "Tu semana completa de clases, armada automáticamente con los horarios de tus materias.",
    },
    {
      selector: '[data-tour="nav-calificaciones"]',
      titulo: "Calificaciones",
      texto: "Registra las notas de cada corte, materia por materia.",
    },
    {
      selector: '[data-tour="nav-evolucion"]',
      titulo: "Evolución",
      texto: "Gráficas de cómo cambia tu promedio con el tiempo, en general y por materia.",
    },
    {
      selector: '[data-tour="nav-perfil"]',
      titulo: "Perfil",
      texto: "Tu información personal, tu ranking y tu historial académico completo.",
    },
  ];

  const activo = ref(false);
  const pasoActual = ref(0);

  const total = pasos.length;
  const paso = computed(() => pasos[pasoActual.value] || null);
  const esPrimero = computed(() => pasoActual.value === 0);
  const esUltimo = computed(() => pasoActual.value === total - 1);

  function iniciar() {
    pasoActual.value = 0;
    activo.value = true;
  }

  function siguiente() {
    if (esUltimo.value) {
      finalizar();
      return;
    }
    pasoActual.value += 1;
  }

  function anterior() {
    if (!esPrimero.value) pasoActual.value -= 1;
  }

  function finalizar() {
    activo.value = false;
    pasoActual.value = 0;
  }

  return {
    pasos,
    activo,
    pasoActual,
    paso,
    total,
    esPrimero,
    esUltimo,
    iniciar,
    siguiente,
    anterior,
    finalizar,
  };
});
