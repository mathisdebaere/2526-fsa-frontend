<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { Intake, Appointment } from '@/types/api'
import { formatDate, formatDateShort, formatDateTimeShort } from '@/utils/date'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()
const cache = useQueryCache()

const auth = useAuthStore()
const toast = useToast()
const intakeId = computed(() => Number(route.params.id))

const { data: intake, isLoading } = useQuery({
  key: () => ['intakes', intakeId.value],
  query: () => api.get<Intake>(`/intakes/${intakeId.value}?include=user,appointment`),
})

const user = computed(() => intake.value?.user ?? null)
const userId = computed(() => intake.value?.user_id ?? null)

// --- Contact toggle ---
const showContact = ref(false)

// --- Schedule appointment ---
const appointmentDate = ref('')
const appointmentTime = ref('')
const appointmentLocation = ref('')
const appointmentError = ref('')

const appointmentEndTime = computed(() => {
  if (!appointmentTime.value) return ''
  const [h = 0, m = 0] = appointmentTime.value.split(':').map(Number)
  const end = new Date(0, 0, 0, h + 1, m)
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
})

const { mutate: scheduleAppointment, isLoading: appointmentLoading } = useMutation({
  mutation: async () => {
    const appt = await api.post<Appointment>('/appointments', {
      type: 'introduction',
      date: appointmentDate.value,
      start_time: appointmentTime.value,
      end_time: appointmentEndTime.value,
      location: appointmentLocation.value,
      status: 'planned',
      user_id: userId.value,
    })
    await api.put(`/intakes/${intakeId.value}`, {
      appointment_id: appt.id,
      status: 'scheduled',
    })
    return appt
  },
  onSuccess() {
    cache.invalidateQueries({ key: ['intakes', intakeId.value] })
    cache.invalidateQueries({ key: ['intakes', 'pending'] })
    cache.invalidateQueries({ key: ['intakes', 'scheduled'] })
    toast.success('Afspraak succesvol ingepland.')
    appointmentDate.value = ''
    appointmentTime.value = ''
    appointmentLocation.value = ''
  },
  onError(err: unknown) {
    appointmentError.value = (err as Error).message ?? 'Er is iets misgegaan.'
  },
})

function handleSchedule() {
  appointmentError.value = ''
  if (!appointmentDate.value || !appointmentTime.value || !appointmentLocation.value) {
    appointmentError.value = 'Vul alle velden in.'
    return
  }
  scheduleAppointment()
}

const { mutate: verifyUser, isLoading: verifyLoading } = useMutation({
  mutation: async () => {
    await api.patch(`/users/${userId.value}/verify`, {})
    const appointmentId = intake.value?.appointment?.id
    if (appointmentId) {
      await api.delete(`/appointments/${appointmentId}`)
    }
  },
  onSuccess() {
    cache.invalidateQueries({ key: ['intakes', 'pending'] })
    cache.invalidateQueries({ key: ['intakes', 'scheduled'] })
    cache.invalidateQueries({ key: ['appointments'] })
    cache.invalidateQueries({ key: ['client-matches'] })
    router.push('/intakes')
  },
})

const { showConfirmationDialog } = useConfirmDialog()

async function handleVerify() {
  const ok = await showConfirmationDialog('Weet je zeker dat je deze gebruiker wilt verifiëren? De gebruiker krijgt toegang tot het platform.')
  if (ok) verifyUser()
}

const { mutate: rejectUser, isLoading: rejectLoading } = useMutation({
  mutation: async () => {
    await api.delete(`/users/${userId.value}`)
  },
  onSuccess() {
    cache.invalidateQueries({ key: ['intakes', 'pending'] })
    router.push('/intakes')
  },
})

async function handleReject() {
  const ok = await showConfirmationDialog('Weet je zeker dat je deze gebruiker wilt afwijzen? Deze actie kan niet ongedaan worden.')
  if (ok) rejectUser()
}

interface TimelineEvent {
  label: string
  date: string
  icon: 'registered' | 'appointment' | 'verified'
}

