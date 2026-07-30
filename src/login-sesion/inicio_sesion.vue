<template>
  <div class="inicio-sesion-wrapper">
    <div class="titulo">
      <Belzavin
        titulo="BELZAVIN"
        subtitulo="Bienvenido. Si ya tienes una cuenta, te invitamos a que inicies sesión y disfrutes de nuestra página."
        :imagen="logo"
      />
    </div>

    <div class="inicio-sesion">
      <input type="email" v-model="correo" placeholder="Correo electrónico" :disabled="cargando" />

      <input type="password" v-model="clave" placeholder="Contraseña" :disabled="cargando" />

      <button @click="iniciarSesion" :disabled="cargando">
        {{ cargando ? "Entrando..." : "Entrar" }}
      </button>

      <button class="google-btn" @click="iniciarGoogle" :disabled="cargando">
        Iniciar con Google
      </button>

      <RouterLink to="/registro" class="link"> ¿No tienes cuenta? Regístrate </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../service/firebase";
import Swal from "sweetalert2";
import Belzavin from "@/components/belzavin.vue";
import logo from "@/assets/logo.png";

const correo = ref("");
const clave = ref("");
const cargando = ref(false);
const router = useRouter();

const iniciarSesion = async () => {
  const errores = [];

  if (!correo.value.trim()) {
    errores.push("El correo electrónico es obligatorio.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value)) {
    errores.push("El correo electrónico no tiene un formato válido.");
  }

  if (!clave.value.trim()) {
    errores.push("La contraseña es obligatoria.");
  }

  if (errores.length) {
    Swal.fire({
      icon: "warning",
      title: "Formulario incompleto",
      html: errores.join("<br>"),
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });
    return;
  }

  cargando.value = true;

  try {
    const credenciales = await signInWithEmailAndPassword(auth, correo.value, clave.value);
    await Swal.fire({
      icon: "success",
      title: "¡Bienvenido!",
      text: `Hola, ${credenciales.user.email}`,
      confirmButtonText: "Continuar",
      showCloseButton: true,
    });
    router.push({ name: "home" });
  } catch (error) {
    console.error(error);

    switch (error.code) {
      case "auth/invalid-credential":
        Swal.fire({
          icon: "error",
          title: "Credenciales incorrectas",
          text: "El correo o la contraseña son incorrectos.",
          confirmButtonText: "Aceptar",
          showCloseButton: true,
        });
        break;

      case "auth/wrong-password":
        Swal.fire({
          icon: "error",
          title: "Contraseña errónea",
          text: "La contraseña es incorrecta.",
          confirmButtonText: "Aceptar",
          showCloseButton: true,
        });
        break;
      case "auth/invalid-email":
        Swal.fire({
          icon: "error",
          title: "Correo inválido",
          text: "El correo no es válido.",
          confirmButtonText: "Aceptar",
          showCloseButton: true,
        });
        break;
      default:
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al iniciar sesión.",
          confirmButtonText: "Aceptar",
          showCloseButton: true,
        });
    }
  } finally {
    cargando.value = false;
  }
};

const iniciarGoogle = async () => {
  cargando.value = true;

  try {
    const provider = new GoogleAuthProvider();

    const resultado = await signInWithPopup(auth, provider);

    console.log("Usuario Google:", resultado.user);

    await Swal.fire({
      icon: "success",
      title: "Bienvenido",
      text: `Bienvenido ${resultado.user.displayName}`,
      confirmButtonText: "aceptar",
      showCloseButton: true,
    });

    router.push({ name: "home" });
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
      text: "Error al iniciar sesión con Google",
      confirmButtonText: "Aceptar",
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

.inicio-sesion-wrapper {
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

/* Orbes de fondo */

.inicio-sesion-wrapper::before,
.inicio-sesion-wrapper::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  animation: orbFloat 12s infinite ease-in-out;
}

.inicio-sesion-wrapper::before {
  width: 420px;
  height: 420px;
  top: -120px;
  left: -120px;

  background: rgba(46, 125, 91, 0.35);
}

.inicio-sesion-wrapper::after {
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

/* Tarjeta */

.inicio-sesion {
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
  -webkit-backdrop-filter: blur(18px);

  border: 1px solid rgba(46, 125, 91, 0.25);
  border-radius: 18px;

  color: white;

  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.55),
    0 0 30px rgba(46, 125, 91, 0.1);

  animation: fadeInUp 0.8s ease;
}

/* Inputs */

.inicio-sesion input {
  width: 100%;

  padding: 0.85rem 1rem;

  border-radius: 10px;

  border: 1px solid rgba(46, 125, 91, 0.25);

  background: rgba(255, 255, 255, 0.04);

  color: #e6fff2;

  font-size: 0.95rem;

  transition: 0.25s ease;
}

.inicio-sesion input::placeholder {
  color: rgba(230, 255, 242, 0.5);
}

.inicio-sesion input:focus {
  outline: none;

  border-color: #2e7d5b;

  transform: translateY(-2px);

  box-shadow: 0 0 0 3px rgba(46, 125, 91, 0.18);
}

.inicio-sesion input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Botones */

.inicio-sesion button {
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

.inicio-sesion button:hover {
  transform: translateY(-2px);

  box-shadow: 0 12px 25px rgba(46, 125, 91, 0.3);
}

.inicio-sesion button:active {
  transform: scale(0.97);
}

.inicio-sesion button:disabled {
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

  margin-top: 0.3rem;

  background: white;

  color: #3c4043;

  border: 1px solid #ddd;

  border-radius: 10px;

  font-weight: 500;

  cursor: pointer;

  transition: 0.25s ease;
}

.google-btn:hover {
  transform: translateY(-2px);

  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Enlace */

.inicio-sesion .link {
  color: #a8e6c9;

  text-decoration: underline;

  transition: 0.25s;
}

.inicio-sesion .link:hover {
  color: #d7f5e6;
}
</style>
