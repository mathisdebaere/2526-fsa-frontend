<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useSubscriptionGuard } from '@/composables/useSubscriptionGuard'
import { usePagination } from '@/composables/usePagination'
import type { Appointment, PaginatedResponse } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppointmentTable from '@/components/organisms/AppointmentTable.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'
import NoSubscriptionBanner from '@/components/atoms/NoSubscriptionBanner.vue'

const api = useApi()
const router = useRouter()
const { noSubscription, isExpired } = useSubscriptionGuard()
const { currentPage, goToPage, resetPage } = usePagination()

const activeTab = ref('planned')

watch(activeTab, () => resetPage())

const { data: pageData, isLoading } = useQuery({
  key: () => ['client-matches', activeTab.value, currentPage.value],
  query: () => {
    const params = new URLSearchParams({
      include: 'volunteer.user,helpRequest.category',
      type: 'assistance',
      status: activeTab.value,
      per_page: '15',
      page: String(currentPage.value),
    })
    return api.get<PaginatedResponse<Appointment>>(`/appointments?${params}`)
  },
})

const appointments = computed(() => pageData.value?.data ?? [])
const pagination = computed(() => pageData.value)

const tabs = [
  { value: 'planned', label: 'Actief' },
  { value: 'completed', label: 'Voltooid' },
  { value: 'cancelled', label: 'Geannuleerd' },
]
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Mijn afspraken</h1>
      </header>

      <NoSubscriptionBanner v-if="noSubscription" :expired="isExpired" />

      <template v-else>
        <div class="tab-bar" role="tablist" aria-label="Filter op status">
          <button v-for="tab in tabs" :key="tab.value" role="tab" class="tab-bar_btn" :class="{ 'tab-bar_btn--active': activeTab === tab.value }" @click="activeTab = tab.value">
            {{ tab.label }}
          </button>
        </div>

        <AppointmentTable :appointments="appointments" :loading="isLoading" @view="(id) => router.push(`/appointments/${id}`)" />

        <AppPagination v-if="pagination && pagination.last_page > 1" :current-page="pagination.current_page" :last-page="pagination.last_page" :total="pagination.total" :per-page="pagination.per_page" @page-change="goToPage" />
      </template>
    </div>
  </DefaultLayout>
</template>
