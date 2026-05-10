<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue'
</script>

<template>
  <main>
    <LoginForm />
  </main>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

main {
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    color: $text;

    &:focus-visible { @include focus-ring; }
  }
}
</style>
