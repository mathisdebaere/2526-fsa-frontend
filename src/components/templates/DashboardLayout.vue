<script setup lang="ts">
import { ref } from 'vue'
import AppNavbar from '@/components/organisms/AppNavbar.vue'
import ToastContainer from '@/components/organisms/ToastContainer.vue'

const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <a href="#main-content" class="skip-link">Ga naar inhoud</a>
  <AppNavbar />
  <div class="dashboard-layout">
    <button class="dashboard-layout_toggle" :aria-expanded="sidebarOpen" :aria-label="sidebarOpen ? 'Navigatie sluiten' : 'Navigatie openen'" @click="toggleSidebar">
      <span class="toggle-bar" :class="{ 'toggle-bar--top-open': sidebarOpen }"></span>
      <span class="toggle-bar" :class="{ 'toggle-bar--mid-open': sidebarOpen }"></span>
      <span class="toggle-bar" :class="{ 'toggle-bar--bot-open': sidebarOpen }"></span>
    </button>

    <Transition name="backdrop">
      <div v-if="sidebarOpen" class="dashboard-layout_backdrop" aria-hidden="true" @click="closeSidebar"></div>
    </Transition>

    <aside class="dashboard-layout_sidebar" :class="{ 'dashboard-layout_sidebar--open': sidebarOpen }" aria-label="Navigatie">
      <slot name="sidebar" />
    </aside>
    <main id="main-content" class="dashboard-layout_main">
      <slot />
    </main>
  </div>
  <ToastContainer />
</template>

<style scoped lang="scss">
.dashboard-layout {
  display: grid;
  grid-template-columns: 16rem 1fr;
  min-height: calc(100vh - var(--nav-height));
  max-width: var(--max-width);
  margin: 0 auto;
  gap: 0;
}

.dashboard-layout_sidebar {
  padding: var(--spacing-xl) var(--spacing-md);
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-card);
}

.dashboard-layout_main {
  padding: var(--spacing-xl) var(--spacing-lg);
  overflow: hidden;
}

.dashboard-layout_toggle {
  display: none;
}

.dashboard-layout_backdrop {
  display: none;
}

@include breakpoint(md) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .dashboard-layout_sidebar {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    bottom: 0;
    width: 16rem;
    z-index: 200;
    border-right: 1px solid var(--color-border);
    border-bottom: none;
    padding: var(--spacing-xl) var(--spacing-md);
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow: var(--shadow-md);

    &--open {
      transform: translateX(0);
    }
  }

  .dashboard-layout_backdrop {
    display: block;
    position: fixed;
    inset: 0;
    top: var(--nav-height);
    background: rgba(0, 0, 0, 0.4);
    z-index: 199;
  }

  .dashboard-layout_toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.3rem;
    position: fixed;
    top: calc(var(--nav-height) + var(--spacing-sm));
    right: var(--spacing-md);
    z-index: 201;
    padding: 0.5rem;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: background 0.15s ease;

    &:hover {
      background: var(--color-bg-hover, var(--color-border));
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  .toggle-bar {
    display: block;
    width: 1.25rem;
    height: 2px;
    background: var(--color-text);
    border-radius: 2px;
    transform-origin: center;
    transition:
      transform 0.3s cubic-bezier(0.23, 1, 0.32, 1),
      opacity 0.2s ease;

    &--top-open {
      transform: translateY(calc(0.3rem + 2px)) rotate(45deg);
    }

    &--mid-open {
      opacity: 0;
      transform: scaleX(0);
    }

    &--bot-open {
      transform: translateY(calc(-0.3rem - 2px)) rotate(-45deg);
    }
  }
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
