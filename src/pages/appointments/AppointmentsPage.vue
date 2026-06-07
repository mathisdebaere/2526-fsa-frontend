<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery } from '@pinia/colada'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import { usePageState, usePaginatedData, PER_PAGE } from '@/composables/usePaginatedData'
import { formatDateWeekday as formatDate } from '@/utils/date'
import type { Appointment, Intake, PaginatedResponse } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppointmentTable from '@/components/organisms/AppointmentTable.vue'
import NoSubscriptionBanner from '@/components/atoms/NoSubscriptionBanner.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import { useSubscriptionGuard } from '@/composables/useSubscriptionGuard'

const api = useApi()
const router = useRouter()
const auth = useAuthStore()
const { currentPage, goToPage, resetPage } = usePageState()

const filter = ref(auth.isAdvisor ? '' : 'planned')

watch(filter, () => resetPage())

const { data: pageData, isLoading } = useQuery({
  key: () => ['appointments', filter.value, currentPage.value],
  query: () => {
    const params = new URLSearchParams({ include: 'client.user,volunteer.user,helpRequest.category', per_page: String(PER_PAGE), page: String(currentPage.value) })
    if (filter.value) params.set('status', filter.value)
    return api.get<PaginatedResponse<Appointment>>(`/appointments?${params}`)
  },
})

const { data: intakesData } = useQuery({
  key: ['intakes', 'scheduled'],
  query: () => api.get<Intake[]>('/intakes?status=scheduled&include=user,appointment'),
  enabled: auth.isAdvisor,
})

const { noSubscription, isExpired } = useSubscriptionGuard()

const { items: appointments, total, lastPage } = usePaginatedData<Appointment>(pageData)

function toArr<T>(v: unknown): T[] {
  if (!v) return []
  return Array.isArray(v) ? (v as T[]) : ((v as { data?: T[] }).data ?? [])
}

const intakes = computed(() => toArr<Intake>(intakesData.value))

const intakeIds = computed(() => new Set(intakes.value.map((i) => i.appointment?.id).filter((id): id is number => id != null)))

const filteredAppointments = computed(() => appointments.value.filter((a) => !intakeIds.value.has(a.id)))

const scheduledIntakes = computed(() => intakes.value.filter((i) => i.appointment && (!filter.value || i.appointment.status === filter.value || filter.value === '')).sort((a, b) => a.appointment!.date.localeCompare(b.appointment!.date)))

const advisorFilters = [
  { value: '', label: 'Alle' },
  { value: 'planned', label: 'Gepland' },
  { value: 'completed', label: 'Voltooid' },
  { value: 'cancelled', label: 'Geannuleerd' },
]

const userTabs = [
  { value: 'planned', label: 'Actief' },
  { value: 'completed', label: 'Voltooid' },
  { value: 'cancelled', label: 'Geannuleerd' },
]
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Afspraken</h1>

        <select v-if="auth.isAdvisor" v-model="filter" class="page_select" aria-label="Filter op status">
          <option v-for="filterOption in advisorFilters" :key="filterOption.value" :value="filterOption.value">{{ filterOption.label }}</option>
        </select>
      </header>

      <div v-if="!auth.isAdvisor" class="tab-bar" role="tablist" aria-label="Filter op status">
        <button v-for="tab in userTabs" :key="tab.value" role="tab" class="tab-bar_btn" :class="{ 'tab-bar_btn--active': filter === tab.value }" @click="filter = tab.value">
          {{ tab.label }}
        </button>
      </div>

      <NoSubscriptionBanner v-if="auth.isClient && noSubscription" :expired="isExpired" />

      <template v-else>
        <ul v-if="auth.isAdvisor && scheduledIntakes.length" role="list" class="intake-list">
          <li v-for="intake in scheduledIntakes" :key="intake.id" class="card intake-row" @click="router.push(`/intakes/${intake.id}`)">
            <AppAvatar :src="intake.user?.profile_photo_url" :name="intake.user ? `${intake.user.first_name} ${intake.user.last_name}` : `#${intake.user_id}`" size="sm" />
            <div class="intake-row_info">
              <span class="intake-row_name">
                {{ intake.user ? `${intake.user.first_name} ${intake.user.last_name}` : `Gebruiker #${intake.user_id}` }}
              </span>
              <span class="intake-row_date"> Intake op {{ formatDate(intake.appointment!.date) }} om {{ intake.appointment!.start_time?.slice(0, 5) }} - Locatie: {{ intake.appointment!.location }} </span>
            </div>
            <AppBadge variant="info">Intake</AppBadge>
            <RouterLink :to="`/intakes/${intake.id}`" class="link-btn" @click.stop>Bekijken <i class="fa-solid fa-angle-right"></i></RouterLink>
          </li>
        </ul>

        <AppointmentTable v-if="filteredAppointments.length || isLoading" :appointments="filteredAppointments" :loading="isLoading" @view="(id) => router.push(`/appointments/${id}`)" />
        <p v-else-if="!scheduledIntakes.length" class="page-empty">Geen afspraken gevonden.</p>

        <AppPagination v-if="lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
      </template>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.page_select {
  padding: 0.5rem 0.875rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: var(--font-size-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
  min-height: 2.75rem;
}
.page_select:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.intake-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.intake-row {
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  flex-wrap: wrap;
}
.intake-row:hover {
  box-shadow: var(--shadow-md);
}

.intake-row_info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}
.intake-row_name {
  font-weight: 700;
  font-size: var(--font-size-sm);
}
.intake-row_date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
