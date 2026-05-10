<script setup lang="ts">
defineProps<{
  type?: 'submit' | 'button' | 'reset'
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button :type="type ?? 'button'" :disabled="disabled || loading" class="app-button">
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.app-button {
  padding: 0.65rem;
  background: $nav-accent;
  color: #fff;
  border: 0.0625rem solid white;
  border-radius: $radius;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity $transition;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { @include focus-ring; }
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 0.125rem solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
