<template>
  <div class="registro-wrapper">
    <div class="panel-izquierdo">
      <div class="tarjeta-login">
        <img :src="logo" alt="Belzavin" class="tarjeta-logo" />
        <h2 class="tarjeta-titulo">Crear cuenta</h2>
        <p class="tarjeta-subtitulo">Únete a Belzavin y organiza tu semestre</p>

        <label class="campo">
          <span class="campo-label">Usuario</span>
          <input
            type="text"
            v-model="user"
            placeholder="Tu nombre de usuario"
            :disabled="cargando"
          />
        </label>

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
            placeholder="Crea una contraseña"
            :disabled="cargando"
          />
        </label>

        <button class="btn-primario" @click="registrar" :disabled="cargando">
          {{ cargando ? "Registrando..." : "Registrarse" }}
        </button>

        <div class="separador"><span>o</span></div>

        <button class="btn-google" @click="registrarGoogle" :disabled="cargando">
          Registrarse con Google
        </button>

        <RouterLink to="/inicio_sesion" class="link">
          ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
        </RouterLink>
      </div>
    </div>

    <div class="panel-derecho">
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
import logo from "@/assets/logo.png";

const authStore = useAuthStore();
const router = useRouter();

const user = ref("");
const correo = ref("");
const clave = ref("");
const cargando = ref(false);

const features = [
  {
    icono: "📘",
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.registro-wrapper {
  min-height: 100vh;
  width: 100%;

  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;

  background: #f4f7fb;
  box-sizing: border-box;
}

/* Columna izquierda: form */

.panel-izquierdo {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 5vw;
}

.tarjeta-login {
  width: 100%;
  max-width: 440px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  background: #ffffff;
  border-radius: 20px;
  padding: 2.8rem 2.4rem;

  box-shadow: 0 20px 50px rgba(15, 27, 45, 0.08);
  animation: fadeInUp 0.7s ease;
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
  color: #0f1b2d;
}

.tarjeta-subtitulo {
  margin: 0 0 0.5rem;
  color: #7a8aa0;
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
  color: #3d4a5c;
}

.campo input {
  width: 100%;
  box-sizing: border-box;

  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid #dde4ee;
  background: #f8fafc;

  font-size: 0.95rem;
  color: #0f1b2d;

  transition: 0.2s ease;
}

.campo input::placeholder {
  color: #a3adba;
}

.campo input:focus {
  outline: none;
  border-color: #0b5fff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(11, 95, 255, 0.12);
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

  background: #0b5fff;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;

  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primario:hover {
  background: #0a52dd;
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
  color: #a3adba;
  font-size: 0.85rem;
}

.separador::before,
.separador::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e5eaf1;
}

.btn-google {
  width: 100%;
  padding: 0.8rem;

  display: flex;
  justify-content: center;
  align-items: center;

  background: #ffffff;
  color: #3c4043;
  border: 1px solid #dde4ee;
  border-radius: 10px;
  font-weight: 600;

  cursor: pointer;
  transition: 0.2s ease;
}

.btn-google:hover {
  border-color: #c4ccd8;
  box-shadow: 0 4px 12px rgba(15, 27, 45, 0.06);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link {
  margin-top: 0.4rem;
  font-size: 0.88rem;
  color: #7a8aa0;
  text-decoration: none;
}

.link strong {
  color: #0b5fff;
}

.link:hover strong {
  text-decoration: underline;
}

/* Columna derecha: branding */

.panel-derecho {
  padding: 4rem 5vw;
  animation: fadeInUp 0.6s ease;
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
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f1b2d;
  letter-spacing: 0.5px;
}

.titulo-principal {
  font-size: clamp(1.9rem, 3.2vw, 2.6rem);
  font-weight: 800;
  line-height: 1.2;
  color: #0f1b2d;
  margin: 0 0 1.2rem;
}

.resaltado {
  color: #0b5fff;
}

.descripcion {
  font-size: 1rem;
  color: #5b6b7f;
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
  background: #eaf1ff;
}

.feature-titulo {
  margin: 0;
  font-weight: 700;
  color: #0f1b2d;
  font-size: 0.98rem;
}

.feature-descripcion {
  margin: 0.15rem 0 0;
  color: #7a8aa0;
  font-size: 0.88rem;
}

/* Responsive */

@media (max-width: 900px) {
  .registro-wrapper {
    grid-template-columns: 1fr;
  }

  .panel-izquierdo {
    order: 1;
  }

  .panel-derecho {
    order: 2;
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
