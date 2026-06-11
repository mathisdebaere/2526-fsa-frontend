<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { formatDateFull as formatDate, formatDate as formatDateTime } from '@/utils/date'
import type { HelpRequest, Volunteer, VolunteerRequest } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()
const auth = useAuthStore()
const cache = useQueryCache()
const id = Number(route.params.id)

const showContact = ref(false)

const { data: request, isLoading } = useQuery({
  key: ['help-requests', id],
  query: () => api.get<HelpRequest>(`/help-requests/${id}?include=category,client.user,appointments`),
})

const { data: volunteer } = useQuery({
  key: () => ['volunteer', request.value?.volunteer_id ?? 0],
  query: () => api.get<Volunteer>(`/volunteers/${request.value!.volunteer_id}?include=user`),
  enabled: () => !!request.value?.volunteer_id,
})

const canSeeAppointmentDetails = computed(() => auth.isAdvisor)

const { data: myVolunteerRequests } = useQuery({
  key: ['volunteer-requests-incoming'],
  query: () => api.get<VolunteerRequest[]>('/volunteer-requests'),
  enabled: () => auth.isVolunteer,
})

const myPendingRequest = computed(() =>
  myVolunteerRequests.value?.find((r) => r.help_request_id === id && r.status === 'pending') ?? null,
)

const hasPendingRequest = computed(() => !!myPendingRequest.value)
const canAccept = computed(() => auth.isVolunteer && request.value?.status === 'open' && !hasPendingRequest.value)

const { mutate: acceptRequest, isLoading: accepting } = useMutation({
  mutation: () => api.post(`/help-requests/${id}/accept`),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['help-requests', id] })
    cache.invalidateQueries({ key: ['help-requests'] })
    cache.invalidateQueries({ key: ['open-help-requests'] })
    toast.success('Je hebt je aangemeld als vrijwilliger, de cliënt ontvangt een bevestiging.')
  },
  onError: () => toast.error('Aanmelden mislukt. Probeer opnieuw.'),
})

const { mutate: respondToRequest, isLoading: responding } = useMutation({
  mutation: ({ action }: { action: 'accept' | 'decline' }) =>
    api.post(`/volunteer-requests/${myPendingRequest.value!.id}/${action}`),
  onSuccess: (_, { action }) => {
    cache.invalidateQueries({ key: ['volunteer-requests-incoming'] })
    cache.invalidateQueries({ key: ['help-requests', id] })
    cache.invalidateQueries({ key: ['help-requests'] })
    toast.success(action === 'accept' ? 'Aanvraag geaccepteerd.' : 'Aanvraag geweigerd.')
  },
  onError: () => toast.error('Actie mislukt. Probeer opnieuw.'),
})

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'default' }> = {
  open: { label: 'Open', variant: 'warning' },
  matched: { label: 'Gematcht', variant: 'info' },
  completed: { label: 'Voltooid', variant: 'success' },
  cancelled: { label: 'Geannuleerd', variant: 'danger' },
}

