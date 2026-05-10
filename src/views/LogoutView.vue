<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await auth.logout()
  setTimeout(() => router.push({ name: 'home' }), 1000)
})
</script>

<template>
  <main>
    <div class="logout-card" role="status" aria-live="polite">
      <p class="message">Saluukess</p>
      <p class="sub">You're being logged out</p>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.logout-card {
  text-align: center;
  padding: 3rem 4rem;

  .message {
    font-size: 1.5rem;
    font-weight: 600;
    color: $text;
    margin-bottom: 0.75rem;
  }

  .sub {
    color: $text-muted;
    font-size: 0.95rem;
  }
}
</style>
