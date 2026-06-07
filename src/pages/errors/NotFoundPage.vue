<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AuthLayout from '@/components/templates/AuthLayout.vue'
import AppButton from '@/components/atoms/AppButton.vue'
</script>

<template>
  <AuthLayout>
    <div class="error-page" role="main">
      <i class="fa-solid fa-magnifying-glass error-page_icon" aria-hidden="true"></i>
      <h1 class="error-page_code">helaas...</h1>
      <h2 class="error-page_title">Pagina niet gevonden</h2>
      <p class="error-page_desc">De pagina die u zoekt bestaat niet of u hebt geen toegang.</p>
      <RouterLink to="/dashboard">
        <AppButton variant="primary" size="lg">Terug naar dashboard</AppButton>
      </RouterLink>
    </div>
  </AuthLayout>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  gap: var(--spacing-md);
}

.error-page_icon {
  font-size: 4rem;
}
.error-page_code {
  font-size: 5rem;
  font-weight: 900;
  color: var(--color-primary);
  line-height: 1;
}
.error-page_title {
  font-size: var(--font-size-2xl);
}
.error-page_desc {
  color: var(--color-text-muted);
  max-width: 24rem;
}
</style>
