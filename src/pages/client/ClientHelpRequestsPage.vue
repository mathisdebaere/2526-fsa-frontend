<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useSubscriptionGuard } from '@/composables/useSubscriptionGuard'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { usePageState, usePaginatedData, PER_PAGE } from '@/composables/usePaginatedData'
import type { HelpRequest, HelpRequestCategory, PaginatedResponse } from '@/types/api'
import { formatDate } from '@/utils/date'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'
import NoSubscriptionBanner from '@/components/atoms/NoSubscriptionBanner.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'

const api = useApi()
const toast = useToast()
const cache = useQueryCache()
const router = useRouter()
const { noSubscription, isExpired, isLoading: subChecking } = useSubscriptionGuard()
const { showConfirmationDialog } = useConfirmDialog()
const { currentPage, goToPage, resetPage } = usePageState()

const statusFilter = ref('')
const createDialog = ref<HTMLDialogElement | null>(null)

function openCreate() {
  createDialog.value?.showModal()
}
function closeCreate() {
  createDialog.value?.close()
}

const categoryId = ref('')
const region = ref('')
const date = ref('')
const time = ref('')
const notes = ref('')

watch(statusFilter, () => resetPage())

const { data: pageData, isLoading } = useQuery({
  key: () => ['client-help-requests', statusFilter.value, currentPage.value],
  query: () => {
    const params = new URLSearchParams({ include: 'category', per_page: String(PER_PAGE), page: String(currentPage.value) })
    if (statusFilter.value) params.set('status', statusFilter.value)
    return api.get<PaginatedResponse<HelpRequest>>(`/help-requests?${params}`)
  },
})

const { items: requests, total, lastPage } = usePaginatedData<HelpRequest>(pageData)

const { data: categories } = useQuery({
  key: ['help-request-categories'],
  query: () => api.get<HelpRequestCategory[]>('/help-request-categories'),
})

let _createSnap: PaginatedResponse<HelpRequest> | null = null
let _createSnapKey: unknown[] = []

const { mutate: createRequest, isLoading: isSubmitting } = useMutation({
  onMutate(payload: { help_request_category_id: number; region: string; date: string; time: string; extra_notes?: string }) {
    _createSnapKey = ['client-help-requests', statusFilter.value, currentPage.value]
    _createSnap = cache.getQueryData<PaginatedResponse<HelpRequest>>(_createSnapKey) ?? null
    if (_createSnap) {
      const category = categories.value?.find((c) => c.id === payload.help_request_category_id)
      const optimistic: HelpRequest = {
        id: -Date.now(),
        status: 'open',
        help_request_category_id: payload.help_request_category_id,
        region: payload.region,
        date: payload.date,
        time: payload.time,
        extra_notes: payload.extra_notes ?? null,
        client_id: 0,
        volunteer_id: null,
        category,
      }
      cache.setQueryData<PaginatedResponse<HelpRequest>>(_createSnapKey, {
        ..._createSnap,
        data: [optimistic, ...(_createSnap.data ?? [])],
        total: (_createSnap.total ?? 0) + 1,
      })
    }
    closeCreate()
    categoryId.value = ''
    region.value = ''
    date.value = ''
    time.value = ''
    notes.value = ''
  },
  mutation: (payload: { help_request_category_id: number; region: string; date: string; time: string; extra_notes?: string }) => api.post('/help-requests', payload),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['client-help-requests'] })
    toast.success('Hulpvraag aangemaakt.')
  },
  onError: (err) => {
    if (_createSnap) cache.setQueryData<PaginatedResponse<HelpRequest>>(_createSnapKey, _createSnap)
    toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Aanmaken mislukt.')
  },
})

function handleCreate() {
  if (!categoryId.value || !region.value || !date.value || !time.value) return
  createRequest({
    help_request_category_id: Number(categoryId.value),
    region: region.value,
    date: date.value,
    time: time.value,
    extra_notes: notes.value || undefined,
  })
}

const editingRequest = ref<HelpRequest | null>(null)
const editDialog = ref<HTMLDialogElement | null>(null)
const editCategoryId = ref('')
const editRegion = ref('')
const editDate = ref('')
const editTime = ref('')
const editNotes = ref('')

function openEdit(req: HelpRequest) {
  editingRequest.value = req
  editCategoryId.value = String(req.help_request_category_id)
  editRegion.value = req.region ?? ''
  editDate.value = req.date ?? ''
  editTime.value = req.time?.slice(0, 5) ?? ''
  editNotes.value = req.extra_notes ?? ''
  editDialog.value?.showModal()
}

function closeEdit() {
  editingRequest.value = null
  editDialog.value?.close()
}

