<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFormErrors } from '@/composables/useFormErrors'
import FormField from '@/components/molecules/FormField.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const auth = useAuthStore()
const router = useRouter()
const { fieldError, generalError, setFromApiError, clear } = useFormErrors()

type ContactMode = 'email' | 'phone'

const contactMode = ref<ContactMode>('email')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const emailConfirmation = ref('')
const phone = ref('')
const phoneConfirmation = ref('')
const role = ref<'volunteer' | 'client'>('client')
const password = ref('')
const passwordConfirmation = ref('')
const privacyAgreement = ref(false)
const submitted = ref(false)
const loading = ref(false)

function required(val: string, label: string) {
  if (!submitted.value) return null
  return val.trim() ? null : `${label} is verplicht.`
}

const firstNameError = computed(() => required(firstName.value, 'Voornaam'))
const lastNameError = computed(() => required(lastName.value, 'Achternaam'))

const emailError = computed(() => {
  if (!submitted.value) return null
  if (contactMode.value === 'email') {
    if (!email.value) return 'E-mailadres is verplicht.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Voer een geldig e-mailadres in.'
  } else if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return 'Voer een geldig e-mailadres in.'
  }
  return null
})

const emailConfirmError = computed(() => {
  if (!submitted.value) return null
  if (!email.value) return null
  if (emailConfirmation.value !== email.value) return 'E-mailadressen komen niet overeen.'
  return null
})

const phoneError = computed(() => {
  if (!submitted.value) return null
  if (contactMode.value === 'phone' && !phone.value.trim()) return 'Telefoonnummer is verplicht.'
  return null
})

const phoneConfirmError = computed(() => {
  if (!submitted.value) return null
  if (!phone.value) return null
  if (phoneConfirmation.value !== phone.value) return 'Telefoonnummers komen niet overeen.'
  return null
})

const passwordError = computed(() => {
  if (!submitted.value) return null
  if (!password.value) return 'Wachtwoord is verplicht.'
  if (password.value.length < 8) return 'Wachtwoord moet minstens 8 tekens bevatten.'
  return null
})

const confirmError = computed(() => {
  if (!submitted.value) return null
  if (!passwordConfirmation.value) return 'Bevestig uw wachtwoord.'
  if (password.value !== passwordConfirmation.value) return 'Wachtwoorden komen niet overeen.'
  return null
})

const privacyError = computed(() => {
  if (!submitted.value) return null
  return privacyAgreement.value ? null : 'U moet akkoord gaan met het privacybeleid.'
})

const hasErrors = computed(() => !!(firstNameError.value || lastNameError.value || emailError.value || emailConfirmError.value || phoneError.value || phoneConfirmError.value || passwordError.value || confirmError.value || privacyError.value))

