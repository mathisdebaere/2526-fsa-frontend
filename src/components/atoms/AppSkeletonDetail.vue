<script setup lang="ts">
import AppSkeleton from './AppSkeleton.vue'
</script>

<template>
  <div class="skeleton-detail" aria-hidden="true">
    <div class="card skeleton-detail_header">
      <div class="skeleton-detail_header-top">
        <AppSkeleton class="skeleton-detail_avatar" />
        <div class="skeleton-detail_header-info">
          <AppSkeleton class="skeleton-detail_title" />
          <AppSkeleton class="skeleton-detail_sub" />
        </div>
        <AppSkeleton class="skeleton-detail_badge" />
      </div>
    </div>

    <div class="skeleton-detail_sections">
      <div class="card skeleton-detail_section">
        <AppSkeleton class="skeleton-detail_section-title" />
        <AppSkeleton class="skeleton-detail_line" />
        <AppSkeleton class="skeleton-detail_line skeleton-detail_line--short" />
        <AppSkeleton class="skeleton-detail_line" />
      </div>

      <div class="card skeleton-detail_section">
        <AppSkeleton class="skeleton-detail_section-title" />
        <AppSkeleton class="skeleton-detail_line skeleton-detail_line--short" />
        <AppSkeleton class="skeleton-detail_line" />
        <AppSkeleton class="skeleton-detail_line skeleton-detail_line--mid" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  pointer-events: none;
}

.skeleton-detail_header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.skeleton-detail_header-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.skeleton-detail_avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-detail_header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.skeleton-detail_title {
  height: 1.5rem;
  width: 55%;
}

.skeleton-detail_sub {
  height: 1rem;
  width: 35%;
}

.skeleton-detail_badge {
  width: 6rem;
  height: 1.75rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.skeleton-detail_sections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(22rem, 100%), 1fr));
  gap: var(--spacing-md);
}

.skeleton-detail_section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.skeleton-detail_section-title {
  height: 1.1rem;
  width: 40%;
  margin-bottom: 0.25rem;
}

.skeleton-detail_line {
  height: 0.875rem;
}

.skeleton-detail_line--short {
  width: 40%;
}

.skeleton-detail_line--mid {
  width: 65%;
}
</style>
