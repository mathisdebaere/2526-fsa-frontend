<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { formatDate, formatDateCompact } from '@/utils/date'
import type { Volunteer, Review, Availability } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import FormField from '@/components/molecules/FormField.vue'
import AvailabilityPicker from '@/components/molecules/AvailabilityPicker.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const cache = useQueryCache()
const { showConfirmationDialog } = useConfirmDialog()
const id = Number(route.params.id)

const { data: volunteer, isLoading } = useQuery({
  key: ['volunteers', id],
  query: () => api.get<Volunteer>(`/volunteers/${id}?include=user,availabilities`),
})

const { data: reviews, isLoading: reviewsLoading } = useQuery({
  key: ['volunteers', id, 'reviews'],
  query: () => api.get<Review[]>(`/volunteers/${id}/reviews?include=client.user,appointment.helpRequest.category`),
})

const isOwn = computed(() => auth.user?.id === volunteer.value?.user_id)

let _volunteerSnap: Volunteer | undefined

const { mutate: addAvailability } = useMutation({
  onMutate(payload: { date: string; time_of_day: 'morning' | 'afternoon' | 'evening' }) {
    _volunteerSnap = cache.getQueryData<Volunteer>(['volunteers', id])
    if (_volunteerSnap) {
      const tempAvail: Availability = { id: -Date.now(), date: payload.date, time_of_day: payload.time_of_day, volunteer_id: id }
      cache.setQueryData<Volunteer>(['volunteers', id], {
        ..._volunteerSnap,
        availabilities: [...(_volunteerSnap.availabilities ?? []), tempAvail],
      })
    }
  },
  mutation: (payload: { date: string; time_of_day: 'morning' | 'afternoon' | 'evening' }) => api.post<Availability>(`/volunteers/${id}/availabilities`, payload),
  onSuccess(newAvail: Availability) {
    const current = cache.getQueryData<Volunteer>(['volunteers', id])
    if (current) {
      cache.setQueryData<Volunteer>(['volunteers', id], {
        ...current,
        availabilities: (current.availabilities ?? []).map((a) => (a.id < 0 ? newAvail : a)),
      })
    }
    toast.success('Beschikbaarheid toegevoegd.')
  },
  onError: () => {
    if (_volunteerSnap) cache.setQueryData<Volunteer>(['volunteers', id], _volunteerSnap)
    toast.error('Toevoegen mislukt.')
  },
})

const { mutate: removeAvailability } = useMutation({
  onMutate(availId: number) {
    _volunteerSnap = cache.getQueryData<Volunteer>(['volunteers', id])
    if (_volunteerSnap) {
      cache.setQueryData<Volunteer>(['volunteers', id], {
        ..._volunteerSnap,
        availabilities: (_volunteerSnap.availabilities ?? []).filter((a) => a.id !== availId),
      })
    }
  },
  mutation: (availId: number) => api.delete(`/volunteers/${id}/availabilities/${availId}`),
  onSuccess: () => {
    toast.success('Beschikbaarheid verwijderd.')
  },
  onError: () => {
    if (_volunteerSnap) cache.setQueryData<Volunteer>(['volunteers', id], _volunteerSnap)
    toast.error('Verwijderen mislukt.')
  },
})

const editingDesc = ref(false)
const descriptionText = ref('')

watch(
  () => volunteer.value?.personal_description,
  (val) => {
    descriptionText.value = val ?? ''
  },
  { immediate: true },
)

function cancelDescriptionEdit() {
  editingDesc.value = false
  descriptionText.value = volunteer.value?.personal_description ?? ''
}

const { mutate: saveDescription, isLoading: savingDescription } = useMutation({
  onMutate() {
    _volunteerSnap = cache.getQueryData<Volunteer>(['volunteers', id])
    if (_volunteerSnap) cache.setQueryData<Volunteer>(['volunteers', id], { ..._volunteerSnap, personal_description: descriptionText.value })
  },
  mutation: () => api.put(`/volunteers/${id}`, { personal_description: descriptionText.value }),
  onSuccess: () => {
    toast.success('Beschrijving opgeslagen.')
    editingDesc.value = false
  },
  onError: () => {
    if (_volunteerSnap) cache.setQueryData<Volunteer>(['volunteers', id], _volunteerSnap)
    toast.error('Opslaan mislukt.')
  },
})

const editingNotes = ref(false)
const backgroundNotes = ref('')

watch(
  () => volunteer.value?.background_notes,
  (val) => {
    backgroundNotes.value = val ?? ''
  },
  { immediate: true },
)

function cancelNotesEdit() {
  editingNotes.value = false
  backgroundNotes.value = volunteer.value?.background_notes ?? ''
}

