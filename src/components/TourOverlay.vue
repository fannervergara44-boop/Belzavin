<template>
  <div v-if="tourStore.activo" class="tour-overlay">
    <div class="tour-spotlight" :style="highlightStyle"></div>

    <div class="tour-tooltip" :style="tooltipStyle">
      <div class="tour-tooltip-header">
        <span class="tour-contador">{{ tourStore.pasoActual + 1 }} / {{ tourStore.total }}</span>
        <button type="button" class="tour-saltar" @click="tourStore.finalizar()">
          Saltar tour
        </button>
      </div>

      <h3>{{ tourStore.paso?.titulo }}</h3>
      <p>{{ tourStore.paso?.texto }}</p>

      <div class="tour-tooltip-acciones">
        <button
          v-if="!tourStore.esPrimero"
          type="button"
          class="tour-btn tour-btn--secundario"
          @click="tourStore.anterior()"
        >
          ← Anterior
        </button>
        <button type="button" class="tour-btn tour-btn--primario" @click="tourStore.siguiente()">
          {{ tourStore.esUltimo ? "Finalizar" : "Siguiente →" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTourStore } from "@/stores/tour";

const tourStore = useTourStore();
const route = useRoute();
const router = useRouter();

const highlightStyle = ref({ display: "none" });
const tooltipStyle = ref({});
let elementoActual = null;

// Espera hasta encontrar el elemento en el DOM (útil justo después de
// navegar a otra ruta, o mientras el store de materias todavía está
// cargando datos de Firestore la primera vez).
function esperarElemento(selector, intentos = 30) {
  return new Promise((resolve) => {
    const intento = (restantes) => {
      const el = document.querySelector(selector);
      if (el || restantes <= 0) {
        resolve(el);
        return;
      }
      setTimeout(() => intento(restantes - 1), 100);
    };
    intento(intentos);
  });
}

function posicionar() {
  if (!elementoActual) {
    highlightStyle.value = { display: "none" };
    tooltipStyle.value = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
    return;
  }

  const rect = elementoActual.getBoundingClientRect();
  const pad = 8;

  highlightStyle.value = {
    top: `${rect.top - pad}px`,
    left: `${rect.left - pad}px`,
    width: `${rect.width + pad * 2}px`,
    height: `${rect.height + pad * 2}px`,
  };

  const anchoTooltip = 340;
  const espacioAbajo = window.innerHeight - rect.bottom;
  const irArriba = espacioAbajo < 240 && rect.top > 240;
  const izquierda = Math.min(Math.max(rect.left, 16), window.innerWidth - anchoTooltip - 16);

  tooltipStyle.value = irArriba
    ? { top: `${rect.top - pad - 12}px`, left: `${izquierda}px`, transform: "translateY(-100%)" }
    : { top: `${rect.bottom + pad + 12}px`, left: `${izquierda}px`, transform: "none" };
}

async function irAlPasoActual() {
  const paso = tourStore.paso;
  if (!paso) return;

  elementoActual = null;
  highlightStyle.value = { display: "none" };

  if (route.name !== paso.ruta) {
    await router.push({ name: paso.ruta });
    await nextTick();
  }

  elementoActual = await esperarElemento(paso.selector);

  // Un frame extra de margen para que el layout ya esté aplicado antes de
  // medir — con la animación de página desactivada durante el tour
  // (App.vue), esto es suficiente sin necesidad de perseguir la posición.
  await new Promise((resolve) => requestAnimationFrame(resolve));
  posicionar();
}

watch(
  () => [tourStore.activo, tourStore.pasoActual],
  ([activo]) => {
    if (activo) irAlPasoActual();
  },
  { immediate: true },
);

function onResize() {
  if (tourStore.activo) posicionar();
}

window.addEventListener("resize", onResize);
window.addEventListener("scroll", onResize, true);

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  window.removeEventListener("scroll", onResize, true);
});
</script>

<style scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.tour-spotlight {
  position: fixed;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(2, 6, 15, 0.72);
  border: 2px solid var(--color-accent-strong);
  transition:
    top 0.25s ease,
    left 0.25s ease,
    width 0.25s ease,
    height 0.25s ease;
  pointer-events: none;
}

.tour-tooltip {
  position: fixed;
  width: 320px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  transition:
    top 0.25s ease,
    left 0.25s ease;
}

.tour-tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.tour-contador {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tour-saltar {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font: inherit;
  transition: color 0.2s ease;
}

.tour-saltar:hover {
  color: var(--color-danger, #ef4444);
}

.tour-tooltip h3 {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-heading);
}

.tour-tooltip p {
  margin: 0 0 1.1rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--color-text-muted);
}

.tour-tooltip-acciones {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.tour-btn {
  padding: 0.55rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font: inherit;
  transition: background 0.2s ease;
}

.tour-btn--primario {
  background: var(--color-button);
  color: #fff;
}

.tour-btn--primario:hover {
  background: var(--color-button-hover);
}

.tour-btn--secundario {
  background: var(--color-surface-soft);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.tour-btn--secundario:hover {
  background: var(--color-accent-soft);
}

@media (max-width: 480px) {
  .tour-tooltip {
    width: calc(100vw - 32px);
  }
}
</style>
