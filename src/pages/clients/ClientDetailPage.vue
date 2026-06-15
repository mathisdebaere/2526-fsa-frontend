<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { usePaginatedData } from '@/composables/usePaginatedData'
import { formatDateCompact as formatDate } from '@/utils/date'
import type { Client, Subscription, PaginatedResponse } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import ConfirmDialog from '@/components/atoms/ConfirmDialog.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import FormField from '@/components/molecules/FormField.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const cache = useQueryCache()
const { showConfirmationDialog } = useConfirmDialog()
const id = Number(route.params.id)

const { data: client, isLoading } = useQuery({
  key: ['clients', id],
  query: () => api.get<Client>(`/clients/${id}?include=user`),
})

const { data: subscriptionsRaw } = useQuery({
  key: ['subscriptions', 'client', id],
  query: () => api.get<Subscription[]>(`/subscriptions?client_id=${id}`),
  enabled: auth.isAdvisor,
})

const { items: subscriptions } = usePaginatedData<Subscription>(subscriptionsRaw)

const today = new Date().toISOString().slice(0, 10)
const isClientActive = computed(() => subscriptions.value.some((subscription) => subscription.status === 'active' && subscription.end_date.slice(0, 10) >= today))

const subscriptionStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  pending: { label: 'Openstaand', variant: 'warning' },
  active: { label: 'Actief', variant: 'success' },
  cancelled: { label: 'Geannuleerd', variant: 'danger' },
  expired: { label: 'Verlopen', variant: 'default' },
}

function effectiveStatus(subscription: Subscription): string {
  if (subscription.status === 'active' && subscription.end_date.slice(0, 10) < today) return 'expired'
  return subscription.status
}

let _subListSnap: PaginatedResponse<Subscription> | Subscription[] | undefined
let _clientSnap: Client | undefined

const { mutate: markPaid, isLoading: paying } = useMutation({
  onMutate(subscriptionId: number) {
    const raw = cache.getQueryData(['subscriptions', 'client', id])
    _subListSnap = raw as typeof _subListSnap
    if (!raw) return
    const updateSub = (s: Subscription): Subscription => (s.id === subscriptionId ? { ...s, status: 'active', paid_at: new Date().toISOString() } : s)
    if (Array.isArray(raw)) {
      cache.setQueryData<Subscription[]>(['subscriptions', 'client', id], (raw as Subscription[]).map(updateSub))
    } else {
      const p = raw as PaginatedResponse<Subscription>
      cache.setQueryData<PaginatedResponse<Subscription>>(['subscriptions', 'client', id], { ...p, data: p.data.map(updateSub) })
    }
  },
  mutation: (subscriptionId: number) => api.patch(`/subscriptions/${subscriptionId}/pay`),
  onSuccess: () => {
    toast.success('Gemarkeerd als betaald.')
  },
  onError: () => {
    if (_subListSnap !== undefined) cache.setQueryData(['subscriptions', 'client', id], _subListSnap as Subscription[])
    toast.error('Mislukt.')
  },
})

const { mutate: cancelSubscription, isLoading: cancelling } = useMutation({
  onMutate(subscriptionId: number) {
    const raw = cache.getQueryData(['subscriptions', 'client', id])
    _subListSnap = raw as typeof _subListSnap
    if (!raw) return
    const updateSub = (s: Subscription): Subscription => (s.id === subscriptionId ? { ...s, status: 'cancelled' } : s)
    if (Array.isArray(raw)) {
      cache.setQueryData<Subscription[]>(['subscriptions', 'client', id], (raw as Subscription[]).map(updateSub))
    } else {
      const p = raw as PaginatedResponse<Subscription>
      cache.setQueryData<PaginatedResponse<Subscription>>(['subscriptions', 'client', id], { ...p, data: p.data.map(updateSub) })
    }
  },
  mutation: (subscriptionId: number) => api.put(`/subscriptions/${subscriptionId}`, { status: 'cancelled' }),
  onSuccess: () => {
    toast.success('Geannuleerd.')
  },
  onError: () => {
    if (_subListSnap !== undefined) cache.setQueryData(['subscriptions', 'client', id], _subListSnap as Subscription[])
    toast.error('Mislukt.')
  },
})