let _updateSnap: PaginatedResponse<HelpRequest> | null = null
let _updateSnapKey: unknown[] = []

const { mutate: updateRequest, isLoading: updating } = useMutation({
  onMutate(payload: { id: number; data: Record<string, unknown> }) {
    _updateSnapKey = ['client-help-requests', statusFilter.value, currentPage.value]
    _updateSnap = cache.getQueryData<PaginatedResponse<HelpRequest>>(_updateSnapKey) ?? null
    if (_updateSnap) {
      const categoryIdNum = Number(payload.data.help_request_category_id)
      const category = categories.value?.find((c) => c.id === categoryIdNum)
      cache.setQueryData<PaginatedResponse<HelpRequest>>(_updateSnapKey, {
        ..._updateSnap,
        data: (_updateSnap.data ?? []).map((r) =>
          r.id === payload.id ? { ...r, ...payload.data, category: category ?? r.category } : r,
        ),
      })
    }
    closeEdit()
  },
  mutation: (payload: { id: number; data: Record<string, unknown> }) => api.patch(`/help-requests/${payload.id}`, payload.data),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['client-help-requests'] })
    toast.success('Hulpvraag bijgewerkt')
  },
  onError: (err) => {
    if (_updateSnap) cache.setQueryData<PaginatedResponse<HelpRequest>>(_updateSnapKey, _updateSnap)
    toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Bijwerken mislukt.')
  },
})

function handleUpdate() {
  if (!editCategoryId.value || !editRegion.value || !editDate.value || !editTime.value) return
  updateRequest({
    id: editingRequest.value!.id,
    data: {
      help_request_category_id: Number(editCategoryId.value),
      region: editRegion.value,
      date: editDate.value,
      time: editTime.value,
      extra_notes: editNotes.value || null,
    },
  })
}

// --- Verwijderen ---
const { mutate: deleteRequest, isLoading: deleting } = useMutation({
  mutation: (id: number) => api.delete(`/help-requests/${id}`),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['client-help-requests'] })
    toast.success('Hulpvraag verwijderd')
  },
  onError: () => toast.error('Verwijderen mislukt'),
})

async function confirmDelete(req: HelpRequest) {
  const ok = await showConfirmationDialog(`Weet je zeker dat je de hulpvraag "${req.category?.name ?? '#' + req.id}" wilt verwijderen?`)
  if (ok) deleteRequest(req.id)
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'default'; accent: string }> = {
  open: { label: 'Open', variant: 'info', accent: 'var(--color-primary)' },
  matched: { label: 'Gematcht', variant: 'warning', accent: 'var(--color-yellow)' },
  completed: { label: 'Voltooid', variant: 'success', accent: 'var(--color-sage)' },
  cancelled: { label: 'Geannuleerd', variant: 'danger', accent: 'var(--color-rose)' },
}

