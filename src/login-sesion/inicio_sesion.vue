<template>
  <div class="login-wrapper">
    <div class="panel-izquierdo">
      <div class="marca">
        <img :src="logo" alt="Belzavin" class="marca-logo" />
        <span class="marca-nombre">BELZAVIN</span>
      </div>

      <h1 class="titulo-principal">
        Tu espacio académico <span class="resaltado">en un solo lugar</span>
      </h1>

      <p class="descripcion">
        Organiza tus materias, consulta tus notas, calcula tus promedios y mantén el control de tu
        semestre.
      </p>

      <ul class="lista-features">
        <li v-for="feature in features" :key="feature.titulo" class="feature-item">
          <div class="feature-icono">{{ feature.icono }}</div>
          <div>
            <p class="feature-titulo">{{ feature.titulo }}</p>
            <p class="feature-descripcion">{{ feature.descripcion }}</p>
          </div>
        </li>
      </ul>
    </div>

    <div class="panel-derecho">
      <div class="tarjeta-login">
        <img :src="logo" alt="Belzavin" class="tarjeta-logo" />
        <h2 class="tarjeta-titulo">Iniciar sesión</h2>
        <p class="tarjeta-subtitulo">Bienvenido de nuevo a Belzavin</p>

        <label class="campo">
          <span class="campo-label">Correo electrónico</span>
          <input
            type="email"
            v-model="correo"
            placeholder="usuario@universidad.edu.co"
            :disabled="cargando"
          />
        </label>

        <label class="campo">
          <span class="campo-label">Contraseña</span>
          <input
            type="password"
            v-model="clave"
            placeholder="Ingresa tu contraseña"
            :disabled="cargando"
          />
        </label>

        <button class="btn-primario" @click="iniciarSesion" :disabled="cargando">
          {{ cargando ? "Entrando..." : "Iniciar sesión" }}
        </button>

        <div class="separador"><span>o</span></div>

        <button class="btn-google" @click="iniciarGoogle" :disabled="cargando">
          Continuar con Google
        </button>

        <RouterLink to="/registro" class="link">
          ¿No tienes cuenta? <strong>Crear cuenta</strong>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../service/firebase";
import Swal from "sweetalert2";
import logo from "@/assets/logo.png";

const correo = ref("");
const clave = ref("");
const cargando = ref(false);
const router = useRouter();

const features = [
  {
    icono: "📘 ",
    titulo: "Organiza tus materias",
    descripcion: "Todos tus cursos en un solo lugar.",
  },
  {
    icono: "📈",
    titulo: "Controla tus notas",
    descripcion: "Registra, consulta y calcula promedios.",
  },
  {
    icono: "🗓️",
    titulo: "Planifica tu semestre",
    descripcion: "Agenda tareas, exámenes y actividades.",
  },
];

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
      confirmButtonText: "Aceptar",
      showCloseButton: true,
    });

    router.push({ name: "home" });
  } catch (error) {
    console.error(error);

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
@keyframes softEntryUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes softEntryLeft {
  from {
    opacity: 0;
    transform: translateX(-32px) translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

@keyframes softEntryRight {
  from {
    opacity: 0;
    transform: translateX(32px) translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

.login-wrapper {
  min-height: 100vh;
  width: 100%;

  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;

  background: var(--color-background);
  box-sizing: border-box;
}

/* Columna izquierda */

.panel-izquierdo {
  padding: 4rem 5vw;
  animation: softEntryLeft 1.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.marca {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 2.5rem;
}

.marca-logo {
  width: 34px;
  height: 34px;
}

.marca-nombre {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: 0.5px;
}

.titulo-principal {
  font-size: clamp(2rem, 3.4vw, 2.8rem);
  font-weight: 800;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0 0 1.2rem;
}

.resaltado {
  color: var(--color-link);
}

.descripcion {
  font-size: 1rem;
  color: var(--color-text-muted);
  max-width: 480px;
  margin: 0 0 2.5rem;
  line-height: 1.6;
}

.lista-features {
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  animation: softEntryUp 1s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.feature-item:nth-child(2) {
  animation-delay: 0.08s;
}

.feature-item:nth-child(3) {
  animation-delay: 0.16s;
}

.feature-icono {
  width: 42px;
  height: 42px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.2rem;
  border-radius: 12px;
  background: var(--color-accent-soft);
}

.feature-titulo {
  margin: 0;
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.98rem;
}

.feature-descripcion {
  margin: 0.15rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

/* Columna derecha */

.panel-derecho {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 5vw;
  animation: softEntryRight 1.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.tarjeta-login {
  width: 100%;
  max-width: 440px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 2.8rem 2.4rem;

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.32);
  animation: softEntryUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 0.2s;
}

.tarjeta-logo {
  width: 56px;
  height: 56px;
  margin-bottom: 0.3rem;
}

.tarjeta-titulo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
}

.tarjeta-subtitulo {
  margin: 0 0 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.92rem;
}

.campo {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.campo-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.campo input {
  width: 100%;
  box-sizing: border-box;

  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);

  font-size: 0.95rem;
  color: var(--color-text);

  transition: 0.2s ease;
}

.campo input::placeholder {
  color: var(--color-text-muted);
}

.campo input:focus {
  outline: none;
  border-color: var(--color-accent-strong);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22);
}

.campo input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primario {
  width: 100%;
  padding: 0.85rem;
  margin-top: 0.4rem;

  border: none;
  border-radius: 10px;

  background: var(--color-button);
  color: white;
  font-weight: 700;
  font-size: 0.95rem;

  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primario:hover {
  background: var(--color-button-hover);
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.separador {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.separador::before,
.separador::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.btn-google {
  width: 100%;
  padding: 0.8rem;

  display: flex;
  justify-content: center;
  align-items: center;

  background: var(--color-surface-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-weight: 600;

  cursor: pointer;
  transition: 0.2s ease;
}

.btn-google:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link {
  margin-top: 0.4rem;
  font-size: 0.88rem;
  color: var(--color-text-muted);
  text-decoration: none;
}

.link strong {
  color: var(--color-link);
}

.link:hover strong {
  text-decoration: underline;
}

/* Responsive */

@media (max-width: 900px) {
  .login-wrapper {
    grid-template-columns: 1fr;
  }

  .panel-izquierdo {
    padding: 3rem 6vw 1.5rem;
    text-align: center;
  }

  .marca,
  .lista-features {
    align-items: center;
  }

  .marca {
    justify-content: center;
  }

  .descripcion {
    margin-left: auto;
    margin-right: auto;
  }

  .feature-item {
    text-align: left;
  }
}
</style>
