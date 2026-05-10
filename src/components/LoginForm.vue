<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormField from '@/components/FormField.vue'
import AppButton from '@/components/AppButton.vue'
import FormError from '@/components/FormError.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const submitted = ref(false)
const loading = ref(false)
const serverError = ref<string | null>(null)

const emailError = computed(() => {
  if (!submitted.value) return null
  if (!email.value) return 'E-mail is een verplicht veld en werd niet ingevuld.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Het ingegeven e-mail adres is ongeldig. Voer een geldig e-mailadres in.'
  return null
})

const passwordError = computed(() => {
  if (!submitted.value) return null
  if (!password.value) return 'Wachtwoord is een verplicht veld en werd niet ingevuld.'
  return null
})

const tryLogin = async () => {
  submitted.value = true
  serverError.value = null
  if (emailError.value || passwordError.value) return
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    const redirect = (route.query.redirect as string) ?? '/dashboard'
    router.push(redirect)
  } catch (err: any) {
    const status = err.response?.status
    if (status === 422) {
      const errors = err.response?.data?.errors
      if (errors?.email?.[0]) serverError.value = errors.email[0]
      else if (errors?.password?.[0]) serverError.value = errors.password[0]
      else serverError.value = err.response?.data?.message ?? 'Ongeldige foutje.'
    } else if (status === 419) {
      serverError.value = 'Sessiefoutje.'
    } else if (status === 500) {
      serverError.value = 'Serverfoutje'
    } else if (status === 404) {
      serverError.value = 'Not found foutje.'
    } else {
      serverError.value = err.response?.data?.message ?? 'Foutje.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="tryLogin" novalidate>
    <h2>Aanmelden</h2>
    <FormError :message="serverError" />
    <FormField
      id="email"
      v-model="email"
      type="email"
      :required="true"
      label="E-mail"
      :error="emailError"
    />
    <FormField
      id="password"
      v-model="password"
      type="password"
      :required="true"
      label="Wachtwoord"
      :error="passwordError"
    />
    <AppButton type="submit" :loading="loading">Aanmelden</AppButton>
  </form>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

form {
  width: 100%;
  max-width: 23.75rem;
  background: $nav-bg;
  padding: 2rem;
  border-radius: $radius * 2;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  h2 {
    font-size: 1.3rem;
    color: $text;
    margin-bottom: 0.25rem;
  }
}
</style>
