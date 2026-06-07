<script setup lang="ts">
import AppNavbar from '@/components/organisms/AppNavbar.vue'
import ToastContainer from '@/components/organisms/ToastContainer.vue'
</script>

<template>
  <a href="#main-content" class="skip-link">Ga naar inhoud</a>
  <AppNavbar />
  <div class="dashboard-layout">
    <aside class="dashboard-layout_sidebar" aria-label="Navigatie">
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

@include breakpoint(md) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .dashboard-layout_sidebar {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: var(--spacing-md);
  }
}
</style>
