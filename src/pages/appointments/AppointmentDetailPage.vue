<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import { formatDateFull as formatDate } from '@/utils/date'
import type { Appointment } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()
const auth = useAuthStore()
const id = Number(route.params.id)

const { data: appointment, isLoading } = useQuery({
  key: ['appointments', id],
  query: () => api.get<Appointment>(`/appointments/${id}?include=client.user,volunteer.user,helpRequest.category`),
})

const typeLabel: Record<string, string> = {
  introduction: 'Kennismakingsgesprek',
  assistance: 'Hulpafspraak',
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  planned: { label: 'Gepland', variant: 'info' },
  completed: { label: 'Voltooid', variant: 'success' },
  cancelled: { label: 'Geannuleerd', variant: 'danger' },
}

function fmtTime(t: string | null | undefined) {
  return t?.slice(0, 5) ?? '-'
}

function otherUser(a: Appointment) {
  if (auth.isClient) return { user: a.volunteer?.user, role: 'Vrijwilliger' }
  if (auth.isVolunteer) return { user: a.client?.user, role: 'Dienstvrager' }
  return {
    user: a.client?.user ?? a.volunteer?.user,
    role: a.client_id ? 'Dienstvrager' : 'Vrijwilliger',
  }
}

function personName(a: Appointment) {
  const other = otherUser(a).user
  return other ? `${other.first_name} ${other.last_name}` : null
}

function personPhoto(a: Appointment) {
  return otherUser(a).user?.profile_photo_url
}

function personRole(a: Appointment) {
  return otherUser(a).role
}

function personContact(a: Appointment) {
  const other = otherUser(a).user
  return { email: other?.email, phone: other?.phone }
}

const showContact = ref(false)
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <button class="back-btn" @click="router.push(auth.isClient ? '/client/appointments' : '/appointments')"><i class="fa-solid fa-angle-left"></i> Terug</button>
      <AppSpinner v-if="isLoading" label="Afspraak wordt ingeladen..." />

      <template v-else-if="appointment">
        <div class="detail-header">
          <div class="detail-header_title">
            <h1>{{ typeLabel[appointment.type] ?? appointment.type }}</h1>
            <p class="detail-header_date">{{ formatDate(appointment.date) }}</p>
          </div>
          <AppBadge :variant="statusConfig[appointment.status]?.variant ?? 'default'" size="lg">
            {{ statusConfig[appointment.status]?.label ?? appointment.status }}
          </AppBadge>
        </div>

        <div class="detail-grid">
          <section class="detail-card" aria-labelledby="person-heading">
            <h2 id="person-heading" class="detail-card_title">Met wie</h2>
            <div v-if="personName(appointment)" class="person-card">
              <div class="person-block">
                <AppAvatar :src="personPhoto(appointment)" :name="personName(appointment) ?? ''" size="md" />
                <div class="person-block_info">
                  <p class="person-block_name">{{ personName(appointment) }}</p>
                  <p class="person-block_role">{{ personRole(appointment) }}</p>
                </div>
              </div>
              <template v-if="showContact">
                <div class="meta-fields">
                  <div v-if="personContact(appointment).email" class="meta-field">
                    <span class="meta-field_label">E-mailadres</span>
                    <a :href="`mailto:${personContact(appointment).email}`" class="meta-field_value meta-field_link">
                      {{ personContact(appointment).email }}
                    </a>
                  </div>
                  <div v-if="personContact(appointment).phone" class="meta-field">
                    <span class="meta-field_label">Telefoonnummer</span>
                    <a :href="`tel:${personContact(appointment).phone}`" class="meta-field_value meta-field_link">
                      {{ personContact(appointment).phone }}
                    </a>
                  </div>
                </div>
              </template>
              <AppButton variant="ghost" size="sm" @click="showContact = !showContact">
                {{ showContact ? 'Verberg contactgegevens' : 'Toon contactgegevens' }}
              </AppButton>
            </div>
            <p v-else class="detail-card_empty">Geen persoon gekoppeld</p>
          </section>

          <section class="detail-card" aria-labelledby="when-heading">
            <h2 id="when-heading" class="detail-card_title">Waar & wanneer</h2>
            <div class="meta-fields">
              <div class="meta-field">
                <span class="meta-field_label">Datum</span>
                <span class="meta-field_value" style="text-transform: capitalize">{{ formatDate(appointment.date) }}</span>
              </div>
              <div class="meta-field">
                <span class="meta-field_label">Tijdstip</span>
                <span class="meta-field_value">{{ fmtTime(appointment.start_time) }}</span>
              </div>
              <div class="meta-field">
                <span class="meta-field_label">Locatie</span>
                <span class="meta-field_value">{{ appointment.location }}</span>
              </div>
            </div>
          </section>

          <section class="detail-card" aria-labelledby="subject-heading">
            <h2 id="subject-heading" class="detail-card_title">Onderwerp</h2>
            <div class="meta-fields">
              <div class="meta-field">
                <span class="meta-field_label">Type</span>
                <span class="meta-field_value">{{ typeLabel[appointment.type] ?? appointment.type }}</span>
              </div>
              <div v-if="appointment.help_request" class="meta-field">
                <span class="meta-field_label">Categorie</span>
                <span class="meta-field_value">{{ appointment.help_request.category?.name ?? '-' }}</span>
              </div>
              <div v-else class="meta-field">
                <span class="meta-field_label">Hulpaanvraag</span>
                <span class="meta-field_value">Niet gematcht</span>
              </div>
            </div>
          </section>

          <section v-if="appointment.help_request?.extra_notes" class="detail-card detail-card--wide" aria-labelledby="desc-heading">
            <h2 id="desc-heading" class="detail-card_title">Beschrijving</h2>
            <p class="detail-desc">{{ appointment.help_request.extra_notes }}</p>
          </section>
        </div>
      </template>

      <p v-else class="page_error">Afspraak niet gevonden</p>
    </div>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.back-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
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
  gap: var(--spacing-md);
  flex-wrap: wrap;
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border);
}

.detail-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  margin: 0;
}

.detail-header_date {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0.25rem 0 0;
  text-transform: capitalize;
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
}

.detail-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 22rem;
}

.detail-card--wide {
  min-height: unset;
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

.person-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
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
}

.person-block_name {
  font-weight: 700;
  font-size: var(--font-size-base);
  margin: 0;
}

.person-block_role {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.meta-field_link {
  color: var(--color-primary);
  text-decoration: none;
}
.meta-field_link:hover {
  text-decoration: underline;
}

.detail-card--wide {
  grid-column: 1 / -1;
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

.detail-desc {
  font-size: var(--font-size-sm);
  line-height: 1.7;
  margin: 0;
  color: var(--color-text);
}
</style>