const statusFilters = [
  { value: '', label: 'Alle' },
  { value: 'open', label: 'Open' },
  { value: 'matched', label: 'Gematcht' },
  { value: 'completed', label: 'Voltooid' },
]
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Mijn hulpaanvragen</h1>
        <AppButton v-if="!subChecking && !noSubscription" variant="primary" @click="openCreate"><i class="fa-solid fa-plus"></i> Nieuwe hulpvraag</AppButton>
      </header>

      <AppSpinner v-if="subChecking" label="Laden..." />
      <NoSubscriptionBanner v-else-if="noSubscription" :expired="isExpired" />

      <template v-else>
        <div class="tab-bar" role="tablist">
          <button v-for="f in statusFilters" :key="f.value" role="tab" class="tab-bar_btn" :class="{ 'tab-bar_btn--active': statusFilter === f.value }" @click="statusFilter = f.value">
            {{ f.label }}
          </button>
        </div>
        <AppSpinner v-if="isLoading" label="Hulpvragen worden ingeladen..." />

        <p v-else-if="!requests?.length" class="page-empty">Geen hulpvragen gevonden</p>

        <ul v-else role="list" class="card-list">
          <li v-for="req in requests" :key="req.id" class="card helprequest-row">
            <div class="helprequest-row_main">
              <span class="helprequest-row_category">{{ req.category?.name ?? '-' }}</span>
              <div class="helprequest-row_meta">
                <span v-if="req.region"><i class="fa-solid fa-location-dot"></i> {{ req.region }}</span>
                <span v-if="req.date" style="text-transform: capitalize"><i class="fa-solid fa-calendar"></i> {{ formatDate(req.date) }}</span>
                <span v-if="req.time"><i class="fa-solid fa-clock"></i> {{ req.time?.slice(0, 5) }}</span>
              </div>
              <p v-if="req.extra_notes" class="helprequest-row_notes">{{ req.extra_notes }}</p>
            </div>
            <div class="helprequest-row_actions">
              <AppBadge :variant="statusConfig[req.status]?.variant ?? 'default'">
                {{ statusConfig[req.status]?.label ?? req.status }}
              </AppBadge>
              <template v-if="req.status === 'open'">
                <AppButton variant="secondary" size="sm" @click="router.push(`/client/volunteers?help_request_id=${req.id}`)"> <i class="fa-solid fa-magnifying-glass"></i> Zoek vrijwilliger </AppButton>
                <AppButton variant="ghost" size="sm" @click="openEdit(req)"> <i class="fa-solid fa-pen"></i> Bewerken </AppButton>
                <AppButton variant="danger" size="sm" :disabled="deleting" @click="confirmDelete(req)"> <i class="fa-solid fa-trash"></i> Verwijderen </AppButton>
              </template>
              <AppButton v-if="req.status === 'matched'" variant="secondary" size="sm" @click="router.push('/client/appointments')"> <i class="fa-solid fa-calendar-check"></i> Ga naar afspraken </AppButton>
            </div>
          </li>
        </ul>

        <AppPagination v-if="!isLoading && requests?.length && lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
      </template>
    </div>

    <dialog ref="editDialog" class="app-dialog" aria-labelledby="edit-modal-title" @close="editingRequest = null">
      <h2 id="edit-modal-title" class="dialog-title">Hulpvraag bewerken</h2>

      <div class="form-group">
        <label for="edit-cat" class="field-label">Categorie <span aria-hidden="true"></span></label>
        <select id="edit-cat" v-model="editCategoryId" class="field-input" required>
          <option value="" disabled>Kies een categorie</option>
          <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="edit-region" class="field-label">Regio <span aria-hidden="true"></span></label>
        <input id="edit-region" v-model="editRegion" type="text" class="field-input" maxlength="100" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="edit-date" class="field-label">Datum <span aria-hidden="true"></span></label>
          <input id="edit-date" v-model="editDate" type="date" class="field-input" required />
        </div>
        <div class="form-group">
          <label for="edit-time" class="field-label">Tijdstip <span aria-hidden="true"></span></label>
          <input id="edit-time" v-model="editTime" type="time" class="field-input" required />
        </div>
      </div>

      <div class="form-group">
        <label for="edit-notes" class="field-label">Extra toelichting</label>
        <textarea id="edit-notes" v-model="editNotes" class="field-input field-textarea" rows="3" />
      </div>

      <div class="dialog-actions">
        <AppButton variant="primary" size="sm" :loading="updating" @click="handleUpdate">Opslaan</AppButton>
        <AppButton variant="ghost" size="sm" :disabled="updating" @click="closeEdit">Annuleren</AppButton>
      </div>
    </dialog>

    <dialog ref="createDialog" class="app-dialog" aria-labelledby="create-modal-title" @close="closeCreate">
      <h2 id="create-modal-title" class="dialog-title">Nieuwe hulpvraag</h2>

      <div class="form-group">
        <label for="cat" class="field-label">Categorie <span aria-hidden="true"></span></label>
        <select id="cat" v-model="categoryId" class="field-input" required>
          <option value="" disabled>Kies een categorie</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="region" class="field-label">Regio <span aria-hidden="true"></span></label>
        <input id="region" v-model="region" type="text" class="field-input" maxlength="100" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="date" class="field-label">Datum <span aria-hidden="true"></span></label>
          <input id="date" v-model="date" type="date" class="field-input" required />
        </div>
        <div class="form-group">
          <label for="time" class="field-label">Tijdstip <span aria-hidden="true"></span></label>
          <input id="time" v-model="time" type="time" class="field-input" required />
        </div>
      </div>

      <div class="form-group">
        <label for="notes" class="field-label">Extra toelichting</label>
        <textarea id="notes" v-model="notes" class="field-input field-textarea" rows="3" />
      </div>

      <div class="dialog-actions">
        <AppButton variant="primary" size="sm" :loading="isSubmitting" @click="handleCreate">Hulpvraag indienen</AppButton>
        <AppButton variant="ghost" size="sm" :disabled="isSubmitting" @click="closeCreate">Annuleren</AppButton>
      </div>
    </dialog>
  </DefaultLayout>
</template>

<style scoped>
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
.field-textarea {
  resize: vertical;
  min-height: 6rem;
}

.helprequest-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  background: var(--card-bg-orange);
  flex-wrap: wrap;
  list-style: none;
}
.helprequest-row_main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}
.helprequest-row_category {
  font-weight: 700;
  font-size: var(--font-size-base);
}
.helprequest-row_meta {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.helprequest-row_notes {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.helprequest-row_actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
