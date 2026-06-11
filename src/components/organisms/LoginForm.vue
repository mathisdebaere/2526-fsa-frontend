<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormField from '@/components/molecules/FormField.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

type ContactMode = 'email' | 'phone'

const contactMode = ref<ContactMode>('email')
const email = ref('')
const phone = ref('')
const password = ref('')
const submitted = ref(false)
const loading = ref(false)
const serverError = ref<string | null>(null)

const emailError = computed(() => {
  if (!submitted.value || contactMode.value !== 'email') return null
  if (!email.value) return 'E-mail is een verplicht veld en werd niet ingevuld.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Het ingegeven e-mailadres is ongeldig.'
  return null
})

const phoneError = computed(() => {
  if (!submitted.value || contactMode.value !== 'phone') return null
  if (!phone.value.trim()) return 'Telefoonnummer is een verplicht veld en werd niet ingevuld.'
  return null
})

const passwordError = computed(() => {
  if (!submitted.value) return null
  if (!password.value) return 'Wachtwoord is een verplicht veld en werd niet ingevuld.'
  return null
})

async function tryLogin() {
  submitted.value = true
  serverError.value = null
  if (emailError.value || phoneError.value || passwordError.value) return

  loading.value = true
  try {
    const payload = contactMode.value === 'email' ? { email: email.value, password: password.value } : { phone: phone.value, password: password.value }
    await auth.login(payload)
    if (auth.isPendingApproval) {
      router.push('/pending-approval')
    } else {
      const redirect = (route.query.redirect as string) ?? '/dashboard'
      router.push(redirect)
    }
  } catch (err) {
    type ApiErr = { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } }
    const e = err as ApiErr
    const status = e?.response?.status
    if (status === 422) {
      const errors = e.response?.data?.errors
      if (errors?.email?.[0]) serverError.value = errors.email[0]
      else if (errors?.phone?.[0]) serverError.value = errors.phone[0]
      else if (errors?.password?.[0]) serverError.value = errors.password[0]
      else serverError.value = e.response?.data?.message ?? 'Ongeldige invoer.'
    } else if (status === 401) {
      serverError.value = 'Ongeldige login gegevens'
    } else if (status === 419) {
      serverError.value = 'Je sessie is verlopen, probeer opnieuw'
    } else if (status === 500) {
      serverError.value = 'Serverfout! Probeer later opnieuw'
    } else {
      serverError.value = e?.response?.data?.message ?? 'Er is iets misgegaan, probeer opnieuw'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="login-form" novalidate aria-label="Aanmeldformulier" @submit.prevent="tryLogin">
    <h2 class="login-form_title">Aanmelden</h2>

    <div class="login-form_toggle" role="group" aria-label="Aanmeldmethode">
      <button type="button" class="login-form_toggle-btn" :class="{ 'login-form_toggle-btn--active': contactMode === 'email' }" :aria-pressed="contactMode === 'email'" @click="contactMode = 'email'">Via e-mail</button>
      <button type="button" class="login-form_toggle-btn" :class="{ 'login-form_toggle-btn--active': contactMode === 'phone' }" :aria-pressed="contactMode === 'phone'" @click="contactMode = 'phone'">Via telefoonnummer</button>
    </div>

    <div v-if="serverError" class="login-form_error" role="alert" aria-live="assertive">
      {{ serverError }}
    </div>

    <FormField v-if="contactMode === 'email'" id="email" v-model="email" label="E-mailadres" type="email" :error="emailError" autocomplete="email" />

    <FormField v-else id="phone" v-model="phone" label="Telefoonnummer" type="tel" :error="phoneError" autocomplete="tel" />

    <FormField id="password" v-model="password" label="Wachtwoord" type="password" :error="passwordError" autocomplete="current-password" />

    <AppButton type="submit" :loading="loading" full-width size="lg"> Aanmelden </AppButton>

    <p class="login-form_register">
      Nog geen account?
      <RouterLink to="/register">Registreer hier</RouterLink>
    </p>
  </form>
</template>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 40rem;
  background: var(--color-bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.login-form_title {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
  text-align: center;
}

.login-form_toggle {
  display: flex;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.login-form_toggle-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  font-family: inherit;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
}

.login-form_toggle-btn:not(:last-child) {
  border-right: 2px solid var(--color-border);
}

@media (max-width: 28rem) {
  .login-form_toggle {
    flex-direction: column;
  }
  .login-form_toggle-btn:not(:last-child) {
    border-right: none;
    border-bottom: 2px solid var(--color-border);
  }
}

.login-form_toggle-btn--active {
  background: var(--color-primary);
  color: #fff;
}

.login-form_toggle-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: -2px;
}

.login-form_error {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-danger);
}

.login-form_register {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
}

@include breakpoint(sm) {
  .login-form {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
    border-radius: var(--border-radius);
  }
}
</style>
