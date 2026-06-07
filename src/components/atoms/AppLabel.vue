<script setup lang="ts">
defineProps<{
  for?: string
  required?: boolean
}>()
</script>

<template>
  <label :for="$props.for" class="app-label">
    <slot />
  </label>
</template>

<style scoped>
.app-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.375rem;
}
</style>
