<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useFormErrors } from '@/composables/useFormErrors'
import { formatDateCompact as formatDate } from '@/utils/date'
import type { User, Subscription, Volunteer, Availability, Client, HelpRequestCategory, Review } from '@/types/api'
import AppBadge from '@/components/atoms/AppBadge.vue'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import FormField from '@/components/molecules/FormField.vue'

const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const cache = useQueryCache()
const { generalError, setFromApiError, clear } = useFormErrors()

const editMode = ref(false)
const firstName = ref(auth.user?.first_name ?? '')
const lastName = ref(auth.user?.last_name ?? '')
const phone = ref(auth.user?.phone ?? '')
const email = ref(auth.user?.email ?? '')
const dob = ref(auth.user?.date_of_birth ?? '')

const { data: user } = useQuery({
  key: ['user'],
  query: () => api.get<User>('/user'),
})

const { mutate: updateProfile, isLoading: saving } = useMutation({
  mutation: (data: Partial<User>) => api.put<User>(`/users/${auth.user!.id}`, data),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['user'] })
    toast.success('Profiel bijgewerkt.')
    editMode.value = false
  },
  onError: (err) => setFromApiError(err),
})

const photoInput = ref<HTMLInputElement | null>(null)
const uploadingPhoto = ref(false)

async function handlePhotoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('photo', file)
  uploadingPhoto.value = true
  try {
    await api.postMultipart(`/users/${auth.user!.id}/photo`, form)
    cache.invalidateQueries({ key: ['user'] })
    toast.success('Profielfoto bijgewerkt.')
  } catch {
    toast.error('Foto upload mislukt.')
  } finally {
    uploadingPhoto.value = false
  }
}

function startEdit() {
  firstName.value = user.value?.first_name ?? auth.user?.first_name ?? ''
  lastName.value = user.value?.last_name ?? auth.user?.last_name ?? ''
  phone.value = user.value?.phone ?? auth.user?.phone ?? ''
  email.value = user.value?.email ?? auth.user?.email ?? ''
  dob.value = user.value?.date_of_birth ?? auth.user?.date_of_birth ?? ''
  clear()
  editMode.value = true
}

function handleSave() {
  const payload: Partial<User> = {
    first_name: firstName.value,
    last_name: lastName.value,
  }
  if (phone.value) payload.phone = phone.value
  if (email.value) payload.email = email.value
  if (dob.value) payload.date_of_birth = dob.value
  updateProfile(payload)
}

const { data: subscriptions, isLoading: loadingSubs } = useQuery({
  key: ['subscriptions', 'mine'],
  query: async (): Promise<Subscription[]> => {
    const res = await api.get<Subscription[] | { data?: Subscription[] }>('/subscriptions')
    if (Array.isArray(res)) return res
    return (res as { data?: Subscription[] }).data ?? []
  },
  enabled: () => auth.isClient,
})

const activeSubscription = computed(() => {
  const list = Array.isArray(subscriptions.value) ? subscriptions.value : []
  return list.find((s) => s.status === 'active') ?? list.find((s) => s.status === 'pending') ?? list[0] ?? null
})

const subStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  pending: { label: 'Openstaand (niet betaald)', variant: 'warning' },
  active: { label: 'Actief', variant: 'success' },
  cancelled: { label: 'Geannuleerd', variant: 'danger' },
  expired: { label: 'Verlopen', variant: 'default' },
}

function effectiveSubStatus(sub: { status: string; end_date: string }): string {
  const today = new Date().toISOString().slice(0, 10)
  if (sub.status === 'active' && sub.end_date.slice(0, 10) < today) return 'expired'
  return sub.status
}

const { data: clientProfile } = useQuery({
  key: ['client-profile', auth.user?.id ?? 0],
  query: async () => {
    const u = await api.get<User & { client?: Client }>('/user?include=client')
    return u.client ?? null
  },
  enabled: computed(() => auth.isClient),
})

const editingClientDesc = ref(false)
const clientDescText = ref('')

watch(
  () => clientProfile.value?.personal_description,
  (val) => {
    clientDescText.value = val ?? ''
  },
  { immediate: true },
)

