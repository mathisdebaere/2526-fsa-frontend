<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@pinia/colada'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import { useSubscriptionGuard } from '@/composables/useSubscriptionGuard'
import type { Appointment, HelpRequest, Intake } from '@/types/api'
import { formatDate } from '@/utils/date'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import NoSubscriptionBanner from '@/components/atoms/NoSubscriptionBanner.vue'
import AppointmentTable from '@/components/organisms/AppointmentTable.vue'
import HelpRequestList from '@/components/organisms/HelpRequestList.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const api = useApi()
const router = useRouter()
const { noSubscription, isExpired, isLoading: subChecking } = useSubscriptionGuard()

const { data: appointments, isLoading } = useQuery({
  key: ['appointments'],
  query: () => api.get<Appointment[]>('/appointments?include=client.user,volunteer.user,helpRequest.category'),
})

const { data: helpRequests } = useQuery({
  key: ['help-requests'],
  query: () => api.get<HelpRequest[]>(`/help-requests?include=category,volunteer.user${auth.isVolunteer ? '&status=open' : ''}`),
  enabled: computed(() => !auth.isAdvisor),
})

const { data: intakes } = useQuery({
  key: ['intakes', 'pending'],
  query: () => api.get<Intake[]>('/intakes?status=pending&include=user'),
  enabled: auth.isAdvisor,
})

const { data: scheduledIntakes } = useQuery({
  key: ['intakes', 'scheduled'],
  query: () => api.get<Intake[]>('/intakes?status=scheduled&include=user,appointment'),
  enabled: auth.isAdvisor,
})

function toArr<T>(v: unknown): T[] {
  if (!v) return []
  return Array.isArray(v) ? (v as T[]) : ((v as { data?: T[] }).data ?? [])
}

const plannedAppointments = computed(() => {
  const regular = toArr<Appointment>(appointments.value).filter((appointment) => appointment.status === 'planned')

  if (!auth.isAdvisor) return regular

  const intakeAppointments = toArr<Intake>(scheduledIntakes.value)
    .filter((intake) => intake.appointment?.status === 'planned')
    .map((intake) => intake.appointment!)

  const seen = new Set(regular.map((appointment) => appointment.id))
  return [...regular, ...intakeAppointments.filter((appointment) => !seen.has(appointment.id))]
})

const totalAppointments = computed(() => {
  const regular = toArr<Appointment>(appointments.value)

  if (!auth.isAdvisor) return regular.length

  const intakeAppointments = toArr<Intake>(scheduledIntakes.value)
    .filter((intake) => intake.appointment)
    .map((intake) => intake.appointment!)

  const seen = new Set(regular.map((appointment) => appointment.id))
  return regular.length + intakeAppointments.filter((appointment) => !seen.has(appointment.id)).length
})

const intakeIds = computed(
  () =>
    new Set(
      toArr<Intake>(scheduledIntakes.value)
        .map((intake) => intake.appointment?.id)
        .filter((id): id is number => id != null),
    ),
)

const upcomingAppointments = computed(() =>
  [...plannedAppointments.value]
    .filter((appointment) => !intakeIds.value.has(appointment.id))
    .sort((appointmentA, appointmentB) => appointmentA.date.localeCompare(appointmentB.date))
    .slice(0, 5),
)

const upcomingIntakes = computed(() =>
  toArr<Intake>(scheduledIntakes.value)
    .filter((intake) => intake.appointment && intake.appointment.status === 'planned')
    .sort((intakeA, intakeB) => intakeA.appointment!.date.localeCompare(intakeB.appointment!.date))
    .slice(0, 5),
)

const openRequests = computed(() => toArr<HelpRequest>(helpRequests.value).filter((request) => request.status === 'open').length)

