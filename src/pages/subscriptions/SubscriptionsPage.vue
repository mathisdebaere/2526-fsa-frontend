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
import AppSpinner from '@/components/atoms/AppSpinner.vue'

const api = useApi()
const toast = useToast()
const { showConfirmationDialog } = useConfirmDialog()
const cache = useQueryCache()

const statusFilter = ref('')
const clientSearch = ref('')
const createDialog = ref<HTMLDialogElement | null>(null)
const formClientId = ref('')
const formStartDate = ref('')
const formEndDate = ref('')
const formError = ref('')

function openCreate() {
  formClientId.value = ''
  formStartDate.value = ''
  formEndDate.value = ''
  formError.value = ''
  createDialog.value?.showModal()
}

function closeCreate() {
  createDialog.value?.close()
}

const { currentPage, goToPage, resetPage } = usePageState()

watch(statusFilter, () => resetPage())

const { data: pageData, isLoading } = useQuery({
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

const { mutate: createSubscription, isLoading: isSubmitting } = useMutation({
  mutation: (payload: { client_id: number; start_date: string; end_date: string }) => api.post('/subscriptions', payload),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['subscriptions'] })
    toast.success('Abonnement aangemaakt.')
    closeCreate()
  },
  onError: () => toast.error('Aanmaken mislukt.'),
})

let _subSnap: PaginatedResponse<Subscription> | undefined

const { mutate: markPaid, isLoading: paying } = useMutation({
  onMutate(id: number) {
    const key = ['subscriptions', statusFilter.value, currentPage.value]
    _subSnap = cache.getQueryData<PaginatedResponse<Subscription>>(key)
    if (_subSnap) {
      const newData = statusFilter.value === 'pending' ? _subSnap.data.filter((s) => s.id !== id) : _subSnap.data.map((s) => (s.id === id ? { ...s, status: 'active' as const, paid_at: new Date().toISOString() } : s))
      cache.setQueryData<PaginatedResponse<Subscription>>(key, { ..._subSnap, data: newData })
    }
  },
  mutation: (id: number) => api.patch(`/subscriptions/${id}/pay`),
  onSuccess: () => {
    toast.success('Gemarkeerd als betaald.')
  },
  onError: () => {
    if (_subSnap) cache.setQueryData<PaginatedResponse<Subscription>>(['subscriptions', statusFilter.value, currentPage.value], _subSnap)
    toast.error('Mislukt.')
  },
})

const { mutate: cancelSubscription, isLoading: cancelling } = useMutation({
  onMutate(id: number) {
    const key = ['subscriptions', statusFilter.value, currentPage.value]
    _subSnap = cache.getQueryData<PaginatedResponse<Subscription>>(key)
    if (_subSnap) {
      const newData = statusFilter.value === 'pending' || statusFilter.value === 'active' ? _subSnap.data.filter((s) => s.id !== id) : _subSnap.data.map((s) => (s.id === id ? { ...s, status: 'cancelled' as const } : s))
      cache.setQueryData<PaginatedResponse<Subscription>>(key, { ..._subSnap, data: newData })
    }
  },
  mutation: (id: number) => api.put(`/subscriptions/${id}`, { status: 'cancelled' }),
  onSuccess: () => {
    toast.success('Geannuleerd.')
  },
  onError: () => {
    if (_subSnap) cache.setQueryData<PaginatedResponse<Subscription>>(['subscriptions', statusFilter.value, currentPage.value], _subSnap)
    toast.error('Mislukt.')
  },
})

const { mutate: deleteSubscription, isLoading: deleting } = useMutation({
  onMutate(id: number) {
    const key = ['subscriptions', statusFilter.value, currentPage.value]
    _subSnap = cache.getQueryData<PaginatedResponse<Subscription>>(key)
    if (_subSnap) {
      cache.setQueryData<PaginatedResponse<Subscription>>(key, {
        ..._subSnap,
        data: _subSnap.data.filter((s) => s.id !== id),
        total: Math.max(0, _subSnap.total - 1),
      })
    }
  },
  mutation: (id: number) => api.delete(`/subscriptions/${id}`),
  onSuccess: () => {
    toast.success('Verwijderd.')
  },
  onError: () => {
    if (_subSnap) cache.setQueryData<PaginatedResponse<Subscription>>(['subscriptions', statusFilter.value, currentPage.value], _subSnap)
    toast.error('Mislukt.')
  },
})

