import { defineStore } from "pinia";
import { ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../service/firebase";

export const useAuthStore = defineStore("auth", () => {
  const usuario = ref(null);
  const cargando = ref(true);

  onAuthStateChanged(auth, (user) => {
    usuario.value = user;

    cargando.value = false;
  });

  return {
    usuario,
    cargando,
  };
});