function cancelClientDescEdit() {
  editingClientDesc.value = false
  clientDescText.value = clientProfile.value?.personal_description ?? ''
}

const { mutate: saveClientDesc, isLoading: savingClientDesc } = useMutation({
  mutation: () => api.put(`/clients/${clientProfile.value!.id}`, { personal_description: clientDescText.value }),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['client-profile', auth.user?.id ?? 0] })
    toast.success('Beschrijving opgeslagen.')
    editingClientDesc.value = false
  },
  onError: () => toast.error('Opslaan mislukt.'),
})

const editingDesc = ref(false)
const descriptionText = ref('')

function cancelDescEdit() {
  editingDesc.value = false
  descriptionText.value = volunteerProfile.value?.personal_description ?? ''
}

const { mutate: saveDescription, isLoading: savingDesc } = useMutation({
  mutation: () => api.put(`/volunteers/${volunteerProfile.value!.id}`, { personal_description: descriptionText.value }),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['volunteer-profile', auth.user?.id ?? 0] })
    toast.success('Beschrijving opgeslagen.')
    editingDesc.value = false
  },
  onError: () => toast.error('Opslaan mislukt.'),
})

const availabilityDate = ref('')
const availabilityTimeOfDay = ref<'morning' | 'afternoon' | 'evening'>('morning')

const timeLabels: Record<string, string> = {
  morning: 'Ochtend',
  afternoon: 'Namiddag',
  evening: 'Avond',
}

const { data: volunteerProfile, isLoading: loadingVolunteer } = useQuery({
  key: ['volunteer-profile', auth.user?.id ?? 0],
  query: async () => {
    type UserWithVolunteer = User & { volunteer?: { id: number } }
    const u = await api.get<UserWithVolunteer>('/user?include=volunteer')
    if (!u.volunteer?.id) return null
    return api.get<Volunteer>(`/volunteers/${u.volunteer.id}?include=availabilities,categories`)
  },
  enabled: auth.isVolunteer,
})

watch(
  () => volunteerProfile.value?.personal_description,
  (val) => {
    descriptionText.value = val ?? ''
  },
  { immediate: true },
)

const myAvailabilities = computed<Availability[]>(() => (volunteerProfile.value?.availabilities ?? []).sort((a, b) => a.date.localeCompare(b.date)))

const { mutate: addAvail, isLoading: addingAvail } = useMutation({
  mutation: () =>
    api.post(`/volunteers/${volunteerProfile.value!.id}/availabilities`, {
      date: availabilityDate.value,
      time_of_day: availabilityTimeOfDay.value,
    }),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['volunteer-profile', auth.user?.id ?? 0] })
    toast.success('Beschikbaarheid toegevoegd.')
    availabilityDate.value = ''
  },
  onError: (err) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Toevoegen mislukt.'),
})

const { mutate: removeAvailability } = useMutation({
  mutation: (availId: number) => api.delete(`/volunteers/${volunteerProfile.value!.id}/availabilities/${availId}`),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['volunteer-profile', auth.user?.id ?? 0] })
    toast.success('Beschikbaarheid verwijderd.')
  },
  onError: (err) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Verwijderen mislukt.'),
})

function handleAddAvailability() {
  if (!availabilityDate.value) return
  if (!volunteerProfile.value) {
    toast.error('Profiel niet geladen')
    return
  }
  addAvail()
}

const { data: myReviews } = useQuery({
  key: () => ['volunteer-reviews', volunteerProfile.value?.id ?? 0],
  query: () => api.get<Review[]>(`/volunteers/${volunteerProfile.value!.id}/reviews?include=client.user,appointment.helpRequest.category`),
  enabled: () => auth.isVolunteer && !!volunteerProfile.value?.id,
})

const { data: allCategories } = useQuery({
  key: ['help-request-categories'],
  query: () => api.get<HelpRequestCategory[]>('/help-request-categories'),
  enabled: auth.isVolunteer,
})

const editingCategories = ref(false)
const selectedCategoryIds = ref<number[]>([])