function fmtTime(t: string | null | undefined) {
  return t?.slice(0, 5) ?? 'Onbekend'
}
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <button class="back-btn" @click="router.back()"><i class="fa-solid fa-angle-left"></i> Terug</button>
      <AppSpinner v-if="isLoading" label="Hulpvraag wordt ingeladen..." />

      <template v-else-if="request">
        <div class="detail-header">
          <div class="detail-header_left">
            <h1 class="detail-header_title">{{ request.category?.name ?? 'Hulpvraag' }}</h1>
            <p v-if="request.category?.description" class="detail-header_sub">
              {{ request.category.description }}
            </p>
          </div>
          <div class="detail-header_actions">
            <AppBadge :variant="statusConfig[request.status]?.variant ?? 'default'" size="lg">
              {{ statusConfig[request.status]?.label ?? request.status }}
            </AppBadge>
            <template v-if="auth.isVolunteer && request.status === 'open'">
              <template v-if="hasPendingRequest">
                <AppButton variant="primary" :loading="responding" @click="respondToRequest({ action: 'accept' })">
                  <i class="fa-solid fa-check"></i> Accepteren
                </AppButton>
                <AppButton variant="danger" :loading="responding" @click="respondToRequest({ action: 'decline' })">
                  <i class="fa-solid fa-xmark"></i> Weigeren
                </AppButton>
              </template>
              <AppButton v-else variant="primary" :loading="accepting" @click="acceptRequest()">
                Ik wil helpen
              </AppButton>
            </template>
          </div>
        </div>
        <div class="detail-grid">
          <section class="detail-card" aria-labelledby="details-heading">
            <h2 id="details-heading" class="detail-card_title">Aanvraagdetails</h2>
            <div class="meta-fields">
              <div v-if="request.region" class="meta-field">
                <span class="meta-field_label">Regio</span>
                <span class="meta-field_value">{{ request.region }}</span>
              </div>
              <div v-if="request.date" class="meta-field">
                <span class="meta-field_label">Datum</span>
                <span class="meta-field_value meta-field_value--capitalize">{{ formatDate(request.date) }}</span>
              </div>
              <div v-if="request.time" class="meta-field">
                <span class="meta-field_label">Tijdstip</span>
                <span class="meta-field_value">{{ fmtTime(request.time) }}</span>
              </div>
            </div>
          </section>

          <section class="detail-card" aria-labelledby="client-heading">
            <h2 id="client-heading" class="detail-card_title">Cliënt</h2>
            <template v-if="request.client?.user">
              <div class="person-block">
                <AppAvatar :src="request.client.user.profile_photo_url" :name="`${request.client.user.first_name} ${request.client.user.last_name}`" size="md" />
                <div class="person-block_info">
                  <p class="person-block_name">{{ request.client.user.first_name }} {{ request.client.user.last_name }}</p>
                </div>
              </div>

              <template v-if="showContact">
                <div class="meta-fields">
                  <div v-if="request.client.user.email" class="meta-field">
                    <span class="meta-field_label">E-mailadres</span>
                    <a :href="`mailto:${request.client.user.email}`" class="meta-field_value meta-field_link">
                      {{ request.client.user.email }}
                    </a>
                  </div>
                  <div v-if="request.client.user.phone" class="meta-field">
                    <span class="meta-field_label">Telefoonnummer</span>
                    <a :href="`tel:${request.client.user.phone}`" class="meta-field_value meta-field_link">
                      {{ request.client.user.phone }}
                    </a>
                  </div>
                </div>
              </template>

              <AppButton variant="ghost" size="sm" @click="showContact = !showContact">
                {{ showContact ? 'Verberg contactgegevens' : 'Toon contactgegevens' }}
              </AppButton>
            </template>
            <p v-else class="detail-card_empty">Geen clëntgegevens beschikbaar.</p>
          </section>
          <section class="detail-card" aria-labelledby="volunteer-heading">
            <h2 id="volunteer-heading" class="detail-card_title">Vrijwilliger</h2>
            <div v-if="request.volunteer_id && volunteer?.user" class="person-block">
              <AppAvatar :src="volunteer.user.profile_photo_url" :name="`${volunteer.user.first_name} ${volunteer.user.last_name}`" size="md" />
              <div class="person-block_info">
                <p class="person-block_name">{{ volunteer.user.first_name }} {{ volunteer.user.last_name }}</p>
                <template v-if="auth.isAdvisor">
                  <div class="meta-fields" style="margin-top: 0.5rem">
                    <div v-if="volunteer.user.email" class="meta-field">
                      <span class="meta-field_label">E-mailadres</span>
                      <a :href="`mailto:${volunteer.user.email}`" class="meta-field_value meta-field_link">
                        {{ volunteer.user.email }}
                      </a>
                    </div>
                    <div v-if="volunteer.user.phone" class="meta-field">
                      <span class="meta-field_label">Telefoonnummer</span>
                      <a :href="`tel:${volunteer.user.phone}`" class="meta-field_value meta-field_link">
                        {{ volunteer.user.phone }}
                      </a>
                    </div>
                  </div>
                </template>
                <p v-else class="person-block_muted">Er is een vrijwilliger gekoppeld aan deze hulpvraag</p>
              </div>
            </div>
            <p v-else-if="!request.volunteer_id" class="detail-card_empty">Nog geen vrijwilliger gekoppeld.</p>
          </section>
          <section v-if="request.extra_notes" class="detail-card detail-card-wide" aria-labelledby="notes-heading">
            <h2 id="notes-heading" class="detail-card_title">Toelichting</h2>
            <p class="detail-desc">{{ request.extra_notes }}</p>
          </section>
          <section v-if="canSeeAppointmentDetails && request.appointments" class="detail-card detail-card-wide" aria-labelledby="appointments-heading">
            <h2 id="appointments-heading" class="detail-card_title">Afspraken</h2>
            <ul v-if="request.appointments.length" class="appointment-list">
              <li v-for="appointment in request.appointments" :key="appointment.id" class="appointment-item">
                <span class="appointment-item_date">{{ formatDateTime(appointment.date) }}</span>
                <span class="appointment-item_time">{{ fmtTime(appointment.start_time) }}</span>
                <span class="appointment-item_location">{{ appointment.location }}</span>
                <AppBadge :variant="appointment.status === 'planned' ? 'info' : appointment.status === 'completed' ? 'success' : 'danger'" size="sm">
                  {{ appointment.status === 'planned' ? 'Gepland' : appointment.status === 'completed' ? 'Voltooid' : 'Geannuleerd' }}
                </AppBadge>
              </li>
            </ul>
            <p v-else class="detail-card_empty">Geen afspraken gekoppeld aan deze hulpvraag.</p>
          </section>
        </div>
      </template>

      <p v-else class="page_error">Hulpvraag niet gevonden.</p>
    </div>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.page_error {
  color: var(--color-danger);
  text-align: center;
  padding: var(--spacing-2xl);
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border);
}

.detail-header_title {
  font-size: var(--font-size-2xl);
  margin: 0;
  color: var(--color-primary);
}

.detail-header_sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.detail-header_actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

@include breakpoint(lg) {
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@include breakpoint(sm) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-header {
    flex-direction: column;
  }
  .detail-header_actions {
    width: 100%;
  }
}

.detail-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 22rem;
}

.detail-card-wide {
  min-height: unset;
}

.detail-card-wide {
  grid-column: 1 / -1;
}

.detail-card_title {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.detail-card_empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.detail-desc {
  font-size: var(--font-size-sm);
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
}

.meta-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.meta-field {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--spacing-md);
}

.meta-field_label {
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.meta-field_value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  text-align: right;
}

.meta-field_value-capitalize {
  text-transform: capitalize;
}

.meta-field_link {
  color: var(--color-primary);
  text-decoration: none;
}

.meta-field_link:hover {
  text-decoration: underline;
}

.person-block {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.person-block_info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.person-block_name {
  font-weight: 700;
  font-size: var(--font-size-base);
  margin: 0;
}

.person-block_muted {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.appointment-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  flex-wrap: wrap;
}

.appointment-item_date {
  font-weight: 600;
  text-transform: capitalize;
}
.appointment-item_time {
  color: var(--color-text-muted);
}
.appointment-item_location {
  flex: 1;
  color: var(--color-text-muted);
  min-width: 8rem;
}
</style>