function handleCreate() {
  formError.value = ''
  if (!formClientId.value || !formStartDate.value || !formEndDate.value) {
    formError.value = 'Vul alle verplichte velden in.'
    return
  }
  if (formEndDate.value < formStartDate.value) {
    formError.value = 'Einddatum moet na de startdatum liggen.'
    return
  }
  createSubscription({
    client_id: Number(formClientId.value),
    start_date: formStartDate.value,
    end_date: formEndDate.value,
  })
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

const statusFilters = [
  { value: '', label: 'Alle' },
  { value: 'pending', label: 'Openstaand' },
  { value: 'active', label: 'Actief' },
  { value: 'cancelled', label: 'Geannuleerd' },
  { value: 'expired', label: 'Verlopen' },
]

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
        <AppButton variant="primary" @click="openCreate"> <i class="fa-solid fa-plus"></i> Abonnement toevoegen </AppButton>
      </header>
      <div class="tab-bar" role="tablist" aria-label="Filter op status">
        <button v-for="f in statusFilters" :key="f.value" role="tab" class="tab-bar_btn" :class="{ 'tab-bar_btn--active': statusFilter === f.value }" @click="statusFilter = f.value">
          {{ f.label }}
        </button>
      </div>

      <label for="subscription-search" class="sr-only">Zoek op cliënt</label>
      <div class="search-wrapper">
        <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true" />
        <input id="subscription-search" v-model="clientSearch" type="search" class="field-input search-input" placeholder="Zoek op cliënt" />
      </div>
      <AppSpinner v-if="isLoading" label="Abonnementen worden ingeladen..." />

      <p v-else-if="!filtered.length" class="page-empty">Geen abonnementen gevonden.</p>
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
            <AppButton v-if="subscription.status === 'pending'" variant="primary" size="sm" :loading="paying" :disabled="paying || cancelling || deleting" @click="markPaid(subscription.id)"> Markeer betaald </AppButton>
            <AppButton v-if="subscription.status === 'pending' || effectiveStatus(subscription) === 'active'" variant="secondary" size="sm" :loading="cancelling" :disabled="paying || cancelling || deleting" @click="cancelSubscription(subscription.id)"> Annuleren </AppButton>
            <AppButton variant="danger" size="sm" :loading="deleting" :disabled="paying || cancelling || deleting" @click="confirmDelete(subscription.id)"> Verwijderen </AppButton>
          </div>
        </li>
      </ul>

      <AppPagination v-if="!isLoading && pageSubscriptions?.length && lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
    </div>

    <dialog ref="createDialog" class="app-dialog" aria-labelledby="create-sub-title" @close="closeCreate">
      <h2 id="create-sub-title" class="dialog-title">Abonnement toevoegen</h2>

      <div class="form-group">
        <label for="subscription-client" class="field-label">Cliënt <span aria-hidden="true"></span></label>
        <select id="subscription-client" v-model="formClientId" class="field-input">
          <option value="" disabled>Kies een cliënt</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.user ? `${client.user.first_name} ${client.user.last_name}` : `Client #${client.id}` }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="subscription-start" class="field-label">Startdatum <span aria-hidden="true"></span></label>
          <input id="subscription-start" v-model="formStartDate" type="date" class="field-input" />
        </div>
        <div class="form-group">
          <label for="subscription-end" class="field-label">Einddatum <span aria-hidden="true"></span></label>
          <input id="subscription-end" v-model="formEndDate" type="date" class="field-input" />
        </div>
      </div>

      <p class="dialog-amount">Bedrag: <strong>€ 5,00</strong> (vast tarief)</p>

      <p v-if="formError" class="dialog-error" role="alert">{{ formError }}</p>

      <div class="dialog-actions">
        <AppButton variant="primary" size="sm" :loading="isSubmitting" @click="handleCreate">Aanmaken</AppButton>
        <AppButton variant="ghost" size="sm" :disabled="isSubmitting" @click="closeCreate">Annuleren</AppButton>
      </div>
    </dialog>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.dialog-amount {
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
.filters .field-input {
  flex: 1;
  width: auto;
}
.search-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--color-text-muted, #888);
  pointer-events: none;
  font-size: 0.875rem;
}
.search-wrapper .field-input {
  padding-left: 2.25rem;
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
  .filters .field-input,
  .search-wrapper {
    width: 100%;
    flex: none;
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