watch(
  () => volunteerProfile.value?.categories,
  (cats) => {
    selectedCategoryIds.value = cats?.map((c) => c.id) ?? []
  },
  { immediate: true },
)

function startEditCategories() {
  selectedCategoryIds.value = volunteerProfile.value?.categories?.map((c) => c.id) ?? []
  editingCategories.value = true
}

function cancelEditCategories() {
  selectedCategoryIds.value = volunteerProfile.value?.categories?.map((c) => c.id) ?? []
  editingCategories.value = false
}

function toggleCategory(id: number) {
  const idx = selectedCategoryIds.value.indexOf(id)
  if (idx === -1) selectedCategoryIds.value.push(id)
  else selectedCategoryIds.value.splice(idx, 1)
}

const roleLabels: Record<string, string> = { client: 'Dienstvrager', volunteer: 'Vrijwilliger', advisor: 'Adviseur' }
const roleLabel = computed(() => (auth.user ? (roleLabels[auth.user.role] ?? auth.user.role) : 'Onbekend'))

const { mutate: saveCategories, isLoading: savingCategories } = useMutation({
  mutation: () =>
    api.put(`/volunteers/${volunteerProfile.value!.id}/categories`, {
      category_ids: selectedCategoryIds.value,
    }),
  onSuccess: () => {
    cache.invalidateQueries({ key: ['volunteer-profile', auth.user!.id] })
    toast.success('Categorieën opgeslagen.')
    editingCategories.value = false
  },
  onError: () => toast.error('Opslaan mislukt.'),
})
</script>

