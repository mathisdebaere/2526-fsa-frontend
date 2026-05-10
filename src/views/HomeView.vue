<script setup lang="ts">
</script>

<template>
  <main>
    <h1 tabindex="-1">Home</h1>
    <p>Welcome on this brol website voorlopig</p>
  </main>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

main {
  h1 {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    color: $text;
    &:focus-visible { @include focus-ring; }
  }

  p { color: $text-muted; }
}
</style>
