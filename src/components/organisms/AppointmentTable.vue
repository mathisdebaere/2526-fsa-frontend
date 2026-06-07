<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQueryCache } from '@pinia/colada'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { formatDateWeekday as formatDate } from '@/utils/date'
import type { Appointment } from '@/types/api'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const props = defineProps<{
  appointments: Appointment[]
  loading?: boolean
}>()

const emit = defineEmits<{
  view: [id: number]
}>()

const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const cache = useQueryCache()

function formatTime(t: string | null | undefined) {
  return t?.slice(0, 5) ?? '-'
}

function otherPerson(appointment: Appointment) {
  if (auth.isClient) return { user: appointment.volunteer?.user, role: 'Vrijwilliger' }
  if (auth.isVolunteer) return { user: appointment.client?.user, role: 'Dienstvrager' }
  return {
    user: appointment.client?.user ?? appointment.volunteer?.user,
    role: appointment.client_id ? 'Dienstvrager' : 'Vrijwilliger',
  }
}

function personName(appointment: Appointment): string {
  const u = otherPerson(appointment).user
  return u ? `${u.first_name} ${u.last_name}` : '-'
}

function personPhoto(appointment: Appointment) {
  return otherPerson(appointment).user?.profile_photo_url
}

const sorted = computed(() => [...props.appointments].sort((a, b) => a.date.localeCompare(b.date)))

const confirmDialog = ref<HTMLDialogElement | null>(null)
const confirmingId = ref<number | null>(null)
const reviewContent = ref('')
const reviewError = ref('')

function openConfirm(id: number) {
  confirmingId.value = id
  reviewContent.value = ''
  reviewError.value = ''
  confirmDialog.value?.showModal()
}

function closeConfirm() {
  confirmingId.value = null
  reviewContent.value = ''
  reviewError.value = ''
  confirmDialog.value?.close()
}

const { mutate: confirmAppointment, isLoading: confirming } = useMutation({
  mutation: async ({ id, content, helpRequestId }: { id: number; content: string; helpRequestId: number | null }) => {
    await api.patch(`/appointments/${id}/confirm`, { content })
    if (helpRequestId) {
      await api.patch(`/help-requests/${helpRequestId}`, { status: 'completed' })
    }
  },
  onSuccess: () => {
    cache.invalidateQueries({ key: ['appointments'] })
    cache.invalidateQueries({ key: ['client-matches'] })
    cache.invalidateQueries({ key: ['client-help-requests'] })
    cache.invalidateQueries({ key: ['help-requests'] })
    toast.success('Afspraak bevestigd!')
    closeConfirm()
  },
  onError: () => toast.error('Bevestigen mislukt'),
})

function handleConfirm() {
  reviewError.value = ''
  if (!reviewContent.value.trim()) {
    reviewError.value = 'Schrijf een korte ervaring voor je bevestigs'
    return
  }
  if (reviewContent.value.trim().length < 10) {
    reviewError.value = 'Je ervaring moet minstens 10 karakters bevatten'
    return
  }
  const apt = props.appointments.find((a) => a.id === confirmingId.value)
  confirmAppointment({
    id: confirmingId.value!,
    content: reviewContent.value.trim(),
    helpRequestId: apt?.help_request_id ?? null,
  })
}
</script>

<template>
  <div class="apt-table">
    <p v-if="!appointments.length" class="page-empty">Geen afspraken gevonden.</p>

    <ul v-else role="list" class="card-list">
      <li v-for="appointment in sorted" :key="appointment.id" class="card appointment-card">
        <div class="appointment-card_when">
          <span class="appointment-card_date" style="text-transform: capitalize">{{ formatDate(appointment.date) }}</span>
          <span class="appointment-card_time">{{ formatTime(appointment.start_time) }}</span>
        </div>

        <div class="appointment-card_person">
          <AppAvatar :src="personPhoto(appointment)" :name="personName(appointment)" size="sm" />
          <div class="appointment-card_person-info">
            <span class="appointment-card_person-name">{{ personName(appointment) }}</span>
            <span class="appointment-card_person-role">{{ otherPerson(appointment).role }}</span>
          </div>
        </div>

        <div class="appointment-card_meta">
          <button class="link-btn" @click="emit('view', appointment.id)">Bekijken <i class="fa-solid fa-angle-right"></i></button>
          <AppButton v-if="auth.isClient && appointment.status === 'planned'" variant="secondary" size="sm" @click="openConfirm(appointment.id)"> <i class="fa-solid fa-check"></i> Bevestigen &amp; review </AppButton>
        </div>
      </li>
    </ul>

    <dialog ref="confirmDialog" class="app-dialog" aria-labelledby="modal-title" @close="closeConfirm">
      <h2 id="modal-title" class="dialog-title">Bevestig afspraak &amp; schrijf een ervaring</h2>
      <p class="dialog-sub">Deel je ervaring met de vrijwilliger</p>

      <label for="review-content" class="dialog-label"> Jouw ervaring <span class="dialog-required" aria-hidden="true">*</span> </label>
      <textarea id="review-content" v-model="reviewContent" class="dialog-textarea" rows="5" :aria-describedby="reviewError ? 'review-error' : undefined" />
      <p v-if="reviewError" id="review-error" class="dialog-error" role="alert">
        {{ reviewError }}
      </p>

      <div class="dialog-actions">
        <AppButton variant="primary" size="sm" :loading="confirming" @click="handleConfirm">Bevestigen &amp; versturen</AppButton>
        <AppButton variant="ghost" size="sm" :disabled="confirming" @click="closeConfirm">Annuleren</AppButton>
      </div>
    </dialog>
  </div>
</template>

<style scoped lang="scss">
.appointment-card {
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  list-style: none;
}
.appointment-card:hover {
  box-shadow: var(--shadow-md);
}

.appointment-card_when {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 9rem;
}
.appointment-card_date {
  font-size: var(--font-size-sm);
  font-weight: 700;
}
.appointment-card_time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.appointment-card_person {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 10rem;
}
.appointment-card_person-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.appointment-card_person-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
}
.appointment-card_person-role {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.appointment-card_meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;
  flex-wrap: wrap;
}

@include breakpoint(md) {
  .appointment-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .appointment-card_meta {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}

.dialog-sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.dialog-label {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text);
}

.dialog-required {
  color: var(--color-danger);
  margin-left: 2px;
}

.dialog-textarea {
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
  min-height: 8rem;
}
.dialog-textarea:focus-visible {
  outline: 3px solid var(--color-focus);
  border-color: var(--color-primary);
}

.dialog-error {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  margin: 0;
}
</style>