const recentIntakes = computed(() => [...toArr<Intake>(intakes.value)].sort((intakeA, intakeB) => new Date(intakeB.created_at).getTime() - new Date(intakeA.created_at).getTime()).slice(0, 5))
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="db-header">
        <div>
          <h1 class="db-header_title">Welkom, {{ auth.user?.first_name }}!</h1>
          <p v-if="!auth.isClient || (!subChecking && !noSubscription)" class="db-header_sub">Hier is een overzicht van uw activitieten</p>
        </div>
      </header>

      <AppSpinner v-if="auth.isClient && subChecking" label="Laden..." />
      <NoSubscriptionBanner v-else-if="auth.isClient && noSubscription" :expired="isExpired" />

      <template v-if="!auth.isClient || (!subChecking && !noSubscription)">
        <div class="stat-grid">
          <div class="card stat-card stat-card-blue">
            <span class="stat-card_label">Geplande afspraken</span>
            <span class="stat-card_value">{{ isLoading ? '-' : plannedAppointments.length }}</span>
          </div>
          <div v-if="auth.isAdvisor" class="card stat-card stat-card-orange">
            <span class="stat-card_label">Openstaande intakes</span>
            <span class="stat-card_value">{{ isLoading ? '-' : toArr(intakes).length }}</span>
          </div>
          <div v-else class="card stat-card stat-card-orange">
            <span class="stat-card_label">{{ auth.isClient ? 'Mijn open hulpaanvragen' : 'Open hulpvragen' }}</span>
            <span class="stat-card_value">{{ isLoading ? '-' : openRequests }}</span>
          </div>
          <div class="card stat-card stat-card-teal">
            <span class="stat-card_label">Totaal afspraken</span>
            <span class="stat-card_value">{{ isLoading ? '-' : totalAppointments }}</span>
          </div>
        </div>

        <section class="dashboard-section" aria-labelledby="appointments-heading">
          <div class="dashboard-section_header">
            <h2 id="appointments-heading">Komende afspraken</h2>
            <RouterLink to="/appointments" class="dashboard-section_link"><span class="link-label-full">Alle afspraken</span><span class="link-label-short">Alle</span> <i class="fa-solid fa-angle-right"></i></RouterLink>
          </div>
          <AppSpinner v-if="isLoading" label="Afspraken worden ingeladen..." />
          <template v-else>
            <ul v-if="auth.isAdvisor && upcomingIntakes.length" class="intake-preview-list">
              <li v-for="intake in upcomingIntakes" :key="`intake-${intake.id}`" class="card intake-preview" @click="router.push(`/intakes/${intake.id}`)">
                <AppAvatar :src="intake.user?.profile_photo_url" :name="intake.user ? `${intake.user.first_name} ${intake.user.last_name}` : `#${intake.user_id}`" size="sm" />
                <div class="intake-preview_info">
                  <span class="intake-preview_name">
                    {{ intake.user ? `${intake.user.first_name} ${intake.user.last_name}` : `Gebruiker #${intake.user_id}` }}
                  </span>
                  <span class="intake-preview_date">
                    Intake op {{ formatDate(intake.appointment!.date) }} om {{ intake.appointment!.start_time?.slice(0, 5) }}
                    {{ intake.appointment!.location }}
                  </span>
                </div>
                <AppBadge variant="info">Intake</AppBadge>
                <RouterLink :to="`/intakes/${intake.id}`" class="link-btn" @click.stop>Bekijken <i class="fa-solid fa-angle-right"></i></RouterLink>
              </li>
            </ul>
            <AppointmentTable v-if="upcomingAppointments.length" :appointments="upcomingAppointments" @view="(id) => router.push(`/appointments/${id}`)" />
            <p v-if="!upcomingAppointments.length && (!auth.isAdvisor || !upcomingIntakes.length)" class="page-empty">Geen geplande afspraken.</p>
          </template>
        </section>

        <section v-if="auth.isAdvisor" class="dashboard-section" aria-labelledby="intakes-heading">
          <div class="dashboard-section_header">
            <h2 id="intakes-heading">Nieuwste intakes</h2>
            <RouterLink to="/intakes" class="dashboard-section_link"><span class="link-label-full">Alle intakes</span><span class="link-label-short">Alle</span> <i class="fa-solid fa-angle-right"></i></RouterLink>
          </div>
          <AppSpinner v-if="isLoading" label="Intakes worden ingeladen..." />
          <template v-else>
            <p v-if="!recentIntakes.length" class="page-empty">Geen openstaande intakes.</p>
            <ul v-else class="intake-preview-list">
              <li v-for="intake in recentIntakes" :key="intake.id" class="card intake-preview" @click="router.push(`/intakes/${intake.id}`)">
                <AppAvatar :src="intake.user?.profile_photo_url" :name="intake.user ? `${intake.user.first_name} ${intake.user.last_name}` : `#${intake.user_id}`" size="sm" />
                <div class="intake-preview_info">
                  <span class="intake-preview_name">
                    {{ intake.user ? `${intake.user.first_name} ${intake.user.last_name}` : `Gebruiker #${intake.user_id}` }}
                  </span>
                  <span class="intake-preview_date">Aangevraagd op {{ formatDate(intake.created_at) }}</span>
                </div>
                <AppBadge variant="warning">Te plannen</AppBadge>
                <RouterLink :to="`/intakes/${intake.id}`" class="link-btn" @click.stop>Inplannen <i class="fa-solid fa-angle-right"></i></RouterLink>
              </li>
            </ul>
          </template>
        </section>

        <section v-else class="dashboard-section" aria-labelledby="hr-heading">
          <div class="dashboard-section_header">
            <h2 id="hr-heading">{{ auth.isClient ? 'Mijn actieve hulpvragen' : 'Hulpvragen' }}</h2>
            <RouterLink :to="auth.isClient ? '/client/help-requests' : '/help-requests'" class="dashboard-section_link">Alle hulpvragen<i class="fa-solid fa-angle-right"></i></RouterLink>
          </div>
          <HelpRequestList :requests="(auth.isVolunteer ? toArr<HelpRequest>(helpRequests).filter((r) => r.status !== 'matched') : auth.isClient ? toArr<HelpRequest>(helpRequests).filter((r) => r.status === 'open' || r.status === 'matched') : toArr<HelpRequest>(helpRequests)).slice(0, 4)" />
        </section>
      </template>
    </div>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.dashboard-header_title {
  margin: 0;
}
.dashboard-header_sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.stat-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 36rem) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  gap: var(--spacing-sm);
}
.stat-card-blue {
  background: var(--card-bg-primary);
}
.stat-card-orange {
  background: var(--card-bg-orange);
}
.stat-card-teal {
  background: var(--card-bg-teal);
}

.stat-card_label {
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.stat-card_value {
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1;
  color: var(--color-primary);
  letter-spacing: 0.02em;
}

.stat-card-orange .stat-card_value {
  color: var(--color-orange);
}
.stat-card-teal .stat-card_value {
  color: var(--color-teal);
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.dashboard-section_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
.dashboard-section_header h2 {
  margin: 0;
}

@include breakpoint(md) {
  .dashboard-section_header {
    gap: var(--spacing-sm);
  }
  .stat-grid {
    grid-template-columns: 3 1fr;
  }
}

.dashboard-section_link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.75rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}
.dashboard-section_link:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  text-decoration: none;
}
.dashboard-section_link:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.link-label-short {
  display: none;
}

@media (max-width: 21.875rem) {
  .link-label-full {
    display: none;
  }
  .link-label-short {
    display: inline;
  }
}

.intake-preview-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.intake-preview {
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  flex-wrap: wrap;
}
.intake-preview:hover {
  box-shadow: var(--shadow-md);
}

.intake-preview_info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}
.intake-preview_name {
  font-weight: 700;
  font-size: var(--font-size-sm);
}
.intake-preview_date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
