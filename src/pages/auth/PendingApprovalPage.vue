<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/atoms/AppButton.vue'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="pending-page">
    <div class="pending-card">
      <i class="fa-solid fa-circle-check pending-card_icon" aria-hidden="true"></i>

      <h1 class="pending-card_title">Registratie ontvangen</h1>

      <p class="pending-card_message">
        We hebben je registratie ontvangen.<br />
        We nemen contact met je op om een intake in te plannen.
      </p>

      <p class="pending-card_note">Zodra een adviseur je account heeft goedgekeurd, krijg je toegang</p>

      <div class="pending-card_actions">
        <AppButton @click="router.push('/login')"> Ga terug naar inlogpagina </AppButton>

        <AppButton v-if="auth.isAuthenticated" variant="ghost" size="sm" @click="handleLogout"> Afmelden </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pending-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  padding: var(--spacing-xl) var(--spacing-lg);
}

.pending-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 30rem;
  background: var(--color-bg-card);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.pending-card_icon {
  color: var(--color-primary);
  font-size: 3.25rem;
  line-height: 1;
}

.pending-card_title {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
  margin: 0;
}

.pending-card_message {
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: 1.7;
  margin: 0;
}

.pending-card_note {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.pending-card_actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
}
</style>
