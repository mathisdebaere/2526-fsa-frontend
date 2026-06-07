<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'submit' | 'button' | 'reset'
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    fullWidth?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
  },
)
</script>

<template>
  <button data-testid="app-knop" :type="type" :disabled="disabled || loading" :aria-busy="loading" :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-full': fullWidth }]">
    <span v-if="loading" class="btn_spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-family: var(--font-body);
  font-weight: 600;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.3rem 0.75rem;
  font-size: var(--font-size-xs);
}
.btn-md {
  padding: 0.45rem 1rem;
  font-size: var(--font-size-sm);
}
.btn-lg {
  padding: 0.6rem 1.25rem;
  font-size: var(--font-size-base);
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.btn-secondary {
  background: none;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.btn-danger {
  background: var(--color-danger);
  color: #fff;
  border-color: var(--color-danger);
}
.btn-danger:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-ghost {
  background: none;
  color: var(--color-primary);
  border-color: var(--color-border);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.btn-full {
  width: 100%;
}

.btn_spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: btn-spin 0.5s linear infinite;
  flex-shrink: 0;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