<template>
  <DefaultLayout>
    <div class="profile">
      <h1 class="profile_title">Mijn profiel</h1>
      <div class="profile_top">
        <section class="profile_card" aria-label="Profielgegevens">
          <div class="profile_card-top">
            <div class="profile_avatar-wrap">
              <AppAvatar :src="(user ?? auth.user)?.profile_photo_url" :name="`${auth.user?.first_name} ${auth.user?.last_name}`" size="lg" />
              <button class="profile_photo-btn" :disabled="uploadingPhoto" :aria-label="uploadingPhoto ? 'Bezig met uploaden...' : 'Foto wijzigen'" @click="photoInput?.click()">
                {{ uploadingPhoto ? 'Uploading...' : 'Foto wijzigen' }}
              </button>
              <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" tabindex="-1" aria-hidden="true" @change="handlePhotoUpload" />
            </div>
            <div v-if="!editMode" class="profile_card-header">
              <AppButton variant="ghost" size="sm" @click="startEdit">Bewerken</AppButton>
            </div>
          </div>

          <div class="profile_details">
            <template v-if="!editMode">
              <dl class="profile_dl">
                <dt>Naam</dt>
                <dd>{{ (user ?? auth.user)?.first_name }} {{ (user ?? auth.user)?.last_name }}</dd>
                <dt>E-mailadres</dt>
                <dd :class="{ 'value-unknown': !(user ?? auth.user)?.email }">{{ (user ?? auth.user)?.email ?? 'Onbekend' }}</dd>
                <dt>Telefoon</dt>
                <dd :class="{ 'value-unknown': !(user ?? auth.user)?.phone }">{{ (user ?? auth.user)?.phone ?? 'Onbekend' }}</dd>
                <template v-if="!auth.isAdvisor">
                  <dt>Geboortedatum</dt>
                  <dd :class="{ 'value-unknown': !(user ?? auth.user)?.date_of_birth }">{{ (user ?? auth.user)?.date_of_birth ? formatDate((user ?? auth.user)!.date_of_birth!) : 'Onbekend' }}</dd>
                </template>
                <dt>Rol</dt>
                <dd>{{ roleLabel }}</dd>
              </dl>
            </template>

            <template v-else>
              <div v-if="generalError" class="profile_error" role="alert">{{ generalError }}</div>
              <div class="profile_form">
                <FormField v-model="firstName" label="Voornaam" :required="true" />
                <FormField v-model="lastName" label="Achternaam" :required="true" />
                <FormField v-if="!auth.isAdvisor" v-model="dob" label="Geboortedatum" type="date" />
                <FormField v-if="auth.isAdvisor || !(user ?? auth.user)?.email" v-model="email" label="E-mailadres" type="email" />
                <FormField v-if="auth.isAdvisor || !(user ?? auth.user)?.phone" v-model="phone" label="Telefoonnummer" type="tel" />
              </div>
              <div class="profile_actions">
                <AppButton variant="primary" size="sm" :loading="saving" @click="handleSave">Opslaan</AppButton>
                <AppButton variant="ghost" size="sm" @click="editMode = false">Annuleren</AppButton>
              </div>
            </template>
          </div>
        </section>

        <section v-if="auth.isClient" class="profile_card profile_aboutme" aria-labelledby="client-aboutme-heading">
          <div class="aboutme_header">
            <h2 id="client-aboutme-heading" class="profile_sub-title">Over mij</h2>
            <AppButton v-if="!editingClientDesc" variant="ghost" size="sm" @click="editingClientDesc = true">Bewerken</AppButton>
          </div>

          <template v-if="!editingClientDesc">
            <p v-if="clientProfile?.personal_description" class="aboutme_text">
              {{ clientProfile.personal_description }}
            </p>
            <p v-else class="profile_sub-empty">Nog geen beschrijving.</p>
          </template>

          <template v-else>
            <textarea v-model="clientDescText" class="aboutme_textarea" rows="5" maxlength="500" />
            <div class="aboutme_actions">
              <AppButton variant="primary" size="sm" :loading="savingClientDesc" @click="saveClientDesc()">Opslaan</AppButton>
              <AppButton variant="ghost" size="sm" @click="cancelClientDescEdit">Annuleren</AppButton>
            </div>
          </template>
        </section>
        <section v-if="auth.isClient" class="profile_card profile_sub" aria-labelledby="sub-heading">
          <h2 id="sub-heading" class="profile_sub-title">Mijn abonnement</h2>
          <template v-if="loadingSubs">
            <p class="profile_sub-empty">Laden...</p>
          </template>
          <template v-else-if="activeSubscription">
            <dl class="profile_dl">
              <dt>Status</dt>
              <dd>
                <AppBadge :variant="subStatusConfig[effectiveSubStatus(activeSubscription)]?.variant ?? 'default'">
                  {{ subStatusConfig[effectiveSubStatus(activeSubscription)]?.label ?? activeSubscription.status }}
                </AppBadge>
              </dd>
              <dt>Periode</dt>
              <dd>{{ formatDate(activeSubscription.start_date) }} t.e.m. {{ formatDate(activeSubscription.end_date) }}</dd>
              <dt>Bedrag</dt>
              <dd>€ {{ Number(activeSubscription.amount).toFixed(2).replace('.', ',') }}</dd>
              <dt>Betaald op</dt>
              <dd>{{ activeSubscription.paid_at ? formatDate(activeSubscription.paid_at) : 'Onbekend' }}</dd>
            </dl>
            <p v-if="activeSubscription.status === 'pending'" class="profile_sub-notice">Je abonnement is nog niet betaald. Neem contact op met je adviseur.</p>
          </template>
          <p v-else class="profile_sub-empty">Je hebt geen actief abonnement. Neem contact op met je adviseur om er een aan te vragen.</p>
        </section>

        <section v-if="auth.isVolunteer" class="profile_card profile_aboutme" aria-labelledby="aboutme-heading">
          <div class="aboutme_header">
            <h2 id="aboutme-heading" class="profile_sub-title">Over mij</h2>
            <AppButton v-if="!editingDesc" variant="ghost" size="sm" @click="editingDesc = true">Bewerken</AppButton>
          </div>

          <template v-if="!editingDesc">
            <p v-if="volunteerProfile?.personal_description" class="aboutme_text">
              {{ volunteerProfile.personal_description }}
            </p>
            <p v-else class="profile_sub-empty">Nog geen beschrijving.</p>
          </template>
          <template v-else>
            <textarea v-model="descriptionText" class="aboutme_textarea" rows="5" maxlength="500" />
            <div class="aboutme_actions">
              <AppButton variant="primary" size="sm" :loading="savingDesc" @click="saveDescription()">Opslaan</AppButton>
              <AppButton variant="ghost" size="sm" @click="cancelDescEdit">Annuleren</AppButton>
            </div>
          </template>
        </section>
      </div>
      <div v-if="auth.isVolunteer" class="profile_vol-row">
        <section class="profile_card profile_categories" aria-labelledby="cat-heading">
          <div class="aboutme_header">
            <h2 id="cat-heading" class="profile_sub-title">Mijn categoriën</h2>
            <AppButton v-if="!editingCategories" variant="ghost" size="sm" @click="startEditCategories">Bewerken</AppButton>
          </div>

          <template v-if="!editingCategories">
            <div v-if="volunteerProfile?.categories?.length" class="categories_badges">
              <AppBadge v-for="cat in volunteerProfile.categories" :key="cat.id" variant="info">
                <i v-if="cat.icon" :class="cat.icon" aria-hidden="true" />
                {{ cat.name }}
              </AppBadge>
            </div>
            <p v-else class="profile_sub-empty">Nog geen categorieën geselecteerd. Klik op "Bewerken" om toe te voegen.</p>
          </template>

          <template v-else>
            <div class="categories_grid">
              <button v-for="cat in allCategories" :key="cat.id" type="button" class="cat-toggle" :class="{ 'cat-toggle--active': selectedCategoryIds.includes(cat.id) }" @click="toggleCategory(cat.id)">
                <i v-if="cat.icon" :class="cat.icon" aria-hidden="true" />
                {{ cat.name }}
              </button>
            </div>
            <div class="aboutme_actions">
              <AppButton variant="primary" size="sm" :loading="savingCategories" @click="saveCategories()">Opslaan</AppButton>
              <AppButton variant="ghost" size="sm" :disabled="savingCategories" @click="cancelEditCategories">Annuleren</AppButton>
            </div>
          </template>
        </section>
        <section class="profile_card profile_reviews" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" class="profile_sub-title">Mijn ervaringen</h2>

          <p v-if="!myReviews?.length" class="profile_sub-empty">Nog geen ervaringen ontvangen.</p>

          <ul v-else class="review-list">
            <li v-for="review in myReviews" :key="review.id" class="review-item">
              <div class="review-item_meta">
                <span class="review-item_author">
                  {{ review.client?.user ? `${review.client.user.first_name} ${review.client.user.last_name}` : 'Anoniem' }}
                </span>
                <span v-if="review.appointment?.date" class="review-item_date">
                  {{ formatDate(review.appointment.date) }}
                </span>
              </div>
              <span v-if="review.appointment?.help_request?.category" class="review-item_category">
                <i v-if="review.appointment.help_request.category.icon" :class="review.appointment.help_request.category.icon" aria-hidden="true" />
                {{ review.appointment.help_request.category.name }}
              </span>
              <p class="review-item_content">{{ review.content }}</p>
            </li>
          </ul>
        </section>
      </div>

      <section v-if="auth.isVolunteer" class="profile_card profile_availability" aria-labelledby="availability-heading">
        <h2 id="availability-heading" class="profile_sub-title">Mijn beschikbaarheden</h2>

        <ul v-if="myAvailabilities.length" class="availability-list">
          <li v-for="availability in myAvailabilities" :key="availability.id" class="availability-item">
            <span class="availability-item_info">{{ formatDate(availability.date) }} | {{ timeLabels[availability.time_of_day] }}</span>
            <AppButton variant="danger" size="sm" @click="removeAvailability(availability.id)">Verwijder beschikbaarheid</AppButton>
          </li>
        </ul>
        <p v-else class="profile_sub-empty">Nog geen beschikbaarheden toegevoegd.</p>
        <form class="availability-form" aria-label="Beschikbaarheid toevoegen" @submit.prevent="handleAddAvailability">
          <h3 class="availability-form_title">Beschikbaarheid toevoegen</h3>
          <div class="availability-form_row">
            <div class="availability-form_group">
              <label for="availability-date" class="availability-form_label">Datum</label>
              <input id="availability-date" v-model="availabilityDate" type="date" class="availability-form_input" required />
            </div>
            <div class="availability-form_group">
              <label for="availability-time" class="availability-form_label">Dagdeel</label>
              <select id="availability-time" v-model="availabilityTimeOfDay" class="availability-form_input">
                <option value="morning">Ochtend</option>
                <option value="afternoon">Namiddag</option>
                <option value="evening">Avond</option>
              </select>
            </div>
          </div>
          <AppButton type="submit" size="sm" :loading="addingAvail || loadingVolunteer" :disabled="loadingVolunteer" style="align-self: flex-start">Toevoegen</AppButton>
        </form>
      </section>
    </div>
  </DefaultLayout>
