<template>
  <span class="skeleton" aria-hidden="true" />
</template>

<style scoped>
.skeleton {
  display: block;
  background: linear-gradient(90deg, var(--color-border) 25%, color-mix(in srgb, var(--color-border) 40%, var(--color-bg-card)) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
  border-radius: var(--border-radius);
  width: 100%;
  height: 1rem;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
