<script setup lang="ts">
import AppSkeleton from './AppSkeleton.vue'
</script>

<template>
  <div class="card skeleton-card" aria-hidden="true">
    <div class="skeleton-card_top">
      <AppSkeleton class="skeleton-card_avatar" />
      <AppSkeleton class="skeleton-card_badge" />
    </div>
    <div class="skeleton-card_body">
      <AppSkeleton class="skeleton-card_title" />
      <AppSkeleton class="skeleton-card_sub" />
      <AppSkeleton class="skeleton-card_line" />
      <AppSkeleton class="skeleton-card_line skeleton-card_line--short" />
    </div>
    <div class="skeleton-card_footer">
      <AppSkeleton class="skeleton-card_btn" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  pointer-events: none;
}

.skeleton-card_top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.skeleton-card_avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-card_badge {
  width: 5rem;
  height: 1.5rem;
  border-radius: 999px;
}

.skeleton-card_body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.skeleton-card_title {
  height: 1.25rem;
  width: 65%;
}

.skeleton-card_sub {
  height: 0.875rem;
  width: 45%;
}

.skeleton-card_line {
  height: 0.875rem;
}

.skeleton-card_line--short {
  width: 75%;
}

.skeleton-card_footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: var(--spacing-sm);
}

.skeleton-card_btn {
  width: 6rem;
  height: 2rem;
  border-radius: var(--border-radius);
}
</style>
