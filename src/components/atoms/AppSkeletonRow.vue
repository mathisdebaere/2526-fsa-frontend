<script setup lang="ts">
import AppSkeleton from './AppSkeleton.vue'
</script>

<template>
  <div class="card skeleton-row" aria-hidden="true">
    <AppSkeleton class="skeleton-row_avatar" />
    <div class="skeleton-row_body">
      <AppSkeleton class="skeleton-row_title" />
      <AppSkeleton class="skeleton-row_sub" />
    </div>
    <AppSkeleton class="skeleton-row_badge" />
  </div>
</template>

<style scoped>
.skeleton-row {
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-md);
  pointer-events: none;
}

.skeleton-row_avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-row_body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.skeleton-row_title {
  height: 1rem;
  width: 50%;
}

.skeleton-row_sub {
  height: 0.8rem;
  width: 75%;
}

.skeleton-row_badge {
  width: 5rem;
  height: 1.5rem;
  border-radius: 999px;
  flex-shrink: 0;
}
</style>
