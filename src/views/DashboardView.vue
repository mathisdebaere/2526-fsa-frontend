<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <main>
    <h1 tabindex="-1">Dashboard</h1>
    <p>Welcome, {{ auth.user?.name }}.</p>
    <pre>{{ auth.user }}</pre>
  </main>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

main {
  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: $text;
    &:focus-visible { @include focus-ring; }
  }

  p { color: $text-muted; margin-bottom: 1rem; }

  pre {
    padding: 1.25rem;
    background-color: $nav-bg;
    border-radius: $radius * 2;
    font-size: 0.85rem;
    color: $text;
    overflow-x: auto;
    box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.3);
  }
}
</style>
