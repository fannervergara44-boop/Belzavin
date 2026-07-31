<template>
  <aside class="sidebar" :class="{ 'sidebar-abierto': open }">
    <div class="sidebar-inner">
      <button class="collapse-btn" @click="toggleOpen">
        ☰ Menu
        <span class="arrow" v-if="open">▲</span>
        <span class="arrow" v-else>▼</span>
      </button>

      <ul v-show="open" class="menu-list">
        <li><RouterLink :to="{ name: 'home' }" @click="cerrarMenu">Inicio</RouterLink></li>
        <li><RouterLink to="/materias" @click="cerrarMenu">Materias</RouterLink></li>
        <li><RouterLink to="/notas" @click="cerrarMenu">Notas</RouterLink></li>
        <li><RouterLink to="/horario" @click="cerrarMenu">Horario</RouterLink></li>
        <li>
          <RouterLink to="/calificaciones" @click="cerrarMenu">Registrar calificaciones</RouterLink>
        </li>
        <li><RouterLink to="/perfil" @click="cerrarMenu">Perfil</RouterLink></li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";

const open = ref(false);

const toggleOpen = () => {
  open.value = !open.value;
};

const cerrarMenu = () => {
  open.value = false;
};
</script>

<style scoped>
.sidebar {
  width: 130px;
  background: var(--color-surface);
  color: var(--color-text);
  padding: 1rem;
  border-right: 1px solid var(--color-border);
  box-sizing: border-box;
  position: fixed;
  top: var(--top-bar-height, 7.5rem);
  left: 0;
  height: auto;
  max-height: calc(100vh - var(--top-bar-height, 7.5rem));
  overflow: auto;
  z-index: 5;
  box-shadow: 4px 0 20px rgba(15, 27, 45, 0.05);
  border-radius: 0 12px 12px 0;
  transition:
    width 0.25s ease,
    border-radius 0.25s ease;
}

.sidebar-abierto {
  width: 220px;
}

.collapse-btn {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-weight: 700;
  padding: 0.5rem 0;
  text-align: left;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.collapse-btn:hover {
  color: var(--color-link);
}

.collapse-btn .arrow {
  float: right;
  color: var(--color-text-muted);
}

.menu-list {
  list-style: none;
  padding: 0.5rem 0 0 0;
  margin: 0;
}

.menu-list li {
  margin: 0.35rem 0;
}

.menu-list a {
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  display: block;
  border-radius: 8px;
  font-weight: 500;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.menu-list a:hover {
  background: var(--color-accent-soft);
  color: var(--color-link);
  transform: translateX(2px);
}

.menu-list a.router-link-active {
  background: var(--color-accent-soft);
  color: var(--color-link);
  font-weight: 700;
  border-left: 3px solid var(--color-accent-strong);
  padding-left: calc(0.75rem - 3px);
}

@media (max-width: 768px) {
  .sidebar,
  .sidebar-abierto {
    position: relative;
    top: 0;
    margin-top: 9.5rem;
    height: auto;
    max-height: none;
    width: 100%;
    border-right: none;
    border-radius: 0;
  }
}
</style>
