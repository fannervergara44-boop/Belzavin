<template>
  <div class="registro-wrapper">
    <div class="titulo">
      <belzavin
        titulo="BELZAVIN"
        subtitulo="Bienvenido a belzavin, si aun no tienes cuenta te invitamos a registrarte"
      />
    </div>

    <div class="registro">
      <input type="text" v-model="user" placeholder="Usuario" :disabled="cargando" />

      <input type="email" v-model="correo" placeholder="Correo electrónico" :disabled="cargando" />

      <input type="password" v-model="clave" placeholder="Contraseña" :disabled="cargando" />

      <button @click="registrar" :disabled="cargando">
        {{ cargando ? "Registrando..." : "Registrarse" }}
      </button>

      <button class="google-btn" @click="registrarGoogle" :disabled="cargando">
        Registrarse con Google
      </button>

      <RouterLink to="/inicio_sesion" class="link"> ¿Ya tienes cuenta? Inicia sesión </RouterLink>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth } from "../service/firebase";
import { useAuthStore } from "../stores/auth";
import Swal from "sweetalert2";
import belzavin from "@/components/belzavin.vue";

const authStore = useAuthStore();
const router = useRouter();

const user = ref("");
const correo = ref("");
const clave = ref("");
const cargando = ref(false);

// Genera una URL de avatar con las iniciales del nombre
function generarAvatar(nombre) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=0b5fff&color=fff`;
}

const registrar = async () => {
  const errores = [];

  if (!user.value.trim()) errores.push("El nombre de usuario es obligatorio.");
  if (!correo.value.trim()) {
    errores.push("El correo electrónico es obligatorio.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value)) {
    errores.push("El correo electrónico no tiene un formato válido.");
  }
  if (!clave.value.trim()) {
    errores.push("La contraseña es obligatoria.");
  } else if (clave.value.length < 8) {
    errores.push("La contraseña debe tener al menos 8 caracteres.");
  } else {
    if (!/[A-Z]/.test(clave.value)) {
      errores.push("Debe tener al menos una letra mayúscula.");
    }

    if (!/[0-9]/.test(clave.value)) {
      errores.push("Debe tener al menos un número.");
    }

    if (!/[!@#$%^&*]/.test(clave.value)) {
      errores.push("Debe tener al menos un carácter especial.");
    }
  }

  if (errores.length) {
    Swal.fire({
      icon: "warning",
      title: "Formulario incompleto",
      html: errores.join("<br>"),
      confirmButtonText: "aceptar",
      showCloseButton: true,
    });
    return;
  }

  cargando.value = true;

  try {
    const cred = await createUserWithEmailAndPassword(auth, correo.value, clave.value);

    await updateProfile(cred.user, {
      displayName: user.value,
      photoURL: generarAvatar(user.value),
    });

    await cred.user.reload();
    authStore.usuario = auth.currentUser;

    console.log("Usuario registrado:", auth.currentUser);
    await Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: "Usuario registrado correctamente",
      confirmButtonText: "aceptar",
      showCloseButton: true,
    });
    user.value = "";
    correo.value = "";
    clave.value = "";
    router.push("/inicio_sesion");
  } catch (error) {
    console.error(error);
    switch (error.code) {
      case "auth/email-already-in-use":
        Swal.fire({
          icon: "error",
          title: "Correo ya existente",
          text: "Este correo ya está registrado.",
          confirmButtonText: "aceptar",
          showCloseButton: true,
        });
        break;
      case "auth/invalid-email":
        Swal.fire({
          icon: "error",
          title: "Correo inválido",
          text: "El correo ingresado no es válido.",
          confirmButtonText: "aceptar",
          showCloseButton: true,
        });
        break;
      case "auth/weak-password":
        Swal.fire({
          icon: "error",
          title: "Contraseña débil",
          text: "La contraseña es demasiado débil.",
          confirmButtonText: "aceptar",
          showCloseButton: true,
        });
        break;
      default:
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al registrar el usuario.",
          confirmButtonText: "aceptar",
          showCloseButton: true,
        });
    }
  } finally {
    cargando.value = false;
  }
};

const registrarGoogle = async () => {
  if (!user.value.trim()) {
    Swal.fire({
      icon: "info",
      title: "Usuario",
      text: "Escribe un nombre de usuario antes de continuar con Google.",
      confirmButtonText: "aceptar",
      showCloseButton: true,
    });
    return;
  }

  cargando.value = true;

  try {
    const provider = new GoogleAuthProvider();
    const resultado = await signInWithPopup(auth, provider);

    // Solo sobrescribimos el nombre si es un usuario NUEVO.
    // Si ya existía una cuenta con este Google, no le pisamos el displayName.
    const infoAdicional = getAdditionalUserInfo(resultado);
    const esNuevo = infoAdicional?.isNewUser;

    if (esNuevo) {
      await updateProfile(resultado.user, {
        displayName: user.value,
      });
      await resultado.user.reload();
    }

    authStore.usuario = auth.currentUser;

    console.log("Usuario Google:", auth.currentUser);
    await Swal.fire({
      icon: "success",
      title: esNuevo ? "Bienvenido" : "Bienvenido de nuevo",
      text: `Bienvenido ${auth.currentUser.displayName}`,
      confirmButtonText: "aceptar",
      showConfirmButton: true,
    });

    user.value = "";
    correo.value = "";
    clave.value = "";
  } catch (error) {
    console.error(error);

    // El usuario cerró el popup o canceló: no es un error real, no molestamos con una alerta.
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      return;
    }

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al registrarse con Google",
      confirmButtonText: "aceptar",
      showCloseButton: true,
    });
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(25px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(25px, -20px) scale(1.08);
  }
}

/* Fondo */

.registro-wrapper {
  position: relative;
  overflow: hidden;

  min-height: 100vh;
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 2rem 1rem;
  box-sizing: border-box;

  background: #05080a;
}

.registro-wrapper::before,
.registro-wrapper::after {
  content: "";
  position: absolute;

  border-radius: 50%;
  filter: blur(60px);

  animation: orbFloat 12s infinite ease-in-out;
}

.registro-wrapper::before {
  width: 420px;
  height: 420px;

  top: -120px;
  left: -120px;

  background: rgba(46, 125, 91, 0.35);
}

.registro-wrapper::after {
  width: 450px;
  height: 450px;

  bottom: -150px;
  right: -120px;

  background: rgba(11, 95, 255, 0.35);

  animation-delay: 2s;
}

/* Titulo */

.titulo {
  z-index: 1;

  margin-bottom: 1.5rem;

  animation: fadeInDown 0.7s ease;
}

/* Formulario */

.registro {
  z-index: 1;

  width: 100%;
  max-width: 520px;

  padding: 2.5rem 2rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  background: rgba(8, 16, 12, 0.82);

  backdrop-filter: blur(18px);

  border: 1px solid rgba(46, 125, 91, 0.25);

  border-radius: 18px;

  color: white;

  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.55),
    0 0 30px rgba(46, 125, 91, 0.1);

  animation: fadeInUp 0.8s ease;
}

/* Inputs */

.registro input {
  width: 100%;

  padding: 0.85rem 1rem;

  border-radius: 10px;

  border: 1px solid rgba(46, 125, 91, 0.25);

  background: rgba(255, 255, 255, 0.04);

  color: #e6fff2;

  transition: 0.25s ease;
}

.registro input::placeholder {
  color: rgba(230, 255, 242, 0.5);
}

.registro input:focus {
  outline: none;

  border-color: #2e7d5b;

  transform: translateY(-2px);

  box-shadow: 0 0 0 3px rgba(46, 125, 91, 0.18);
}

.registro input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Botones */

.registro button {
  position: relative;
  overflow: hidden;

  width: 100%;

  padding: 0.85rem;

  border: none;
  border-radius: 10px;

  background: linear-gradient(135deg, #0b5fff, #2e7d5b);

  color: white;

  font-weight: 600;

  cursor: pointer;

  transition: 0.25s ease;
}

.registro button:hover {
  transform: translateY(-2px);

  box-shadow: 0 12px 25px rgba(46, 125, 91, 0.3);
}

.registro button:active {
  transform: scale(0.97);
}

.registro button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Botón Google */

.google-btn {
  width: 100%;

  display: flex;

  justify-content: center;
  align-items: center;

  gap: 0.7rem;

  padding: 0.85rem;

  background: white;

  color: #3c4043;

  border: 1px solid #ddd;

  border-radius: 10px;

  cursor: pointer;

  transition: 0.25s ease;
}

.google-btn:hover {
  transform: translateY(-2px);

  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.google-btn i {
  color: #4285f4;
  font-size: 18px;
}

/* Link */

.registro .link {
  color: #a8e6c9;

  margin-top: 0.5rem;

  text-decoration: underline;

  transition: 0.25s;
}

.registro .link:hover {
  color: #d7f5e6;
}
</style>
