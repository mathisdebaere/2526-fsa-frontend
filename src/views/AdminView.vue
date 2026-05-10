<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <main>
    <h1 tabindex="-1">Admin</h1>
    <p>Welcom, {{ auth.user?.name }} ({{ auth.user?.role }})</p>
  </main>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

main {
  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
    color: $text;
    &:focus-visible { @include focus-ring; }
  }

  p {
    color: $text-muted;
    margin-bottom: 0.4rem;

    code {
      padding: 0.15rem 0.4rem;
      border-radius: $radius;
      color: $nav-accent;
      font-size: 0.875rem;
    }
  }
}
</style>