const timeline = computed((): TimelineEvent[] => {
  const events: TimelineEvent[] = []
  if (intake.value?.created_at) {
    events.push({ label: 'Aanvraag geplaatst', date: intake.value.created_at, icon: 'registered' })
  }
  if (intake.value?.appointment) {
    events.push({
      label: `Intake ingepland op ${formatDateShort(intake.value.appointment.date)}`,
      date: intake.value.appointment.date,
      icon: 'appointment',
    })
  }
  if (user.value?.account_status === 'verified') {
    events.push({ label: 'Geverifieerd', date: user.value.updated_at, icon: 'verified' })
  }
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

const roleLabels: Record<string, string> = {
  client: 'Dienstvrager',
  volunteer: 'Vrijwilliger',
  advisor: 'Adviseur',
}

const notesText = ref('')
const editingNotes = ref(false)

watch(
  () => intake.value?.notes,
  (val) => {
    notesText.value = val ?? ''
  },
  { immediate: true },
)

function cancelNotesEdit() {
  editingNotes.value = false
  notesText.value = intake.value?.notes ?? ''
}

const { mutate: saveNotes, isLoading: savingNotes } = useMutation({
  mutation: () => api.put(`/intakes/${intakeId.value}`, { notes: notesText.value }),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['intakes', intakeId.value] })
    toast.success('Notities opgeslagen.')
    editingNotes.value = false
  },
  onError: () => toast.error('Opslaan mislukt.'),
})
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <div class="page_back">
        <button class="back-btn" @click="router.push('/intakes')"><i class="fa-solid fa-angle-left"></i> Terug</button>
      </div>
      <AppSpinner v-if="isLoading" label="Intake wordt ingeladen..." />

      <div v-else-if="intake && user" class="intake-grid">
        <div class="intake-col">
          <section class="card" aria-labelledby="user-heading">
            <h2 id="user-heading" class="card_label">Gebruiker</h2>
            <div class="user-block">
              <AppAvatar :src="user.profile_photo_url" :name="`${user.first_name} ${user.last_name}`" size="lg" />
              <div class="user-block_info">
                <p class="user-block_name">{{ user.first_name }} {{ user.last_name }}</p>
                <p class="user-block_role">
                  Wilt registreren als: <strong>{{ roleLabels[user.role] ?? user.role }}</strong>
                </p>
                <p class="user-block_date">Aangevraagd op {{ formatDate(intake.created_at) }}</p>
              </div>
            </div>

            <button class="contact-toggle" @click="showContact = !showContact">
              {{ showContact ? 'Verberg contactgegevens' : 'Toon contactgegevens' }}
            </button>

            <div v-if="showContact" class="contact-details" role="region" aria-label="Contactgegevens">
              <p v-if="user.email"><span class="contact-details_label">E-mail</span> {{ user.email }}</p>
              <p v-if="user.phone"><span class="contact-details_label">Telefoon</span> {{ user.phone }}</p>
              <p v-if="!user.email && !user.phone" class="contact-details_empty">Geen contactgegevens beschikbaar.</p>
            </div>
          </section>

          <section class="card" aria-labelledby="schedule-heading">
            <h2 id="schedule-heading" class="card_title">
              {{ intake.status === 'scheduled' ? 'Afspraak herplannen' : 'Plan afspraak in' }}
            </h2>

            <div v-if="intake.appointment" class="current-appointment">
              <p class="current-appointment_label">Huidige afspraak</p>
              <p class="current-appointment_value">{{ formatDate(intake.appointment.date) }} om {{ intake.appointment.start_time }}</p>
              <p class="current-appointment_location">{{ intake.appointment.location }}</p>
            </div>

            <div v-if="appointmentError" class="alert alert-error" role="alert">{{ appointmentError }}</div>
            <div class="form-group">
              <label for="appointment-date" class="form-label">Gewenste datum</label>
              <input id="appointment-date" v-model="appointmentDate" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label for="appointment-time" class="form-label">Gewenste tijd</label>
              <input id="appointment-time" v-model="appointmentTime" type="time" class="form-input" />
            </div>
            <div class="form-group">
              <label for="appointment-location" class="form-label">Locatie / adres</label>
              <input id="appointment-location" v-model="appointmentLocation" type="text" class="form-input" />
            </div>

            <AppButton full-width :loading="appointmentLoading" @click="handleSchedule"> Bevestig afspraak </AppButton>
          </section>
        </div>

        <div class="intake-col">
          <section class="card" aria-labelledby="actions-heading">
            <h2 id="actions-heading" class="card_title">Acties</h2>
            <div class="actions-stack">
              <AppButton variant="primary" full-width :loading="verifyLoading" :disabled="!intake.appointment" :title="!intake.appointment ? 'Plan eerst een afspraak in voor je de gebruiker verifieert' : undefined" @click="handleVerify"> Gebruiker verifiëren </AppButton>
              <p v-if="!intake.appointment" class="verify-hint">Verifiëren is pas mogelijk na het inplannen van een afspraak.</p>

              <AppButton variant="danger" full-width :loading="rejectLoading" @click="handleReject"> Gebruiker afwijzen </AppButton>
            </div>
          </section>

          <section class="card" aria-labelledby="timeline-heading">
            <h2 id="timeline-heading" class="card_title">Tijdlijn</h2>
            <ol class="timeline" aria-label="Geschiedenis van deze intake">
              <li v-for="(event, i) in timeline" :key="i" class="timeline_item">
                <span class="timeline_dot" :class="`timeline_dot-${event.icon}`" aria-hidden="true" />
                <div class="timeline_content">
                  <p class="timeline_label">{{ event.label }}</p>
                  <time class="timeline_time" :datetime="event.date">{{ formatDateTimeShort(event.date) }}</time>
                </div>
              </li>
              <li v-if="!timeline.length" class="timeline_empty">Nog geen activiteit.</li>
            </ol>
          </section>
          <section v-if="auth.isAdvisor" class="card notes-card" aria-labelledby="notes-heading">
            <div class="notes-card_header">
              <h2 id="notes-heading" class="card_title">Interne notities</h2>
              <button v-if="!editingNotes" class="notes-card_edit-btn" @click="editingNotes = true">Bewerken</button>
            </div>

            <template v-if="!editingNotes">
              <p v-if="intake?.notes" class="notes-card_text">{{ intake.notes }}</p>
              <p v-else class="notes-card_empty">Nog geen notities toegevoegd.</p>
            </template>

            <template v-else>
              <textarea v-model="notesText" class="notes-card_textarea" rows="6" aria-label="Interne notities" />
              <div class="notes-card_actions">
                <AppButton size="sm" :loading="savingNotes" @click="saveNotes()">Opslaan</AppButton>
                <AppButton variant="ghost" size="sm" @click="cancelNotesEdit">Annuleren</AppButton>
              </div>
            </template>
          </section>
        </div>
      </div>

      <p v-else-if="!isLoading" class="page_empty">Intake niet gevonden.</p>
    </div>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.page_back {
  margin-bottom: var(--spacing-xs);
}
.page_empty {
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--spacing-2xl) 0;
}

