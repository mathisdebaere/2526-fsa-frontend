<script setup lang="ts">
defineProps<{
  message: string | null | undefined
}>()
</script>

<template>
  <p v-if="message" role="alert" class="form-error">{{ message }}</p>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.form-error {
  background: rgba(255, 51, 51, 0.2);
  padding: 0.6rem 0.8rem;
  border: 1px solid rgba(255, 51, 51, 0.541);
  border-radius: $radius;
  color: rgba(145, 6, 6, 0.589);
  font-size: 0.875rem;
}
</style>
