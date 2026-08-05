import { defineStore } from "pinia";
import { ref, reactive, computed, watch } from "vue";
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
  writeBatch,
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

  const unsubscribes = {
    materias: null,
    historialGeneral: null,
    notasPorMateria: {},
    historialPorMateria: {},
  };

  function limpiarEscuchasMaterias() {
    if (typeof unsubscribes.materias === "function") {
      unsubscribes.materias();
      unsubscribes.materias = null;
    }
  }

  function limpiarEscuchasHistorialGeneral() {
    if (typeof unsubscribes.historialGeneral === "function") {
      unsubscribes.historialGeneral();
      unsubscribes.historialGeneral = null;
    }
  }

  function limpiarEscuchasNotasDeMateria(materiaId) {
    ["corte1", "corte2", "corte3"].forEach((corteId) => {
      const key = `${materiaId}_${corteId}`;
      const unsubscribe = unsubscribes.notasPorMateria[key];
      if (typeof unsubscribe === "function") {
        unsubscribe();
        delete unsubscribes.notasPorMateria[key];
      }
    });
  }

  function limpiarEscuchasHistorialDeMateria(materiaId) {
    const unsubscribe = unsubscribes.historialPorMateria[materiaId];
    if (typeof unsubscribe === "function") {
      unsubscribe();
      delete unsubscribes.historialPorMateria[materiaId];
    }
  }

  function limpiarTodasLasEscuchas() {
    limpiarEscuchasMaterias();
    limpiarEscuchasHistorialGeneral();

    Object.keys(unsubscribes.notasPorMateria).forEach((key) => {
      const unsubscribe = unsubscribes.notasPorMateria[key];
      if (typeof unsubscribe === "function") unsubscribe();
      delete unsubscribes.notasPorMateria[key];
    });

    Object.keys(unsubscribes.historialPorMateria).forEach((materiaId) => {
      const unsubscribe = unsubscribes.historialPorMateria[materiaId];
      if (typeof unsubscribe === "function") unsubscribe();
      delete unsubscribes.historialPorMateria[materiaId];
    });
  }

  function limpiarEstadoMaterias() {
    materias.value = [];
    historialGeneral.value = [];
    cargando.value = true;

    Object.keys(notasPorMateria).forEach((materiaId) => delete notasPorMateria[materiaId]);
    Object.keys(historialPorMateria).forEach((materiaId) => delete historialPorMateria[materiaId]);
  }

  function escucharMaterias(uid) {
    limpiarEscuchasMaterias();

    const materiasRef = collection(firestore, "usuarios", uid, "materias");

    unsubscribes.materias = onSnapshot(materiasRef, (snapshot) => {
      const nuevasMaterias = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const nuevosIds = nuevasMaterias.map((materia) => materia.id);

      Object.keys(notasPorMateria).forEach((materiaId) => {
        if (!nuevosIds.includes(materiaId)) {
          limpiarEscuchasNotasDeMateria(materiaId);
          limpiarEscuchasHistorialDeMateria(materiaId);
          delete notasPorMateria[materiaId];
          delete historialPorMateria[materiaId];
        }
      });

      materias.value = nuevasMaterias;
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
    limpiarEscuchasNotasDeMateria(materiaId);

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
      const key = `${materiaId}_${corteId}`;

      unsubscribes.notasPorMateria[key] = onSnapshot(notasRef, (snapshot) => {
        const notas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (!notasPorMateria[materiaId]) {
          notasPorMateria[materiaId] = { corte1: [], corte2: [], corte3: [] };
        }
        notasPorMateria[materiaId][corteId] = notas;
      });
    });
  }

  function escucharHistorialDeMateria(uid, materiaId) {
    limpiarEscuchasHistorialDeMateria(materiaId);

    const historialRef = query(
      collection(firestore, "usuarios", uid, "materias", materiaId, "historial"),
      orderBy("fecha", "asc"),
    );

    unsubscribes.historialPorMateria[materiaId] = onSnapshot(historialRef, (snapshot) => {
      historialPorMateria[materiaId] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });
  }

  function escucharHistorialGeneral(uid) {
    limpiarEscuchasHistorialGeneral();

    const historialRef = query(
      collection(firestore, "usuarios", uid, "historialGeneral"),
      orderBy("fecha", "asc"),
    );

    unsubscribes.historialGeneral = onSnapshot(historialRef, (snapshot) => {
      historialGeneral.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });
  }

  watch(
    () => authStore.usuario,
    (usuario) => {
      limpiarTodasLasEscuchas();
      limpiarEstadoMaterias();

      if (usuario) {
        escucharMaterias(usuario.uid);
        escucharHistorialGeneral(usuario.uid);
      } else {
        cargando.value = false;
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
    // Guardamos un snapshot del nombre por si la materia se renombra o se
    // borra más adelante — así el histórico sigue siendo legible.
    const materiaNombre = materias.value.find((m) => m.id === materiaId)?.nombre || "";

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
        materiaId,
        materiaNombre,
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
    const batch = writeBatch(firestore);

    const materiasRef = collection(firestore, "usuarios", uid, "materias");
    // doc(materiasRef) genera un id nuevo localmente sin hacer ningún viaje
    // de red todavía — recién se escribe cuando se hace commit() del batch.
    const nuevaMateriaRef = doc(materiasRef);
    batch.set(nuevaMateriaRef, { nombre, docente, meta, creditos, horario });

    const pesos = [33, 33, 34];
    pesos.forEach((peso, i) => {
      const corteRef = doc(
        firestore,
        "usuarios",
        uid,
        "materias",
        nuevaMateriaRef.id,
        "cortes",
        `corte${i + 1}`,
      );
      batch.set(corteRef, { numero: i + 1, peso });
    });

    // No esperamos a que el servidor confirme el commit: en cuanto se
    // llama a commit(), Firestore ya aplicó la escritura de forma optimista
    // al caché local (por eso la materia aparece al instante en la lista
    // vía el listener de escucharMaterias). Esperar la confirmación del
    // servidor solo agrega latencia de red al loading sin beneficio real
    // para el usuario. Si el commit llega a fallar de verdad (permisos,
    // etc.), Firestore revierte el cambio local solo y lo dejamos
    // registrado en consola en vez de trabar la UI.
    batch.commit().catch((error) => {
      console.error("No se pudo confirmar la creación de la materia con el servidor:", error);
    });

    return nuevaMateriaRef.id;
  }

  async function eliminarMateria(materiaId) {
    const uid = authStore.usuario.uid;
    const batch = writeBatch(firestore);

    // 1. Notas y documento de cada uno de los 3 cortes
    for (const corteId of ["corte1", "corte2", "corte3"]) {
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
      const notasSnap = await getDocs(notasRef);
      notasSnap.forEach((notaDoc) => batch.delete(notaDoc.ref));

      const corteRef = doc(firestore, "usuarios", uid, "materias", materiaId, "cortes", corteId);
      batch.delete(corteRef);
    }

    // 2. Histórico propio de la materia (para su sparkline)
    const historialRef = collection(firestore, "usuarios", uid, "materias", materiaId, "historial");
    const historialSnap = await getDocs(historialRef);
    historialSnap.forEach((histDoc) => batch.delete(histDoc.ref));

    // 3. Puntos del histórico general que se generaron a partir de esta
    // materia — si no se borran, la gráfica de "Promedio general" sigue
    // mostrando datos de una materia que ya no existe.
    const historialGeneralRef = collection(firestore, "usuarios", uid, "historialGeneral");
    const qHistorialGeneral = query(historialGeneralRef, where("materiaId", "==", materiaId));
    const historialGeneralSnap = await getDocs(qHistorialGeneral);
    historialGeneralSnap.forEach((histDoc) => batch.delete(histDoc.ref));

    // 4. La materia en sí
    const materiaRef = doc(firestore, "usuarios", uid, "materias", materiaId);
    batch.delete(materiaRef);

    await batch.commit();

    // Limpieza del estado local reactivo, para que no queden llaves
    // "fantasma" apuntando a una materia que ya no existe.
    delete notasPorMateria[materiaId];
    delete historialPorMateria[materiaId];
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
