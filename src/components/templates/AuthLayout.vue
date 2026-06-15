<script setup lang="ts">
import ToastContainer from '@/components/organisms/ToastContainer.vue'

withDefaults(
  defineProps<{
    showHeader?: boolean
  }>(),
  {
    showHeader: true,
  },
)
</script>

<template>
  <a href="#main-content" class="skip-link">Ga naar inhoud</a>
  <div class="auth-layout">
    <header v-if="showHeader" class="auth-layout_header">
      <RouterLink to="/" class="auth-layout_logo-link" aria-label="FijneWijk – naar homepage">
        <img src="@/assets/images/logo.png" alt="" aria-hidden="true" class="auth-layout_logo" />
      </RouterLink>
    </header>
    <RouterLink v-else to="/" class="link-btn auth-layout_home-link">
      <i class="fa-solid fa-angle-left"></i>
      <span>Terug naar homepagina</span>
    </RouterLink>
    <main id="main-content" class="auth-layout_main">
      <slot />
    </main>
    <footer class="auth-layout_footer">
      <p>© 2026 FijneWijk</p>
    </footer>
  </div>
  <ToastContainer />
</template>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-primary-light);
}

.auth-layout_header {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--color-bg-nav);
}

.auth-layout_logo-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: #fff;
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.auth-layout_logo {
  height: 2.5rem;
  width: auto;
}

.auth-layout_home-link {
  align-self: flex-start;
  margin: var(--spacing-lg) var(--spacing-xl) 0;
}

@include breakpoint(sm) {
  .auth-layout_home-link {
    margin: var(--spacing-md) var(--spacing-md) 0;
  }
}

.auth-layout_main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

@include breakpoint(sm) {
  .auth-layout_main {
    padding: var(--spacing-lg) var(--spacing-sm);
    align-items: flex-start;
  }
}

.auth-layout_footer {
  padding: var(--spacing-lg);
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