.intake-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  align-items: start;
}
@include breakpoint(md) {
  .intake-grid {
    grid-template-columns: 1fr;
  }
}

.intake-col {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card_label {
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0;
}
.card_title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.user-block {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}
.user-block_info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.user-block_name {
  font-size: var(--font-size-base);
  font-weight: 700;
  margin: 0;
}
.user-block_role {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}
.user-block_date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.contact-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 0.4rem 0.75rem;
  font-family: inherit;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  align-self: flex-start;
}
.contact-toggle:hover {
  background: var(--color-primary-light);
}
.contact-toggle:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.contact-details p {
  margin: 0;
  font-size: var(--font-size-sm);
}
.contact-details_label {
  font-weight: 600;
  margin-right: 0.5rem;
  color: var(--color-text-muted);
}
.contact-details_empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.current-appointment {
  background: var(--color-primary-light);
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.current-appointment_label {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.current-appointment_value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin: 0;
}
.current-appointment_location {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.form-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}
.form-optional {
  font-weight: 400;
  color: var(--color-text-muted);
}
.form-input {
  padding: 0.6rem 0.875rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: var(--font-size-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
}
.form-input:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  border-color: var(--color-primary);
}
.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.875rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  cursor: pointer;
}
.file-upload:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  overflow: hidden;
}

.actions-stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.verify-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.timeline {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  margin: 0;
}
.timeline_item {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  padding-bottom: var(--spacing-md);
  position: relative;
}
.timeline_item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 0.4375rem;
  top: 1.25rem;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}
.timeline_dot {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
  border: 2px solid currentColor;
}
.timeline_dot-registered {
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.timeline_dot-appointment {
  color: #2563eb;
  background: #eff6ff;
}
.timeline_dot-verified {
  color: #16a34a;
  background: #f0fdf4;
}

.timeline_content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.timeline_label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin: 0;
}
.timeline_time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.timeline_empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
}

.alert {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-danger);
}
.alert-success {
  background: #f0fdf4;
  color: #15803d;
  border-color: #16a34a;
}
.alert-error {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.notes-card {
  background: var(--card-bg-orange);
}

.notes-card_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.notes-card_edit-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 0.3rem 0.75rem;
  font-family: var(--font-body);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}
.notes-card_edit-btn:hover {
  background: var(--color-primary-light);
}
.notes-card_edit-btn:focus-visible {
  outline: 3px solid var(--color-focus);
}

.notes-card_text {
  font-size: var(--font-size-sm);
  line-height: 1.7;
  white-space: pre-wrap;
  margin: 0;
}

.notes-card_empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.notes-card_textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  resize: vertical;
  background: var(--color-bg);
  color: var(--color-text);
}
.notes-card_textarea:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  border-color: var(--color-primary);
}

.notes-card_actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