async function handleSubmit() {
  submitted.value = true
  clear()
  if (hasErrors.value) return

  loading.value = true
  try {
    await auth.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value || undefined,
      phone: phone.value || undefined,
      role: role.value,
      contact_preference: contactMode.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      privacy_agreement: true,
    })
    router.push('/pending-approval')
  } catch (err) {
    setFromApiError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="register-form" novalidate aria-label="Registratieformulier" @submit.prevent="handleSubmit">
    <h2 class="register-form_title">Registreren</h2>

    <div class="register-form_toggle" role="group" aria-label="Contactmethode">
      <button type="button" class="register-form_toggle-btn" :class="{ 'register-form_toggle-btn--active': contactMode === 'email' }" :aria-pressed="contactMode === 'email'" @click="contactMode = 'email'">Via e-mail</button>
      <button type="button" class="register-form_toggle-btn" :class="{ 'register-form_toggle-btn--active': contactMode === 'phone' }" :aria-pressed="contactMode === 'phone'" @click="contactMode = 'phone'">Via telefoonnummer</button>
    </div>

    <div v-if="generalError" class="register-form_error" role="alert" aria-live="assertive">
      {{ generalError }}
    </div>

    <div class="register-form_row">
      <FormField v-model="firstName" label="Voornaam" :required="true" :error="firstNameError ?? fieldError('first_name')" autocomplete="given-name" />
      <FormField v-model="lastName" label="Achternaam" :required="true" :error="lastNameError ?? fieldError('last_name')" autocomplete="family-name" />
    </div>

    <template v-if="contactMode === 'email'">
      <FormField v-model="email" label="E-mailadres" type="email" :required="true" :error="emailError ?? fieldError('email')" autocomplete="email" />
      <FormField v-model="emailConfirmation" label="E-mailadres bevestigen" type="email" :required="true" :error="emailConfirmError" autocomplete="off" />
      <FormField v-model="phone" label="Telefoonnummer (optioneel)" type="tel" :error="fieldError('phone')" autocomplete="tel" />
      <FormField v-if="phone" v-model="phoneConfirmation" label="Telefoonnummer bevestigen" type="tel" :error="phoneConfirmError" autocomplete="off" />
    </template>

    <template v-else>
      <div class="register-form_row">
        <FormField v-model="phone" label="Telefoonnummer" type="tel" :required="true" :error="phoneError ?? fieldError('phone')" autocomplete="tel" />
        <FormField v-model="phoneConfirmation" label="Telefoonnummer bevestigen" type="tel" :required="true" :error="phoneConfirmError" autocomplete="off" />
      </div>
      <FormField v-model="email" label="Account e-mailadres (optioneel)" type="email" :error="emailError ?? fieldError('email')" autocomplete="email" />
      <FormField v-if="email" v-model="emailConfirmation" label="E-mailadres bevestigen" type="email" :error="emailConfirmError" autocomplete="off" />
    </template>

    <div class="form-group">
      <label for="reg-role" class="field-label">Ik ben een</label>
      <select id="reg-role" v-model="role" class="register-form_select" required>
        <option value="client">Dienstvrager (ik zoek hulp)</option>
        <option value="volunteer">Vrijwilliger (ik wil helpen)</option>
      </select>
    </div>

    <FormField v-model="password" label="Wachtwoord" type="password" :required="true" :error="passwordError ?? fieldError('password')" autocomplete="new-password" />
    <FormField v-model="passwordConfirmation" label="Wachtwoord bevestigen" type="password" :required="true" :error="confirmError ?? fieldError('password_confirmation')" autocomplete="new-password" />

    <div class="form-group">
      <label class="register-form_checkbox-label">
        <input v-model="privacyAgreement" type="checkbox" class="register-form_checkbox" :aria-invalid="!!privacyError" required />
        Ik ga akkoord met het
        <RouterLink to="/privacy" target="_blank">privacybeleid</RouterLink>
      </label>
      <span v-if="privacyError" class="register-form_field-error" role="alert">{{ privacyError }}</span>
    </div>

    <AppButton type="submit" :loading="loading" full-width size="lg"> Registreren </AppButton>

    <p class="register-form_login">
      Al een account?
      <RouterLink to="/login">Aanmelden</RouterLink>
    </p>
  </form>
</template>

<style scoped lang="scss">
.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 52rem;
  background: var(--color-bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.register-form_title {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
  text-align: center;
}

.register-form_toggle {
  display: flex;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.register-form_toggle-btn {
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

.register-form_toggle-btn:not(:last-child) {
  border-right: 2px solid var(--color-border);
}

.register-form_toggle-btn--active {
  background: var(--color-primary);
  color: #fff;
}

.register-form_toggle-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: -2px;
}

.register-form_error {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-danger);
}

.register-form_row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

@include breakpoint(sm) {
  .register-form {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
    border-radius: var(--border-radius);
  }

  .register-form_row {
    grid-template-columns: 1fr;
  }
}

.field-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-bottom: 0.375rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.register-form_select {
  padding: 0.65rem 0.875rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: var(--font-size-base);
  background: var(--color-bg-card);
  color: var(--color-text);
}

.register-form_select:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.register-form_checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.register-form_checkbox {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  accent-color: var(--color-primary);
  margin-top: 0.1rem;
}

.register-form_field-error {
  margin-top: 0.25rem;
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

.register-form_login {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
