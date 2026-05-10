<script setup lang="ts">
</script>

<template>
  <main>
    <h1 tabindex="-1">About</h1>
    <p>This is nog een nutteloos paginaatke</p>
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

  p { color: $text-muted; }
}
</style>
