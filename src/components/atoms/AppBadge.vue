<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <span data-testid="app-badge" :class="['badge', `badge-${variant ?? 'default'}`, size ? `badge-${size}` : '']">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.badge-sm {
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
}
.badge-lg {
  padding: 0.35rem 1rem;
  font-size: var(--font-size-sm);
}

.badge-default {
  background: #e8edf2;
  color: #3a4a56;
}
.badge-primary {
  background: var(--color-primary, #004870);
  color: #fff;
}
.badge-success {
  background: #7ca79f75;
  color: #000000;
}
.badge-warning {
  background: var(--color-yellow, #f6d977);
  color: #6b4a00;
}
.badge-danger {
  background: var(--color-rose, #ecc2bc);
  color: #7a1a14;
}
.badge-info {
  background: var(--color-primary-light, #e6f0f7);
  color: var(--color-primary, #004870);
}
</style>