const subscriptionDialog = ref<HTMLDialogElement | null>(null)
const newSubscriptionStart = ref('')
const newSubscriptionEnd = ref('')

function openSubscriptionCreate() {
  subscriptionDialog.value?.showModal()
}
function closeSubscriptionCreate() {
  subscriptionDialog.value?.close()
  newSubscriptionStart.value = ''
  newSubscriptionEnd.value = ''
}

const { mutate: createSubscription, isLoading: creatingSubscription } = useMutation({
  mutation: () =>
    api.post('/subscriptions', {
      client_id: client.value!.id,
      start_date: newSubscriptionStart.value,
      end_date: newSubscriptionEnd.value,
    }),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['subscriptions', 'client', id] })
    toast.success('Abonnement aangemaakt.')
    closeSubscriptionCreate()
  },
  onError: () => toast.error('Aanmaken mislukt.'),
})

const editingProfile = ref(false)
const profileFirstName = ref('')
const profileLastName = ref('')
const profileEmail = ref('')
const profilePhone = ref('')
const profileDob = ref('')

watch(
  () => client.value?.user,
  (u) => {
    if (!u) return
    profileFirstName.value = u.first_name ?? ''
    profileLastName.value = u.last_name ?? ''
    profileEmail.value = u.email ?? ''
    profilePhone.value = u.phone ?? ''
    profileDob.value = u.date_of_birth ?? ''
  },
  { immediate: true },
)

const { mutate: saveProfile, isLoading: savingProfile } = useMutation({
  onMutate() {
    _clientSnap = cache.getQueryData<Client>(['clients', id])
    if (_clientSnap?.user) {
      cache.setQueryData<Client>(['clients', id], {
        ..._clientSnap,
        user: {
          ..._clientSnap.user,
          first_name: profileFirstName.value,
          last_name: profileLastName.value,
          ...(profileEmail.value ? { email: profileEmail.value } : {}),
          ...(profilePhone.value ? { phone: profilePhone.value } : {}),
          ...(profileDob.value ? { date_of_birth: profileDob.value } : {}),
        },
      })
    }
  },
  mutation: () => {
    const payload: Record<string, string> = {
      first_name: profileFirstName.value,
      last_name: profileLastName.value,
    }
    if (profileEmail.value) payload.email = profileEmail.value
    if (profilePhone.value) payload.phone = profilePhone.value
    if (profileDob.value) payload.date_of_birth = profileDob.value
    return api.put(`/users/${client.value!.user_id}`, payload)
  },
  onSuccess: () => {
    toast.success('Profiel bijgewerkt.')
    editingProfile.value = false
  },
  onError: () => {
    if (_clientSnap) cache.setQueryData<Client>(['clients', id], _clientSnap)
    toast.error('Bijwerken mislukt.')
  },
})

const editingDesc = ref(false)
const descText = ref('')

watch(
  () => client.value?.personal_description,
  (val) => {
    descText.value = val ?? ''
  },
  { immediate: true },
)

function cancelDescEdit() {
  editingDesc.value = false
  descText.value = client.value?.personal_description ?? ''
}

const { mutate: saveDesc, isLoading: savingDesc } = useMutation({
  onMutate() {
    _clientSnap = cache.getQueryData<Client>(['clients', id])
    if (_clientSnap) cache.setQueryData<Client>(['clients', id], { ..._clientSnap, personal_description: descText.value })
  },
  mutation: () => api.put(`/clients/${id}`, { personal_description: descText.value }),
  onSuccess: () => {
    toast.success('Beschrijving opgeslagen.')
    editingDesc.value = false
  },
  onError: () => {
    if (_clientSnap) cache.setQueryData<Client>(['clients', id], _clientSnap)
    toast.error('Opslaan mislukt.')
  },
})

const editingNotes = ref(false)
const bgNotes = ref('')