const { mutate: saveNotes, isLoading: savingNotes } = useMutation({
  onMutate() {
    _volunteerSnap = cache.getQueryData<Volunteer>(['volunteers', id])
    if (_volunteerSnap) cache.setQueryData<Volunteer>(['volunteers', id], { ..._volunteerSnap, background_notes: backgroundNotes.value })
  },
  mutation: () => api.put(`/volunteers/${id}`, { background_notes: backgroundNotes.value }),
  onSuccess: () => {
    toast.success('Notities opgeslagen.')
    editingNotes.value = false
  },
  onError: () => {
    if (_volunteerSnap) cache.setQueryData<Volunteer>(['volunteers', id], _volunteerSnap)
    toast.error('Opslaan mislukt.')
  },
})

const editingProfile = ref(false)
const profileFirstName = ref('')
const profileLastName = ref('')
const profileEmail = ref('')
const profilePhone = ref('')
const profileDob = ref('')

watch(
  () => volunteer.value?.user,
  (user) => {
    if (!user) return
    profileFirstName.value = user.first_name ?? ''
    profileLastName.value = user.last_name ?? ''
    profileEmail.value = user.email ?? ''
    profilePhone.value = user.phone ?? ''
    profileDob.value = user.date_of_birth ?? ''
  },
  { immediate: true },
)

