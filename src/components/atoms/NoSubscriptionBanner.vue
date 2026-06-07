<script setup lang="ts">
withDefaults(defineProps<{ expired?: boolean }>(), { expired: false })
</script>

<template>
  <div class="no-sub" role="alert">
    <i class="fa-solid fa-triangle-exclamation no-sub_icon" aria-hidden="true"></i>
    <div>
      <p class="no-sub_title">
        {{ expired ? 'Abonnement verlopen' : 'Geen actief abonnement' }}
      </p>
      <p class="no-sub_text">
        {{ expired ? 'Je abonnement is verlopen. Neem contact op via 0468 28 50 69 of info@zilverschakel.com.' : 'Je kan deze pagina niet bekijken omdat je geen actief abonnement hebt. Neem contact op via 0468 28 50 69 of info@zilverschakel.com.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.no-sub {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: var(--color-warning-light);
  border: 1px solid var(--color-warning);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  color: #92400e;
}

.no-sub_icon {
  flex-shrink: 0;
  margin-top: 0.2rem;
  font-size: 1.5rem;
}

.no-sub_title {
  font-weight: 700;
  font-size: var(--font-size-base);
  margin: 0 0 0.25rem;
}

.no-sub_text {
  font-size: var(--font-size-sm);
  margin: 0;
  color: var(--color-text);
}
</style>