watch(
  () => client.value?.background_notes,
  (val) => {
    bgNotes.value = val ?? ''
  },
  { immediate: true },
)

function cancelNotesEdit() {
  editingNotes.value = false
  bgNotes.value = client.value?.background_notes ?? ''
}

const { mutate: saveNotes, isLoading: savingNotes } = useMutation({
  onMutate() {
    _clientSnap = cache.getQueryData<Client>(['clients', id])
    if (_clientSnap) cache.setQueryData<Client>(['clients', id], { ..._clientSnap, background_notes: bgNotes.value })
  },
  mutation: () => api.put(`/clients/${id}`, { background_notes: bgNotes.value }),
  onSuccess: () => {
    toast.success('Notities opgeslagen.')
    editingNotes.value = false
  },
  onError: () => {
    if (_clientSnap) cache.setQueryData<Client>(['clients', id], _clientSnap)
    toast.error('Opslaan mislukt.')
  },
})

const { mutate: deleteUser, isLoading: deleting } = useMutation({
  mutation: () => api.delete(`/users/${client.value!.user_id}`),
  onSuccess: () => {
    toast.success('Gebruiker verwijderd.')
    router.push('/clients')
  },
  onError: () => toast.error('Verwijderen mislukt.'),
})
async function confirmDelete() {
  const ok = await showConfirmationDialog(`Weet je zeker dat je ${client.value?.user?.first_name} ${client.value?.user?.last_name} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)
  if (ok) deleteUser()
}
</script>

<template>
  <DefaultLayout>
    <ConfirmDialog />
    <div class="page-wrap">
      <button class="back-btn" @click="router.push('/clients')"><i class="fa-solid fa-angle-left"></i> Terug</button>
      <AppSpinner v-if="isLoading" label="Dienstvrager wordt ingeladen..." />

      <template v-else-if="client">
        <header class="detail-header card">
          <AppAvatar :src="client.user?.profile_photo_url" :name="`${client.user?.first_name} ${client.user?.last_name}`" size="lg" />
          <div class="detail-header_info">
            <h1>{{ client.user?.first_name }} {{ client.user?.last_name }}</h1>
            <p class="detail-sub">{{ client.user?.email ?? client.user?.phone ?? 'Onbekend' }}</p>
            <p v-if="client.user?.phone && client.user?.email" class="detail-sub">
              {{ client.user.phone }}
            </p>
            <AppBadge :variant="isClientActive ? 'success' : 'danger'">
              {{ isClientActive ? 'Actief lid' : 'Niet actief' }}
            </AppBadge>
          </div>
        </header>

        <div class="detail-grid">
          <section class="card desc-card" aria-labelledby="desc-heading">
            <div class="card-header">
              <h2 id="desc-heading" class="section-title">Over mij</h2>
              <button v-if="auth.isAdvisor && !editingDesc" class="edit-btn" @click="editingDesc = true">Bewerken</button>
            </div>
            <template v-if="!editingDesc">
              <p v-if="client.personal_description" class="detail-text" style="white-space: pre-wrap">
                {{ client.personal_description }}
              </p>
              <p v-else class="detail-empty">Geen beschrijving opgegeven.</p>
            </template>
            <template v-else>
              <textarea v-model="descText" class="field-textarea" rows="5" maxlength="500" />
              <div class="action-row">
                <AppButton size="sm" :loading="savingDesc" @click="saveDesc()">Opslaan</AppButton>
                <AppButton variant="ghost" size="sm" @click="cancelDescEdit">Annuleren</AppButton>
              </div>
            </template>
          </section>
          <section v-if="auth.isAdvisor" class="card profile-card" aria-labelledby="profile-heading">
            <div class="card-header">
              <h2 id="profile-heading" class="section-title">Profielinfo</h2>
              <button v-if="!editingProfile" class="edit-btn" @click="editingProfile = true">Bewerken</button>
            </div>
            <template v-if="!editingProfile">
              <!---dl en dt voor screenreader voordelen-->
              <dl class="info-dl">
                <dt>Voornaam</dt>
                <dd>{{ client.user?.first_name ?? 'Onbekend”' }}</dd>
                <dt>Achternaam</dt>
                <dd>{{ client.user?.last_name ?? 'Onbekend' }}</dd>
                <dt>E-mail</dt>
                <dd>{{ client.user?.email ?? 'Onbekend' }}</dd>
                <dt>Telefoon</dt>
                <dd>{{ client.user?.phone ?? 'Onbekend' }}</dd>
                <dt>Geboortedatum</dt>
                <dd>{{ client.user?.date_of_birth ? formatDate(client.user.date_of_birth) : 'Onbekend' }}</dd>
              </dl>
            </template>
            <template v-else>
              <div class="form-stack">
                <FormField v-model="profileFirstName" label="Voornaam" :required="true" />
                <FormField v-model="profileLastName" label="Achternaam" :required="true" />
                <FormField v-model="profileEmail" label="E-mailadres" type="email" />
                <FormField v-model="profilePhone" label="Telefoonnummer" type="tel" />
                <FormField v-model="profileDob" label="Geboortedatum" type="date" />
              </div>
              <div class="action-row">
                <AppButton size="sm" :loading="savingProfile" @click="saveProfile()">Opslaan</AppButton>
                <AppButton variant="ghost" size="sm" @click="editingProfile = false">Annuleren</AppButton>
              </div>
            </template>
          </section>

          <section v-if="auth.isAdvisor" class="card notes-card" aria-labelledby="notes-heading">
            <div class="card-header">
              <h2 id="notes-heading" class="section-title">Interne notities</h2>
              <button v-if="!editingNotes" class="edit-btn" @click="editingNotes = true">Bewerken</button>
            </div>
            <template v-if="!editingNotes">
              <p v-if="client.background_notes" class="detail-text" style="white-space: pre-wrap">
                {{ client.background_notes }}
              </p>
              <p v-else class="detail-empty">Geen interne notities.</p>
            </template>
            <template v-else>
              <textarea v-model="bgNotes" class="field-textarea" rows="5" />
              <div class="action-row">
                <AppButton size="sm" :loading="savingNotes" @click="saveNotes()">Opslaan</AppButton>
                <AppButton variant="ghost" size="sm" @click="cancelNotesEdit">Annuleren</AppButton>
              </div>
            </template>
          </section>

          <section v-if="auth.isAdvisor" class="card subscription-card" aria-labelledby="subs-heading">
            <div class="card-header">
              <h2 id="subs-heading" class="section-title">Abonnementen</h2>
              <button class="edit-btn" @click="openSubscriptionCreate"><i class="fa-solid fa-plus"></i> Nieuw</button>
            </div>

            <p v-if="!subscriptions?.length" class="detail-empty">Geen abonnementen gevonden.</p>
            <ul v-else class="subscription-list">
              <li v-for="subscription in subscriptions" :key="subscription.id" class="subscription-item">
                <div class="subscription-item_info">
                  <AppBadge :variant="subscriptionStatusConfig[effectiveStatus(subscription)]?.variant ?? 'default'">
                    {{ subscriptionStatusConfig[effectiveStatus(subscription)]?.label ?? subscription.status }}
                  </AppBadge>
                  <span class="subscription-item_period">{{ formatDate(subscription.start_date) }} - {{ formatDate(subscription.end_date) }}</span>
                  <span class="subscription-item_amount">€ {{ Number(subscription.amount).toFixed(2).replace('.', ',') }}</span>
                  <span v-if="subscription.paid_at" class="subscription-item_paid">Betaald op {{ formatDate(subscription.paid_at) }}</span>
                </div>
                <div class="subscription-item_actions">
                  <AppButton v-if="subscription.status === 'pending'" variant="primary" size="sm" :loading="paying" :disabled="paying || cancelling" @click="markPaid(subscription.id)">Markeer betaald</AppButton>
                  <AppButton v-if="subscription.status === 'pending' || effectiveStatus(subscription) === 'active'" variant="secondary" size="sm" :loading="cancelling" :disabled="paying || cancelling" @click="cancelSubscription(subscription.id)">Annuleren</AppButton>
                </div>
              </li>
            </ul>
          </section>

          <section v-if="auth.isAdvisor" class="card danger-card" aria-label="Gebruiker verwijderen">
            <h2 class="section-title section-title--danger">Gebruiker verwijderen</h2>
            <p class="detail-text">Dit verwijdert de gebruiker en alle gekoppelde gegevens</p>
            <div>
              <AppButton variant="danger" size="sm" :loading="deleting" @click="confirmDelete()">Gebruiker verwijderen</AppButton>
            </div>
          </section>
        </div>
      </template>

      <p v-else class="page-empty">Dienstvrager niet gevonden</p>
    </div>
  </DefaultLayout>

  <dialog ref="subscriptionDialog" class="app-dialog" aria-labelledby="sub-modal-title" @close="closeSubscriptionCreate">
    <h2 id="sub-modal-title" class="dialog-title">Abonnement toevoegen</h2>

    <div class="form-row">
      <div class="form-group">
        <label for="sub-start" class="field-label">Startdatum</label>
        <input id="sub-start" v-model="newSubscriptionStart" type="date" class="field-input" required />
      </div>
      <div class="form-group">
        <label for="sub-end" class="field-label">Einddatum</label>
        <input id="sub-end" v-model="newSubscriptionEnd" type="date" class="field-input" required />
      </div>
    </div>

    <p class="sub-form_note">Bedrag: <strong>€ 5,00</strong> (vast tarief)</p>

    <div class="dialog-actions">
      <AppButton variant="primary" size="sm" :loading="creatingSubscription" @click="createSubscription()">Aanmaken</AppButton>
      <AppButton variant="ghost" size="sm" :disabled="creatingSubscription" @click="closeSubscriptionCreate">Annuleren</AppButton>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.detail-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-md);
  background: var(--card-bg-primary);
}
.detail-header_info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}
.detail-header_info h1 {
  margin: 0;
}
.detail-sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

@include breakpoint(md) {
  .detail-header {
    padding: var(--spacing-lg);
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(22rem, 100%), 1fr));
  gap: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}
.section-title--danger {
  color: var(--color-danger);
}

.detail-text {
  font-size: var(--font-size-sm);
  line-height: 1.7;
  margin: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}
.detail-empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.desc-card {
  background: var(--card-bg-teal);
}
.profile-card {
  background: var(--card-bg-primary);
}
.notes-card {
  background: var(--card-bg-orange);
}
.subscription-card {
  background: var(--card-bg-sage);
}
.danger-card {
  background: var(--card-bg-danger);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.edit-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 0.3rem 0.75rem;
  font-family: var(--font-body);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}
.edit-btn:hover {
  background: var(--color-primary-light);
}
.edit-btn:focus-visible {
  outline: 3px solid var(--color-focus);
}

.info-dl {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 0.4rem var(--spacing-sm);
  font-size: var(--font-size-sm);
}
.info-dl dt {
  font-weight: 600;
  color: var(--color-text-muted);
}
.info-dl dd {
  margin: 0;
  word-break: break-word;
  text-align: right;
}

@include breakpoint(mob) {
  .info-dl {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .info-dl dt {
    margin-top: 0.5rem;
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .info-dl dt:first-child {
    margin-top: 0;
  }
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.field-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  resize: vertical;
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 7rem;
}
.field-textarea:focus-visible {
  outline: 3px solid var(--color-focus);
  border-color: var(--color-primary);
}

.action-row {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

@include breakpoint(sm) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.form-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
}
.field-input {
  padding: 0.6rem 0.75rem;
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
}
.sub-form_note {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.subscription-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.subscription-item {
  background: var(--color-bg);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.subscription-item_info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
}
.subscription-item_period {
  color: var(--color-text-muted);
}
.subscription-item_amount {
  font-weight: 700;
}
.subscription-item_paid {
  color: var(--color-text-muted);
  font-style: italic;
}
.subscription-item_actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
</style>
