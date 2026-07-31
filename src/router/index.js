import { createRouter, createWebHistory } from "vue-router";
import Registro from "../login-sesion/registro.vue";
import InicioSesion from "../login-sesion/inicio_sesion.vue";
import Home from "../views/home.vue";
import Materias from "../views/materias.vue";
import Notas from "../views/notas.vue";
import Horario from "../views/horario.vue";
import calificación from "@/views/calificación.vue";
import NotasMateria from "@/views/NotasMateria.vue";
import Perfil from "@/views/perfil.vue";
import LayoutConSidebar from "../layout/LayoutConSidebar.vue";
import { useAuthStore } from "../stores/auth";
import { watch } from "vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: { name: "home" } },
    {
      path: "/registro",
      name: "registro",
      component: Registro,
      meta: { transition: "auth-slide-left" },
    },
    {
      path: "/inicio_sesion",
      name: "inicio_sesion",
      component: InicioSesion,
      meta: { transition: "auth-slide-right" },
    },

    {
      path: "/",
      component: LayoutConSidebar,
      meta: { requiresAuth: true },
      children: [
        { path: "home", name: "home", component: Home },
        { path: "materias", name: "materias", component: Materias },
        {
          path: "materias/:materiaId/notas",
          name: "notas_materia",
          component: NotasMateria,
        },
        { path: "notas", name: "notas", component: Notas },
        { path: "horario", name: "horario", component: Horario },
        { path: "calificaciones", name: "calificaciones", component: calificación },
        { path: "perfil", name: "perfil", component: Perfil },
      ],
    },
  ],
});

function esperarAuth(authStore) {
  return new Promise((resolve) => {
    if (!authStore.cargando) {
      resolve();
      return;
    }
    const detener = watch(
      () => authStore.cargando,
      (nuevoValor) => {
        if (!nuevoValor) {
          detener();
          resolve();
        }
      },
    );
  });
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await esperarAuth(authStore);

  const usuario = authStore.usuario;

  if (to.meta.requiresAuth && !usuario) {
    next({ name: "inicio_sesion" });
  } else {
    next();
  }
});

export default router;
