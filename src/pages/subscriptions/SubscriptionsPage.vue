<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { usePageState, usePaginatedData, PER_PAGE } from '@/composables/usePaginatedData'
import { formatDateCompact } from '@/utils/date'
import type { Subscription, Client, PaginatedResponse } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'

const api = useApi()
const toast = useToast()
const { showConfirmationDialog } = useConfirmDialog()
const cache = useQueryCache()

const statusFilter = ref('')
const clientSearch = ref('')
const showForm = ref(false)
const formClientId = ref('')
const formStartDate = ref('')
const formEndDate = ref('')
const submitting = ref(false)

const { currentPage, goToPage, resetPage } = usePageState()

watch(statusFilter, () => resetPage())

const { data: pageData } = useQuery({
  key: () => ['subscriptions', statusFilter.value, currentPage.value],
  query: () => {
    const params = new URLSearchParams({
      include: 'client.user',
      per_page: String(PER_PAGE),
      page: String(currentPage.value),
    })
    if (statusFilter.value) params.set('status', statusFilter.value)
    return api.get<PaginatedResponse<Subscription>>(`/subscriptions?${params}`)
  },
})

const { data: clientsRaw } = useQuery({
  key: ['clients', 'all-for-select'],
  query: () => api.get<PaginatedResponse<Client>>('/clients?include=user&per_page=999'),
})
const { items: clients } = usePaginatedData<Client>(clientsRaw)

const { items: pageSubscriptions, total, lastPage } = usePaginatedData<Subscription>(pageData)

const filtered = computed<Subscription[]>(() => {
  const list = pageSubscriptions.value
  if (!clientSearch.value.trim()) return list
  const q = clientSearch.value.toLowerCase()
  return list.filter((subscription) => {
    const user = subscription.client?.user
    return user && `${user.first_name} ${user.last_name}`.toLowerCase().includes(q)
  })
})

const { mutate: createSubscription } = useMutation({
  mutation: (payload: { client_id: number; start_date: string; end_date: string }) => api.post('/subscriptions', payload),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['subscriptions'] })
    toast.success('Abonnement aangemaakt.')
    showForm.value = false
    formClientId.value = ''
    formStartDate.value = ''
    formEndDate.value = ''
  },
  onError: () => toast.error('Aanmaken mislukt.'),
})

const { mutate: markPaid } = useMutation({
  mutation: (id: number) => api.patch(`/subscriptions/${id}/pay`),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['subscriptions'] })
    toast.success('Gemarkeerd als betaald.')
  },
  onError: () => toast.error('Mislukt.'),
})

const { mutate: cancelSubscription } = useMutation({
  mutation: (id: number) => api.put(`/subscriptions/${id}`, { status: 'cancelled' }),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['subscriptions'] })
    toast.success('Geannuleerd.')
  },
  onError: () => toast.error('Mislukt.'),
})

const { mutate: deleteSubscription } = useMutation({
  mutation: (id: number) => api.delete(`/subscriptions/${id}`),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['subscriptions'] })
    toast.success('Verwijderd.')
  },
  onError: () => toast.error('Mislukt.'),
})

function handleCreate() {
  if (!formClientId.value || !formStartDate.value || !formEndDate.value) return
  submitting.value = true
  createSubscription({
    client_id: Number(formClientId.value),
    start_date: formStartDate.value,
    end_date: formEndDate.value,
  })
  submitting.value = false
}

async function confirmDelete(id: number) {
  const ok = await showConfirmationDialog('Weet je zeker dat je dit abonnement wilt verwijderen?')
  if (ok) deleteSubscription(id)
}

const today = new Date().toISOString().slice(0, 10)

