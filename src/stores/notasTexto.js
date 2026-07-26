import { defineStore } from "pinia";
import { ref, watch } from "vue";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../service/firebase";
import { useAuthStore } from "../stores/auth";

export const useNotasTextoStore = defineStore("notasTexto", () => {
  const authStore = useAuthStore();
  const notas = ref([]);
  const cargando = ref(true);

  function escucharNotas(uid) {
    const notasRef = collection(firestore, "usuarios", uid, "notasTexto");

    onSnapshot(notasRef, (snapshot) => {
      notas.value = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      cargando.value = false;
    });
  }

  watch(
    () => authStore.usuario,
    (usuario) => {
      if (usuario) {
        escucharNotas(usuario.uid);
      } else {
        notas.value = [];
      }
    },
    { immediate: true },
  );

  async function crearNota({ titulo, contenido }) {
    const uid = authStore.usuario.uid;
    const notasRef = collection(firestore, "usuarios", uid, "notasTexto");
    await addDoc(notasRef, {
      titulo,
      contenido,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function editarNota(notaId, { titulo, contenido }) {
    const uid = authStore.usuario.uid;
    const notaRef = doc(firestore, "usuarios", uid, "notasTexto", notaId);
    await updateDoc(notaRef, {
      titulo,
      contenido,
      updatedAt: serverTimestamp(),
    });
  }

  async function eliminarNota(notaId) {
    const uid = authStore.usuario.uid;
    const notaRef = doc(firestore, "usuarios", uid, "notasTexto", notaId);
    await deleteDoc(notaRef);
  }

  return {
    notas,
    cargando,
    crearNota,
    editarNota,
    eliminarNota,
  };
});