</template>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.profile_top {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
}

@media (max-width: 64rem) {
  .profile_top {
    grid-template-columns: repeat(2, 1fr);
  }
}

@include breakpoint(md) {
  .profile_top {
    grid-template-columns: 1fr;
  }
}
.profile_title {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
}

.profile_card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  min-width: 0;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.profile_avatar-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-md);
}

.profile_photo-btn {
  background: none;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  cursor: pointer;
  font-weight: 600;
}

.profile_photo-btn:hover {
  background: var(--color-primary-light);
}

.profile_photo-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.profile_details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 0;
  flex: 1;
}

.profile_card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.profile_card-header {
  flex-shrink: 0;
}

.profile_dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem var(--spacing-md);
}
.profile_dl dt {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  white-space: nowrap;
}
.profile_dl dd {
  font-size: var(--font-size-sm);
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;
}
.value-unknown {
  font-style: italic;
  color: var(--color-text-muted);
}

.profile_form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.profile_actions {
  display: flex;
  gap: var(--spacing-sm);
}

.profile_sub {
  flex-direction: column;
  gap: var(--spacing-md);
}

.profile_sub-title {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
}

.profile_sub-notice {
  font-size: var(--font-size-sm);
  color: var(--color-warning, #b45309);
  margin: 0;
}

.profile_sub-empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.profile_error {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-danger);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.profile_aboutme {
  flex-direction: column;
  gap: var(--spacing-md);
}

.aboutme_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.aboutme_text {
  font-size: var(--font-size-sm);
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  margin: 0;
}

.aboutme_textarea {
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
}
.aboutme_textarea:focus-visible {
  outline: 3px solid var(--color-focus);
  border-color: var(--color-teal);
}

.aboutme_actions {
  display: flex;
  gap: var(--spacing-sm);
}

.profile_categories {
  flex-direction: column;
  gap: var(--spacing-md);
}

.categories_badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.categories_grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.cat-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.875rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-full);
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
}

