<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import AppIcon from '@/components/atoms/AppIcon.vue'

const ui = useUiStore()

const iconMap: Record<string, string> = {
  success: 'check',
  error: 'warning',
  info: 'info',
}
</script>

<template>
  <div class="toast-container" role="region" aria-live="polite" aria-label="Meldingen">
    <TransitionGroup name="toast">
      <div v-for="toast in ui.toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`]" role="status">
        <AppIcon :name="iconMap[toast.type] ?? 'info'" :size="18" aria-hidden="true" />
        <span class="toast_msg">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 24rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.875rem var(--spacing-md);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  pointer-events: all;
}

.toast-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}
.toast-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}
.toast-info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.toast_msg {
  flex: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
