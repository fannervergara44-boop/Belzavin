import { defineStore } from "pinia";
import { ref, reactive, computed, watch } from "vue";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { firestore } from "../service/firebase";
import { useAuthStore } from "../stores/auth";

export const useMateriasStore = defineStore("materias", () => {
  const authStore = useAuthStore();
  const materias = ref([]);
  const cargando = ref(true);

  // notasPorMateria[materiaId] = { corte1: [...notas], corte2: [...], corte3: [...] }
  const notasPorMateria = reactive({});

  // historialPorMateria[materiaId] = [{ id, promedio, fecha }, ...] ordenado por fecha asc
  const historialPorMateria = reactive({});
  // historialGeneral = [{ id, promedio, fecha }, ...] ordenado por fecha asc
  const historialGeneral = ref([]);

  function escucharMaterias(uid) {
    const materiasRef = collection(firestore, "usuarios", uid, "materias");

    onSnapshot(materiasRef, (snapshot) => {
      materias.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      cargando.value = false;

      // Por cada materia, escuchamos las notas de sus 3 cortes fijos
      materias.value.forEach((materia) => {
        if (!notasPorMateria[materia.id]) {
          notasPorMateria[materia.id] = { corte1: [], corte2: [], corte3: [] };
          escucharNotasDeMateria(uid, materia.id);
        }
        if (!historialPorMateria[materia.id]) {
          historialPorMateria[materia.id] = [];
          escucharHistorialDeMateria(uid, materia.id);
        }
      });
    });
  }

  function escucharNotasDeMateria(uid, materiaId) {
    ["corte1", "corte2", "corte3"].forEach((corteId) => {
      const notasRef = collection(
        firestore,
        "usuarios",
        uid,
        "materias",
        materiaId,
        "cortes",
        corteId,
        "notas",
      );

      onSnapshot(notasRef, (snapshot) => {
        notasPorMateria[materiaId][corteId] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    });
  }

  function escucharHistorialDeMateria(uid, materiaId) {
    const historialRef = query(
      collection(firestore, "usuarios", uid, "materias", materiaId, "historial"),
      orderBy("fecha", "asc"),
    );

    onSnapshot(historialRef, (snapshot) => {
      historialPorMateria[materiaId] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });
  }

  function escucharHistorialGeneral(uid) {
    const historialRef = query(
      collection(firestore, "usuarios", uid, "historialGeneral"),
      orderBy("fecha", "asc"),
    );

    onSnapshot(historialRef, (snapshot) => {
      historialGeneral.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });
  }

  watch(
    () => authStore.usuario,
    (usuario) => {
      if (usuario) {
        escucharMaterias(usuario.uid);
        escucharHistorialGeneral(usuario.uid);
      } else {
        materias.value = [];
        historialGeneral.value = [];
      }
    },
    { immediate: true },
  );

  // --- Cálculo de promedios ---

  const pesosCortes = { corte1: 0.33, corte2: 0.33, corte3: 0.34 };

  function promedioDeCorte(notas) {
    if (!notas || notas.length === 0) return 0;
    const totalPorcentaje = notas.reduce((suma, nota) => suma + Number(nota.porcentaje || 0), 0);
    if (totalPorcentaje === 0) return 0;
    return notas.reduce(
      (suma, nota) => suma + nota.valor * (Number(nota.porcentaje || 0) / 100),
      0,
    );
  }

  async function agregarNota(
    materiaId,
    corteId,
    { nombre, valor, porcentaje = 100, descripcion = "" },
  ) {
    const uid = authStore.usuario.uid;
    const notasRef = collection(
      firestore,
      "usuarios",
      uid,
      "materias",
      materiaId,
      "cortes",
      corteId,
      "notas",
    );

    // Esta es la operación crítica: si falla, sí queremos que el usuario
    // se entere (la nota realmente no se guardó).
    await addDoc(notasRef, {
      nombre,
      valor,
      porcentaje,
      descripcion,
      createdAt: new Date(),
    });

    // El registro del histórico es solo para la gráfica de evolución.
    // Si falla (permisos, red, lo que sea), la nota YA se guardó bien —
    // no queremos que esto haga ver la operación como fallida.
    try {
      await registrarHistorial(materiaId);
    } catch (error) {
      console.error("La nota se guardó, pero no se pudo actualizar el histórico:", error);
    }
  }

  // Guarda un snapshot del promedio actual de la materia (y del promedio
  // general) en Firestore, para poder graficar su evolución en el tiempo.
  // Se llama justo después de agregar una nota, cuando notasPorMateria ya
  // refleja el cambio localmente (Firestore aplica los writes de forma
  // optimista antes de que se resuelva el await de addDoc).
  async function registrarHistorial(materiaId) {
    const uid = authStore.usuario.uid;

    const historialMateriaRef = collection(
      firestore,
      "usuarios",
      uid,
      "materias",
      materiaId,
      "historial",
    );
    await addDoc(historialMateriaRef, {
      promedio: promedioDeMateria(materiaId),
      fecha: serverTimestamp(),
    });

    const promedioGen = promedioGeneral.value;
    if (promedioGen !== null) {
      const historialGeneralRef = collection(firestore, "usuarios", uid, "historialGeneral");
      await addDoc(historialGeneralRef, {
        promedio: promedioGen,
        fecha: serverTimestamp(),
      });
    }
  }

  function promedioDeMateria(materiaId) {
    const cortes = notasPorMateria[materiaId];
    if (!cortes) return 0;

    let total = 0;
    for (const corteId in pesosCortes) {
      const promCorte = promedioDeCorte(cortes[corteId]);
      total += promCorte * pesosCortes[corteId];
    }
    return total;
  }

  // Indica si la materia ya tiene al menos una nota registrada en cualquier
  // corte. Se usa para distinguir "promedio 0 porque no hay notas" de
  // "promedio 0 porque las notas realmente dieron 0".
  function tieneNotasMateria(materiaId) {
    const cortes = notasPorMateria[materiaId];
    if (!cortes) return false;
    return ["corte1", "corte2", "corte3"].some((corteId) => (cortes[corteId]?.length || 0) > 0);
  }

  const materiasConPromedio = computed(() =>
    materias.value.map((materia) => {
      const promedio = promedioDeMateria(materia.id);
      const tieneNotas = tieneNotasMateria(materia.id);
      return {
        ...materia,
        promedio,
        tieneNotas,
        completa: materiaCompleta(materia.id),
        diferenciaMeta: (materia.meta || 0) - promedio,
      };
    }),
  );

  const promedioGeneral = computed(() => {
    // Solo se ponderan las materias que ya tienen alguna nota registrada;
    // una materia vacía no debe arrastrar el promedio general hacia 0.
    const materiasConNotas = materiasConPromedio.value.filter((m) => m.tieneNotas);
    if (materiasConNotas.length === 0) return null;

    const sumaPonderada = materiasConNotas.reduce(
      (acc, m) => acc + m.promedio * (m.creditos || 0),
      0,
    );
    const totalCreditos = materiasConNotas.reduce((acc, m) => acc + (m.creditos || 0), 0);

    if (totalCreditos === 0) return null;
    return sumaPonderada / totalCreditos;
  });

  async function crearMateria({ nombre, docente, meta, creditos, horario }) {
    const uid = authStore.usuario.uid;

    const materiasRef = collection(firestore, "usuarios", uid, "materias");
    const nuevaMateria = await addDoc(materiasRef, { nombre, docente, meta, creditos, horario });

    const pesos = [33, 33, 34];
    for (let i = 0; i < pesos.length; i++) {
      const corteRef = doc(
        firestore,
        "usuarios",
        uid,
        "materias",
        nuevaMateria.id,
        "cortes",
        `corte${i + 1}`,
      );
      await setDoc(corteRef, { numero: i + 1, peso: pesos[i] });
    }

    return nuevaMateria.id;
  }

  async function eliminarMateria(materiaId) {
    const uid = authStore.usuario.uid;
    const materiaRef = doc(firestore, "usuarios", uid, "materias", materiaId);
    await deleteDoc(materiaRef);
  }

  function porcentajeUsadoCorte(materiaId, corteId) {
    const notas = notasPorMateria[materiaId]?.[corteId] || [];
    return notas.reduce((suma, nota) => suma + nota.porcentaje, 0);
  }

  function materiaCompleta(materiaId) {
    return ["corte1", "corte2", "corte3"].every(
      (corteId) => porcentajeUsadoCorte(materiaId, corteId) >= 100,
    );
  }

  // Devuelve solo los valores de promedio (sin metadata) para graficar,
  // en orden cronológico. Útil directo para una sparkline.
  function historialValoresDeMateria(materiaId) {
    return (historialPorMateria[materiaId] || []).map((punto) => punto.promedio);
  }

  const historialValoresGeneral = computed(() => historialGeneral.value.map((p) => p.promedio));

  return {
    materias,
    cargando,
    crearMateria,
    eliminarMateria,
    agregarNota,
    promedioDeCorte,
    notasPorMateria,
    materiasConPromedio,
    promedioGeneral,
    historialPorMateria,
    historialGeneral,
    historialValoresDeMateria,
    historialValoresGeneral,
  };
});