.cat-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.cat-toggle--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.cat-toggle:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.profile_availability {
  flex-direction: column;
  gap: var(--spacing-lg);
}

.availability-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.availability-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.5rem var(--spacing-md);
  background: var(--color-teal-light, #d6e9e6);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

.availability-item_info {
  flex: 1;
  font-weight: 600;
}

.availability-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
.availability-form_title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.availability-form_row {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.availability-form_group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.availability-form_label {
  font-size: var(--font-size-xs);
  font-weight: 600;
}
.availability-form_input {
  padding: 0.55rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
  min-height: 2.75rem;
}
.availability-form_input:focus-visible {
  outline: 3px solid var(--color-focus);
}

.profile_vol-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

@include breakpoint(md) {
  .profile_vol-row {
    grid-template-columns: 1fr;
  }
}

.profile_reviews {
  flex-direction: column;
  gap: var(--spacing-md);
}

.review-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.review-item {
  background: var(--color-bg);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.review-item_meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.review-item_author {
  font-weight: 700;
  font-size: var(--font-size-sm);
}
.review-item_date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.review-item_category-icon {
  font-style: normal;
}

.review-item_category {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-full);
}

.review-item_content {
  font-size: var(--font-size-sm);
  line-height: 1.65;
  margin: 0;
}
</style>
