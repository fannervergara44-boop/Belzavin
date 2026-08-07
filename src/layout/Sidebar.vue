<template>
  <aside class="sidebar">
    <div class="sidebar-inner">
      <div class="sidebar-logo">
        <img :src="logo" alt="Logo Belzavin" class="logo-img" />
        <span class="logo-text">Belzavin</span>
      </div>

      <nav class="menu-list">
        <RouterLink :to="{ name: 'home' }" class="menu-item" data-tour="nav-home">
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 11.5 12 4l8 7.5" />
            <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
          </svg>
          <span>Inicio</span>
        </RouterLink>

        <RouterLink to="/materias" class="menu-item" data-tour="nav-materias">
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z" />
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          </svg>
          <span>Mis materias</span>
        </RouterLink>

        <RouterLink to="/notas" class="menu-item" data-tour="nav-notas">
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M13 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M13 2v6h6" />
            <path d="M9 13h6" />
            <path d="M9 17h6" />
          </svg>
          <span>Notas</span>
        </RouterLink>

        <RouterLink to="/horario" class="menu-item" data-tour="nav-horario">
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 2v6" />
            <path d="M16 2v6" />
          </svg>
          <span>Horario</span>
        </RouterLink>

        <RouterLink to="/calificaciones" class="menu-item" data-tour="nav-calificaciones">
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2 14.5 8.5 21 9.3l-5 4.6 1.3 6.6L12 17.6 6.7 20.5 8 13.9 3 9.3l6.5-.8Z" />
          </svg>
          <span>Calificaciones</span>
        </RouterLink>

        <RouterLink to="/evolucion" class="menu-item" data-tour="nav-evolucion">
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="m7 15 3.5-4 3 3L19 8" />
          </svg>
          <span>Evolución</span>
        </RouterLink>

        <RouterLink to="/perfil" class="menu-item" data-tour="nav-perfil">
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
          <span>Perfil</span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink } from "vue-router";
import logo from "@/assets/logo.png";
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width, 236px);
  flex-shrink: 0;
  background: var(--color-surface);
  color: var(--color-text);
  border-right: 1px solid var(--color-border);
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 10;
  box-shadow: 4px 0 20px rgba(15, 27, 45, 0.05);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 1.1rem;
  box-sizing: border-box;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.4rem 1.5rem;
  flex-shrink: 0;
}

.logo-img {
  height: 2rem;
  width: auto;
}

.logo-text {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-heading, var(--color-text));
  letter-spacing: -0.01em;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.menu-icon {
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
}

.menu-item:hover {
  background: var(--color-accent-soft);
  color: var(--color-link);
}

.menu-item.router-link-active {
  background: var(--color-accent-soft);
  color: var(--color-accent-strong, var(--color-link));
  font-weight: 700;
}

@media (max-width: 900px) {
  .sidebar {
    position: relative;
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar-inner {
    flex-direction: row;
    align-items: center;
    padding: 0.85rem 1rem;
    gap: 1rem;
  }

  .sidebar-logo {
    padding: 0;
  }

  .logo-text {
    display: none;
  }

  .menu-list {
    flex-direction: row;
    overflow-x: auto;
    gap: 0.2rem;
  }

  .menu-item span {
    display: none;
  }

  .menu-item {
    padding: 0.6rem;
  }
}
</style>
