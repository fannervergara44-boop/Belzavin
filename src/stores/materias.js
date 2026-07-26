import { defineStore } from "pinia";
import { ref, reactive, computed, watch } from "vue";
import { collection, addDoc, doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { firestore } from "../service/firebase";
import { useAuthStore } from "../stores/auth";

export const useMateriasStore = defineStore("materias", () => {
  const authStore = useAuthStore();
  const materias = ref([]);
  const cargando = ref(true);

  // notasPorMateria[materiaId] = { corte1: [...notas], corte2: [...], corte3: [...] }
  const notasPorMateria = reactive({});

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

  watch(
    () => authStore.usuario,
    (usuario) => {
      if (usuario) {
        escucharMaterias(usuario.uid);
      } else {
        materias.value = [];
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

    await addDoc(notasRef, {
      nombre,
      valor,
      porcentaje,
      descripcion,
      createdAt: new Date(),
    });
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

  const materiasConPromedio = computed(() =>
    materias.value.map((materia) => {
      const promedio = promedioDeMateria(materia.id);
      return {
        ...materia,
        promedio,
        completa: materiaCompleta(materia.id),
        diferenciaMeta: (materia.meta || 0) - promedio,
      };
    }),
  );

  const promedioGeneral = computed(() => {
    if (materiasConPromedio.value.length === 0) return 0;

    const sumaPonderada = materiasConPromedio.value.reduce(
      (acc, m) => acc + m.promedio * (m.creditos || 0),
      0,
    );
    const totalCreditos = materiasConPromedio.value.reduce((acc, m) => acc + (m.creditos || 0), 0);

    if (totalCreditos === 0) return 0;
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
  };
});
