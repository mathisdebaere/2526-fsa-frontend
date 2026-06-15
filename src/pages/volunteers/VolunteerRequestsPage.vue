<script setup lang="ts">
import { ref } from 'vue'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import type { VolunteerRequest } from '@/types/api'
import { formatDate } from '@/utils/date'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'

const api = useApi()
const toast = useToast()
const cache = useQueryCache()

const requestsKey = ['volunteer-requests-incoming']

const { data: requests, isLoading } = useQuery({
  key: requestsKey,
  query: () => api.get<VolunteerRequest[]>('/volunteer-requests?include=help_request.category,help_request.client.user'),
})

const processingIds = ref(new Set<number>())

const { mutate: respond } = useMutation({
  mutation: ({ id, action }: { id: number; action: 'accept' | 'decline' }) => api.post<VolunteerRequest>(`/volunteer-requests/${id}/${action}`),
  onMutate({ id }) {
    processingIds.value = new Set([...processingIds.value, id])
  },
  onSuccess(updated, { id, action }) {
    processingIds.value = new Set([...processingIds.value].filter((x) => x !== id))
    const current = cache.getQueryData<VolunteerRequest[]>(requestsKey) ?? []
    cache.setQueryData<VolunteerRequest[]>(
      requestsKey,
      current.map((r) => (r.id === id ? { ...r, status: updated.status } : r)),
    )
    toast.success(action === 'accept' ? 'Aanvraag geaccepteerd.' : 'Aanvraag geweigerd.')
  },
  onError(_, { id }) {
    processingIds.value = new Set([...processingIds.value].filter((x) => x !== id))
    toast.error('Actie mislukt. Probeer opnieuw.')
  },
})
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Vrijwilligersaanvragen</h1>
      </header>

      <AppSpinner v-if="isLoading" label="Aanvragen worden ingeladen..." />

      <p v-else-if="!requests?.length" class="page-empty">Geen aanvragen ontvangen.</p>

      <ul v-else role="list" class="card-list">
        <li v-for="req in requests" :key="req.id" class="card request-row">
          <div class="request-row_main">
            <span class="request-row_category">
              {{ req.help_request?.category?.name ?? `Hulpvraag #${req.help_request_id}` }}
            </span>
            <div class="request-row_meta">
              <span v-if="req.help_request?.region"><i class="fa-solid fa-location-dot"></i> {{ req.help_request.region }}</span>
              <span v-if="req.help_request?.date" style="text-transform: capitalize"> <i class="fa-solid fa-calendar"></i> {{ formatDate(req.help_request.date) }} </span>
              <span v-if="req.help_request?.time"><i class="fa-solid fa-clock"></i> {{ req.help_request.time?.slice(0, 5) }}</span>
            </div>
            <p v-if="req.help_request?.client?.user" class="request-row_client">
              <i class="fa-solid fa-user"></i>
              {{ req.help_request.client.user.first_name }} {{ req.help_request.client.user.last_name }}
            </p>
          </div>

          <div class="request-row_actions">
            <RouterLink :to="`/help-requests/${req.help_request_id}`" class="link-btn" @click.stop> Bekijken <i class="fa-solid fa-angle-right"></i> </RouterLink>
            <div v-if="req.status === 'pending'" class="request-row_btns">
              <AppButton variant="primary" size="sm" :loading="processingIds.has(req.id)" @click="respond({ id: req.id, action: 'accept' })"> <i class="fa-solid fa-check"></i> Accepteren </AppButton>
              <AppButton variant="danger" size="sm" :loading="processingIds.has(req.id)" @click="respond({ id: req.id, action: 'decline' })"> <i class="fa-solid fa-xmark"></i> Weigeren </AppButton>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.request-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  background: var(--card-bg-teal);
  position: relative;
  list-style: none;
}

.request-row_main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.request-row_category {
  font-weight: 700;
  font-size: var(--font-size-base);
}

.request-row_meta {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.request-row_client {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.request-row_status {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
}

.request-row_actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  flex-shrink: 0;
  justify-content: flex-end;
}

.request-row_btns {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 600px) {
  .request-row {
    flex-direction: column;
    align-items: stretch;
  }

  .request-row_actions {
    flex-shrink: unset;
    justify-content: flex-start;
    width: 100%;
  }

  .request-row_btns {
    flex-direction: column;
    width: 100%;
  }

  .request-row_btns :deep(.btn),
  .request-row_actions .link-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
