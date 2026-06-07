<script setup lang="ts">
import AppSidebar from '@/components/organisms/AppSidebar.vue'
import ToastContainer from '@/components/organisms/ToastContainer.vue'
</script>

<template>
  <a href="#main-content" class="skip-link">Ga naar inhoud</a>

  <div class="page-layout">
    <AppSidebar />
    <main id="main-content" class="page-layout_main">
      <div class="page-layout_content">
        <slot />
      </div>
    </main>
  </div>

  <ToastContainer />
</template>

<style scoped lang="scss">
.page-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

.page-layout_main {
  flex: 1;
  min-width: 0;
  margin-left: 15rem;
}

.page-layout_content {
  width: 100%;
  padding: 2.5rem 2rem;
  box-sizing: border-box;
}

@include breakpoint(md) {
  .page-layout_main {
    margin-left: 0 !important;
    padding-top: 4rem;
  }

  .page-layout_content {
    padding: 1.25rem 1rem;
  }
}

@include breakpoint(mob) {
  .page-layout_content {
    padding: 1rem 0.75rem;
  }
}
</style>
