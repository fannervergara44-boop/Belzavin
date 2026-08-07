import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTourStore = defineStore("tour", () => {
  // Cada paso: en qué ruta debe estar el usuario, qué elemento resaltar
  // (vía atributo data-tour="..."), y el texto explicativo.
  const pasos = [
    {
      ruta: "home",
      selector: '[data-tour="nav-home"]',
      titulo: "¡Bienvenido a Belzavin!",
      texto: "Este es el menú principal — desde acá navegas a todas las secciones de la app.",
    },
    {
      ruta: "home",
      selector: '[data-tour="home-promedio"]',
      titulo: "Tu promedio general",
      texto: "Acá ves tu promedio ponderado con todas tus materias, actualizado en tiempo real.",
    },
    {
      ruta: "home",
      selector: '[data-tour="home-materias-lista"]',
      titulo: "Tus materias",
      texto: "Cada materia muestra tu progreso frente a la meta que te propusiste para ella.",
    },
    {
      ruta: "materias",
      selector: '[data-tour="nav-materias"]',
      titulo: "Mis materias",
      texto: "Acá vas a registrar cada materia: nombre, docente, meta, créditos y horario.",
    },
    {
      ruta: "materias",
      selector: '[data-tour="materias-form"]',
      titulo: "Registra tus materias",
      texto:
        "Agrega nombre, docente, meta, créditos y horario — se conecta automáticamente con el resto de la app.",
    },
    {
      ruta: "notas",
      selector: '[data-tour="nav-notas"]',
      titulo: "Notas",
      texto:
        "Un espacio para apuntes libres y recordatorios rápidos, sin estructura de calificación.",
    },
    {
      ruta: "notas",
      selector: '[data-tour="notas-form"]',
      titulo: "Notas de texto",
      texto: "Usa esta sección para apuntes libres, recordatorios o resúmenes de clase.",
    },
    {
      ruta: "horario",
      selector: '[data-tour="nav-horario"]',
      titulo: "Horario",
      texto:
        "Tu semana completa de clases, armada automáticamente con los horarios de tus materias.",
    },
    {
      ruta: "horario",
      selector: '[data-tour="horario-grilla"]',
      titulo: "Tu horario semanal",
      texto: "Cada materia con horario aparece acá automáticamente, organizada por día y hora.",
    },
    {
      ruta: "calificaciones",
      selector: '[data-tour="nav-calificaciones"]',
      titulo: "Calificaciones",
      texto: "Acá registras las notas de cada corte, materia por materia.",
    },
    {
      ruta: "calificaciones",
      selector: '[data-tour="calificaciones-materias"]',
      titulo: "Registrar calificaciones",
      texto: "Elige una materia, después el corte, y registra tus notas con su porcentaje.",
    },
    {
      ruta: "evolucion",
      selector: '[data-tour="nav-evolucion"]',
      titulo: "Evolución",
      texto: "Gráficas de cómo cambia tu promedio con el tiempo, en general y por materia.",
    },
    {
      ruta: "evolucion",
      selector: '[data-tour="evolucion-general"]',
      titulo: "Evolución académica",
      texto: "Visualiza cómo cambia tu promedio con el tiempo, y nota por nota en cada materia.",
    },
    {
      ruta: "perfil",
      selector: '[data-tour="nav-perfil"]',
      titulo: "Perfil",
      texto: "Tu información personal, tu ranking y tu historial académico completo.",
    },
    {
      ruta: "perfil",
      selector: '[data-tour="perfil-card"]',
      titulo: "Tu perfil",
      texto: "Edita tu nombre y consulta tus estadísticas generales.",
    },
    {
      ruta: "perfil",
      selector: '[data-tour="perfil-ranking"]',
      titulo: "Ranking por promedio",
      texto: "Tus 3 materias con mejor promedio, para que veas dónde te está yendo mejor.",
    },
    {
      ruta: "perfil",
      selector: '[data-tour="perfil-historial"]',
      titulo: "Historial académico",
      texto: "Expande cada materia para ver el detalle de tus notas por corte.",
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