const { mutate: saveProfile, isLoading: savingProfile } = useMutation({
  onMutate() {
    _volunteerSnap = cache.getQueryData<Volunteer>(['volunteers', id])
    if (_volunteerSnap?.user) {
      cache.setQueryData<Volunteer>(['volunteers', id], {
        ..._volunteerSnap,
        user: {
          ..._volunteerSnap.user,
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
    return api.put(`/users/${volunteer.value!.user_id}`, payload)
  },
  onSuccess: () => {
    toast.success('Profiel bijgewerkt.')
    editingProfile.value = false
  },
  onError: () => {
    if (_volunteerSnap) cache.setQueryData<Volunteer>(['volunteers', id], _volunteerSnap)
    toast.error('Bijwerken mislukt.')
  },
})

const { mutate: deleteUser, isLoading: deleting } = useMutation({
  mutation: () => api.delete(`/users/${volunteer.value!.user_id}`),
  onSuccess: () => {
    toast.success('Gebruiker verwijderd.')
    router.push('/volunteers')
  },
  onError: () => toast.error('Verwijderen mislukt.'),
})

async function confirmDelete() {
  const ok = await showConfirmationDialog(`Weet je zeker dat je ${volunteer.value?.user?.first_name} ${volunteer.value?.user?.last_name} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)
  if (ok) deleteUser()
}
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <button class="back-btn" @click="router.push(route.query.from ? String(route.query.from) : auth?.isClient ? '/client/volunteers' : '/volunteers')"><i class="fa-solid fa-angle-left"></i> Terug</button>
      <AppSpinner v-if="isLoading" label="Vrijwilliger wordt ingeladen..." />

      <template v-else-if="volunteer">
        <header class="detail-header card">
          <AppAvatar :src="volunteer.user?.profile_photo_url" :name="volunteer.user ? `${volunteer.user.first_name} ${volunteer.user.last_name}` : ''" size="lg" />
          <div class="detail-header_info">
            <h1>{{ volunteer.user?.first_name }} {{ volunteer.user?.last_name }}</h1>
            <p class="detail-sub">{{ volunteer.user?.email ?? volunteer.user?.phone ?? 'Onbekend' }}</p>
            <p v-if="volunteer.user?.phone && volunteer.user?.email" class="detail-sub">{{ volunteer.user.phone }}</p>
          </div>
        </header>

        <div class="detail-grid">
          <section class="card desc-card">
            <div class="card-header">
              <h2 class="section-title">Over de vrijwilliger</h2>
              <button v-if="(isOwn || auth.isAdvisor) && !editingDesc" class="edit-btn" @click="editingDesc = true"><i class="fa-solid fa-pen"></i> Bewerken</button>
            </div>
            <template v-if="editingDesc">
              <textarea v-model="descriptionText" class="field-textarea" rows="5" aria-label="Beschrijving"></textarea>
              <div class="action-row">
                <AppButton size="sm" :loading="savingDescription" @click="saveDescription()">Opslaan</AppButton>
                <AppButton variant="ghost" size="sm" @click="cancelDescriptionEdit">Annuleren</AppButton>
              </div>
            </template>
            <p v-else-if="volunteer.personal_description" class="detail-text">{{ volunteer.personal_description }}</p>
            <p v-else class="detail-empty">Geen beschrijving opgegeven.</p>
          </section>

          <section class="card profile-card">
            <div class="card-header">
              <h2 class="section-title">Profielinfo</h2>
              <button v-if="auth.isAdvisor && !editingProfile" class="edit-btn" @click="editingProfile = true"><i class="fa-solid fa-pen"></i> Bewerken</button>
            </div>
            <template v-if="editingProfile">
              <div class="form-stack">
                <FormField v-model="profileFirstName" label="Voornaam" />
                <FormField v-model="profileLastName" label="Achternaam" />
                <FormField v-model="profileEmail" label="E-mailadres" type="email" />
                <FormField v-model="profilePhone" label="Telefoonnummer" type="tel" />
                <FormField v-model="profileDob" label="Geboortedatum" type="date" />
              </div>
              <div class="action-row">
                <AppButton size="sm" :loading="savingProfile" @click="saveProfile()">Opslaan</AppButton>
                <AppButton variant="ghost" size="sm" @click="editingProfile = false">Annuleren</AppButton>
              </div>
            </template>
            <dl v-else class="info-dl">
              <dt>Naam</dt>
              <dd>{{ volunteer.user?.first_name }} {{ volunteer.user?.last_name }}</dd>
              <template v-if="auth.isAdvisor">
                <dt>E-mailadres</dt>
                <dd :class="{ 'detail-empty': !volunteer.user?.email }">{{ volunteer.user?.email ?? 'Onbekend' }}</dd>
                <dt>Telefoonnummer</dt>
                <dd :class="{ 'detail-empty': !volunteer.user?.phone }">{{ volunteer.user?.phone ?? 'Onbekend' }}</dd>
                <dt>Geboortedatum</dt>
                <dd :class="{ 'detail-empty': !volunteer.user?.date_of_birth }">{{ volunteer.user?.date_of_birth ? formatDateCompact(volunteer.user.date_of_birth) : 'Onbekend' }}</dd>
              </template>
            </dl>
          </section>

          <section v-if="auth.isAdvisor" class="card notes-card">
            <div class="card-header">
              <h2 class="section-title">Interne notities</h2>
              <button v-if="!editingNotes" class="edit-btn" @click="editingNotes = true"><i class="fa-solid fa-pen"></i> Bewerken</button>
            </div>
            <template v-if="editingNotes">
              <textarea v-model="backgroundNotes" class="field-textarea" rows="5" aria-label="Interne notities"></textarea>
              <div class="action-row">
                <AppButton size="sm" :loading="savingNotes" @click="saveNotes()">Opslaan</AppButton>
                <AppButton variant="ghost" size="sm" @click="cancelNotesEdit">Annuleren</AppButton>
              </div>
            </template>
            <p v-else-if="volunteer.background_notes" class="detail-text">{{ volunteer.background_notes }}</p>
            <p v-else class="detail-empty">Geen notities.</p>
          </section>
          <section class="card availability-card">
            <h2 class="section-title">Beschikbaarheden</h2>
            <AvailabilityPicker :availabilities="volunteer.availabilities ?? []" :editable="isOwn || auth.isAdvisor" @add="(p) => addAvailability(p)" @remove="(availId) => removeAvailability(availId)" />
          </section>
          <section class="card reviews-card">
            <h2 class="section-title">Ervaringen</h2>
            <p v-if="reviewsLoading" class="detail-empty">Laden...</p>
            <p v-else-if="!reviews?.length" class="detail-empty">Nog geen reviews.</p>
            <ul v-else class="review-list">
              <li v-for="review in reviews" :key="review.id" class="review-item">
                <div class="review-item_meta">
                  <span class="review-item_author">{{ review.client?.user?.first_name }} {{ review.client?.user?.last_name }}</span>
                  <span v-if="review.appointment?.help_request?.category" class="review-item_category"><i class="review-item_category-icon fa-solid fa-tag"></i> {{ review.appointment.help_request.category.name }}</span>
                  <span class="review-item_date">{{ formatDate(review.created_at) }}</span>
                </div>
                <p class="review-item_content">{{ review.content }}</p>
              </li>
            </ul>
          </section>
          <section v-if="auth.isAdvisor" class="card danger-card">
            <h2 class="section-title section-title-danger">Gebruiker verwijderen</h2>
            <AppButton variant="danger" size="sm" :loading="deleting" @click="confirmDelete()"><i class="fa-solid fa-trash"></i> Gebruiker verwijderen</AppButton>
          </section>
        </div>
      </template>

      <p v-else-if="!isLoading" class="page-empty">Vrijwilliger niet gevonden.</p>
    </div>
  </DefaultLayout>
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
.section-title-danger {
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
.availability-card {
  background: var(--card-bg-sage);
}
.reviews-card {
  background: var(--card-bg-yellow);
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
.review-item_content {
  font-size: var(--font-size-sm);
  line-height: 1.65;
  margin: 0;
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
.review-item_category-icon {
  font-style: normal;
}
</style>