function effectiveStatus(subscription: Subscription): string {
  if (subscription.status === 'active' && subscription.end_date.slice(0, 10) < today) return 'expired'
  return subscription.status
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default'; accent: string }> = {
  pending: { label: 'Openstaand', variant: 'warning', accent: 'var(--color-orange)' },
  active: { label: 'Actief', variant: 'success', accent: 'var(--color-sage)' },
  cancelled: { label: 'Geannuleerd', variant: 'danger', accent: 'var(--color-rose)' },
  expired: { label: 'Verlopen', variant: 'default', accent: 'var(--color-border)' },
}
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Abonnementen</h1>
        <AppButton variant="primary" @click="showForm = !showForm">
          <template v-if="!showForm"><i class="fa-solid fa-plus"></i> Nieuw abonnement</template>
          <template v-else>Annuleren</template>
        </AppButton>
      </header>

      <form v-if="showForm" class="card subscription-form" @submit.prevent="handleCreate">
        <h2>Nieuw abonnement</h2>
        <div class="form-group">
          <label for="subscription-client" class="field-label">Cliënt <span aria-hidden="true"></span></label>
          <select id="subscription-client" v-model="formClientId" class="field-input" required>
            <option value="" disabled>Kies een cliënt</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.user ? `${client.user.first_name} ${client.user.last_name}` : `Client #${client.id}` }}
            </option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="subscription-start" class="field-label">Startdatum <span aria-hidden="true"></span></label>
            <input id="subscription-start" v-model="formStartDate" type="date" class="field-input" required />
          </div>
          <div class="form-group">
            <label for="subscription-end" class="field-label">Einddatum <span aria-hidden="true"></span></label>
            <input id="subscription-end" v-model="formEndDate" type="date" class="field-input" required />
          </div>
        </div>
        <p class="subscription-form_amount">Bedrag: <strong>€ 5,00</strong> (vast tarief)</p>
        <AppButton type="submit" :loading="submitting">Aanmaken</AppButton>
      </form>
      <div class="filters">
        <label for="subscription-search" class="sr-only">Zoek op cliënt</label>
        <input id="subscription-search" v-model="clientSearch" type="search" class="field-input" placeholder="Zoek op cliënt" />
        <label for="subscription-status" class="sr-only">Filter op status</label>
        <select id="subscription-status" v-model="statusFilter" class="field-input">
          <option value="">Alle statussen</option>
          <option value="pending">Openstaand</option>
          <option value="active">Actief</option>
          <option value="cancelled">Geannuleerd</option>
          <option value="expired">Verlopen</option>
        </select>
      </div>

      <p v-if="!filtered.length" class="page-empty">Geen abonnementen gevonden.</p>
      <ul v-else role="list" class="card-grid">
        <li v-for="subscription in filtered" :key="subscription.id" class="card subscription-card">
          <div class="subscription-card_top">
            <AppAvatar :src="subscription.client?.user?.profile_photo_url" :name="subscription.client?.user ? `${subscription.client.user.first_name} ${subscription.client.user.last_name}` : `#${subscription.client_id}`" size="md" />
            <AppBadge :variant="statusConfig[effectiveStatus(subscription)]?.variant ?? 'default'">
              {{ statusConfig[effectiveStatus(subscription)]?.label ?? subscription.status }}
            </AppBadge>
          </div>

          <div class="subscription-card_info">
            <p class="subscription-card_name">
              {{ subscription.client?.user ? `${subscription.client.user.first_name} ${subscription.client.user.last_name}` : `Client #${subscription.client_id}` }}
            </p>
            <p class="subscription-card_period">{{ formatDateCompact(subscription.start_date) }} t.e.m. {{ formatDateCompact(subscription.end_date) }}</p>
            <p class="subscription-card_detail">
              <strong>€ {{ Number(subscription.amount).toFixed(2).replace('.', ',') }}</strong>
              <span v-if="subscription.paid_at"> betaald op {{ formatDateCompact(subscription.paid_at) }}</span>
            </p>
          </div>

          <div class="subscription-card_actions">
            <AppButton v-if="subscription.status === 'pending'" variant="primary" size="sm" @click="markPaid(subscription.id)"> Markeer betaald </AppButton>
            <AppButton v-if="subscription.status === 'pending' || effectiveStatus(subscription) === 'active'" variant="secondary" size="sm" @click="cancelSubscription(subscription.id)"> Annuleren </AppButton>
            <AppButton variant="danger" size="sm" @click="confirmDelete(subscription.id)"> Verwijderen </AppButton>
          </div>
        </li>
      </ul>

      <AppPagination v-if="lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
    </div>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.subscription-form {
  max-width: 32rem;
  width: 100%;
  background: var(--card-bg-primary);
}
.subscription-form h2 {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  margin: 0;
}
.subscription-form_amount {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}
.field-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
}
.filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
.field-input {
  padding: 0.65rem 0.875rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
  width: 100%;
  min-height: 2.75rem;
  box-sizing: border-box;
}
.field-input:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

@include breakpoint(sm) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

@include breakpoint(mob) {
  .filters {
    flex-direction: column;
  }
}

.subscription-card {
  list-style: none;
}

.subscription-card_top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.subscription-card_info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.subscription-card_name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin: 0;
}
.subscription-card_period {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}
.subscription-card_detail {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}
.subscription-card_detail strong {
  color: var(--color-text);
}

.subscription-card_actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: var(--spacing-sm);
}
</style>
