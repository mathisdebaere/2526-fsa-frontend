<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuery } from '@pinia/colada'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { usePageState, usePaginatedData, PER_PAGE } from '@/composables/usePaginatedData'
import type { Intake, PaginatedResponse } from '@/types/api'
import { formatDate } from '@/utils/date'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'

const api = useApi()
const router = useRouter()
const { currentPage, goToPage, resetPage } = usePageState()

type StatusFilter = 'pending' | 'scheduled'
const activeFilter = ref<StatusFilter>('pending')

watch(activeFilter, () => resetPage())

const { data: pageData } = useQuery({
  key: () => ['intakes', activeFilter.value, currentPage.value],
  query: () => api.get<PaginatedResponse<Intake>>(`/intakes?status=${activeFilter.value}&include=user&per_page=${PER_PAGE}&page=${currentPage.value}`),
})

const { items: intakes, total, lastPage } = usePaginatedData<Intake>(pageData)

const filters: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: 'Te plannen' },
  { value: 'scheduled', label: 'Ingepland' },
]

const roleLabels: Record<string, string> = {
  client: 'Dienstvrager',
  volunteer: 'Vrijwilliger',
}
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <h1>Intakes</h1>

      <div class="tab-bar" role="tablist" aria-label="Filter op status">
        <button v-for="filter in filters" :key="filter.value" role="tab" :aria-selected="activeFilter === filter.value" class="tab-bar_btn" :class="{ 'tab-bar_btn--active': activeFilter === filter.value }" @click="activeFilter = filter.value">
          {{ filter.label }}
        </button>
      </div>

      <p v-if="!intakes?.length" class="page-empty">Geen intakes gevonden.</p>

      <ul v-else role="list" class="card-grid card-grid--lg">
        <li v-for="intake in intakes" :key="intake.id" class="card intake-card" :class="intake.status === 'pending' ? 'intake-card-pending' : 'intake-card-scheduled'">
          <div class="intake-card_user">
            <AppAvatar :src="intake.user?.profile_photo_url" :name="intake.user ? `${intake.user.first_name} ${intake.user.last_name}` : `#${intake.user_id}`" size="md" />
            <div class="intake-card_info">
              <span class="intake-card_name">
                {{ intake.user ? `${intake.user.first_name} ${intake.user.last_name}` : `Gebruiker #${intake.user_id}` }}
              </span>
              <span v-if="intake.user" class="intake-card_role">
                {{ roleLabels[intake.user.role] ?? intake.user.role }}
              </span>
              <span class="intake-card_date">{{ formatDate(intake.created_at) }}</span>
            </div>
          </div>

          <div class="intake-card_footer">
            <AppBadge :variant="intake.status === 'pending' ? 'warning' : 'info'">
              {{ { pending: 'Te plannen', scheduled: 'Ingepland' }[intake.status] }}
            </AppBadge>
            <AppButton size="sm" @click="router.push(`/intakes/${intake.id}`)">
              {{ intake.status === 'pending' ? 'Inplannen' : 'Bekijken' }}
            </AppButton>
          </div>
        </li>
      </ul>

      <AppPagination v-if="lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
    </div>
  </DefaultLayout>
</template>

<style scoped>
.intake-card {
  background: var(--color-bg-card);
  list-style: none;
}
.intake-card-pending {
  background: var(--card-bg-orange);
}
.intake-card-scheduled {
  background: var(--card-bg-teal);
}

.intake-card_user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.intake-card_info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.intake-card_name {
  font-weight: 700;
  font-size: var(--font-size-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intake-card_role {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.intake-card_date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.intake-card_footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: auto;
}
</style>
