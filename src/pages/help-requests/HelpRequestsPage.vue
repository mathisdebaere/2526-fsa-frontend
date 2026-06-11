<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { usePageState, usePaginatedData, PER_PAGE } from '@/composables/usePaginatedData'
import type { HelpRequest, HelpRequestCategory, VolunteerRequest, PaginatedResponse } from '@/types/api'
import { computed } from 'vue'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import HelpRequestList from '@/components/organisms/HelpRequestList.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'

const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const cache = useQueryCache()
const { currentPage, goToPage, resetPage } = usePageState()

// Filters (adviseur)
const filterStatus = ref('open')
const filterCategory = ref('')

watch([filterStatus, filterCategory], () => resetPage())

const { data: pageData, isLoading } = useQuery({
  key: () => ['help-requests', filterStatus.value, filterCategory.value, currentPage.value],
  query: () => {
    const params = new URLSearchParams({ include: 'category,volunteer.user,client.user', per_page: String(PER_PAGE), page: String(currentPage.value) })
    if (auth.isVolunteer) {
      params.set('status', 'open')
    } else if (filterStatus.value) {
      params.set('status', filterStatus.value)
    }
    if (filterCategory.value) params.set('category_id', filterCategory.value)
    return api.get<PaginatedResponse<HelpRequest>>(`/help-requests?${params}`)
  },
})

const { items: requests, total, lastPage } = usePaginatedData<HelpRequest>(pageData)

const advisorStatusFilters = [
  { value: 'open', label: 'Open' },
  { value: 'matched', label: 'Gematcht' },
  { value: 'completed', label: 'Voltooid' },
  { value: 'cancelled', label: 'Geannuleerd' },
]

const { data: categories } = useQuery({
  key: ['help-request-categories'],
  query: () => api.get<HelpRequestCategory[]>('/help-request-categories'),
})

const { data: myVolunteerRequests } = useQuery({
  key: ['volunteer-requests-incoming'],
  query: () => api.get<VolunteerRequest[]>('/volunteer-requests'),
  enabled: () => auth.isVolunteer,
})

const requestedMap = computed(() => {
  const map = new Map<number, VolunteerRequest>()
  for (const r of myVolunteerRequests.value ?? []) map.set(r.help_request_id, r)
  return map
})

const acceptingId = ref<number | null>(null)
const respondingId = ref<number | null>(null)

const { mutate: acceptRequest } = useMutation({
  mutation: (id: number) => api.post(`/help-requests/${id}/accept`),
  onMutate: (id) => {
    acceptingId.value = id
  },
  onSuccess: () => {
    acceptingId.value = null
    cache.invalidateQueries({ key: ['help-requests'] })
    toast.success('Je hebt je aangemeld als vrijwilliger, de cliënt ontvangt een bevestiging.')
  },
  onError: () => {
    acceptingId.value = null
    toast.error('Aanmelden mislukt.')
  },
})

const { mutate: respondRequest } = useMutation({
  mutation: ({ volunteerRequestId, action }: { volunteerRequestId: number; action: 'accept' | 'decline' }) =>
    api.post(`/volunteer-requests/${volunteerRequestId}/${action}`),
  onMutate: ({ volunteerRequestId }) => {
    respondingId.value = volunteerRequestId
  },
  onSuccess: (_, { action }) => {
    respondingId.value = null
    cache.invalidateQueries({ key: ['volunteer-requests-incoming'] })
    cache.invalidateQueries({ key: ['help-requests'] })
    toast.success(action === 'accept' ? 'Aanvraag geaccepteerd.' : 'Aanvraag geweigerd.')
  },
  onError: () => {
    respondingId.value = null
    toast.error('Actie mislukt. Probeer opnieuw.')
  },
})
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <header class="page_header">
        <h1>Hulpvragen</h1>
      </header>

      <template v-if="auth.isAdvisor">
        <div class="tab-bar" role="tablist" aria-label="Filter op status">
          <button v-for="filter in advisorStatusFilters" :key="filter.value" role="tab" class="tab-bar_btn" :class="{ 'tab-bar_btn--active': filterStatus === filter.value }" @click="filterStatus = filter.value">
            {{ filter.label }}
          </button>
        </div>
        <div class="filter-group">
          <label for="filter-category" class="filter-label">Categorie</label>
          <select id="filter-category" v-model="filterCategory" class="field-input filter-category">
            <option value="">Alle categorieën</option>
            <option v-for="category in categories" :key="category.id" :value="String(category.id)">{{ category.name }}</option>
          </select>
        </div>
      </template>
      <AppSpinner v-if="isLoading" label="Hulpvragen worden ingeladen..." />
      <HelpRequestList v-else :requests="requests" :accepting-id="acceptingId" :responding-id="respondingId" :requested-map="requestedMap" @accept="acceptRequest" @respond="({ volunteerRequestId, action }) => respondRequest({ volunteerRequestId, action })" />

      <AppPagination v-if="!isLoading && requests?.length && lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
    </div>
  </DefaultLayout>
</template>

<style scoped lang="scss">
@use '@/assets/scss/mixins' as *;

.page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
.filter-category {
  max-width: 18rem;

  @include breakpoint(sm) {
    max-width: 100%;
    width: 100%;
  }
}
.page_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 16rem;
}
.filter-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.field-input {
  padding: 0.65rem 0.875rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
  min-height: 2.75rem;
}
.field-input:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}
</style>
