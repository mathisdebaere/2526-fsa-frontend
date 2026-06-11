<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useSubscriptionGuard } from '@/composables/useSubscriptionGuard'
import { usePageState, usePaginatedData, PER_PAGE } from '@/composables/usePaginatedData'
import type { Volunteer, HelpRequestCategory, PaginatedResponse } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import NoSubscriptionBanner from '@/components/atoms/NoSubscriptionBanner.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()
const toast = useToast()
const { noSubscription, isExpired, isLoading: subChecking } = useSubscriptionGuard()
const { currentPage, goToPage, resetPage } = usePageState()

const availableOn = ref((route.query.available_on as string) ?? '')
const timeOfDay = ref((route.query.time_of_day as string) ?? '')
const categoryId = ref((route.query.category_id as string) ?? '')
const savedOnly = ref(route.query.saved === 'true')

watch(
  [availableOn, timeOfDay, categoryId, savedOnly],
  () => {
    resetPage()
    const q: Record<string, string> = {}
    if (availableOn.value) q.available_on = availableOn.value
    if (timeOfDay.value) q.time_of_day = timeOfDay.value
    if (categoryId.value) q.category_id = categoryId.value
    if (savedOnly.value) q.saved = 'true'
    router.replace({ query: q })
  },
  { flush: 'post' },
)

const queryKey = computed(() => ['client-volunteers', availableOn.value, timeOfDay.value, categoryId.value, savedOnly.value, currentPage.value])

const { data: pageData, isLoading } = useQuery({
  key: queryKey,
  query: () => {
    const params = new URLSearchParams({ include: 'user,availabilities,categories', per_page: String(PER_PAGE), page: String(currentPage.value) })
    if (availableOn.value) params.set('available_on', availableOn.value)
    if (timeOfDay.value) params.set('time_of_day', timeOfDay.value)
    if (categoryId.value) params.set('category_id', categoryId.value)
    if (savedOnly.value) params.set('saved', 'true')
    return api.get<PaginatedResponse<Volunteer>>(`/volunteers?${params}`)
  },
})

const { items: volunteers, total, lastPage } = usePaginatedData<Volunteer>(pageData)

const { data: categories } = useQuery({
  key: ['help-request-categories'],
  query: () => api.get<HelpRequestCategory[]>('/help-request-categories'),
})

const favoriteOverrides = ref<Map<number, boolean>>(new Map())
const savedTogglePulse = ref(false)

function isFavorited(volunteer: Volunteer): boolean {
  return favoriteOverrides.value.has(volunteer.id) ? favoriteOverrides.value.get(volunteer.id)! : (volunteer.is_favorited ?? false)
}

const { mutate: toggleFavorite } = useMutation({
  mutation: async ({ id, currently }: { id: number; currently: boolean }) => {
    if (currently) {
      await api.delete(`/volunteers/${id}/favorite`)
    } else {
      await api.post(`/volunteers/${id}/favorite`)
    }
  },
  onMutate({ id, currently }) {
    favoriteOverrides.value.set(id, !currently)
    toast.success(currently ? 'Verwijderd uit favorieten.' : 'Opgeslagen als favoriet.')
    if (!currently) {
      savedTogglePulse.value = true
      setTimeout(() => {
        savedTogglePulse.value = false
      }, 600)
    }
  },
  onError(_, { id, currently }) {
    favoriteOverrides.value.set(id, currently)
    toast.error('Favoriet bijwerken mislukt.')
  },
})

const daypartLabels: Record<string, string> = {
  morning: 'Ochtend',
  afternoon: 'Namiddag',
  evening: 'Avond',
}

const daypartOptions = [
  { value: '', label: 'Alle dagdelen' },
  { value: 'morning', label: 'Ochtend' },
  { value: 'afternoon', label: 'Namiddag' },
  { value: 'evening', label: 'Avond' },
]
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Vrijwilligers</h1>
      </header>

      <AppSpinner v-if="subChecking" label="Laden..." />
      <NoSubscriptionBanner v-else-if="noSubscription" :expired="isExpired" />

      <template v-else>
        <div class="filters">
          <div class="filter-group">
            <label for="available-on" class="filter-label">Beschikbaar op</label>
            <input id="available-on" v-model="availableOn" type="date" class="field-input" />
          </div>

          <div class="filter-group">
            <label for="time-of-day" class="filter-label">Dagdeel</label>
            <select id="time-of-day" v-model="timeOfDay" class="field-input" :disabled="!availableOn">
              <option v-for="daypartOption in daypartOptions" :key="daypartOption.value" :value="daypartOption.value">{{ daypartOption.label }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="category-filter" class="filter-label">Categorie</label>
            <select id="category-filter" v-model="categoryId" class="field-input">
              <option value="">Alle categorieën</option>
              <option v-for="category in categories" :key="category.id" :value="String(category.id)">{{ category.name }}</option>
            </select>
          </div>

          <button class="saved-toggle" :class="{ 'saved-toggle-active': savedOnly, 'saved-toggle--pulse': savedTogglePulse }" :aria-pressed="savedOnly" @click="savedOnly = !savedOnly">
            <i :class="savedOnly ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" aria-hidden="true"></i>
            Toon favorieten
          </button>
        </div>
        <AppSpinner v-if="isLoading" label="Vrijwilligers worden ingeladen..." />

        <p v-else-if="!volunteers?.length" class="page-empty">Geen vrijwilligers gevonden.</p>

        <div v-else class="card-grid">
          <article v-for="volunteer in volunteers" :key="volunteer.id" class="card volunteer-card" @click="$router.push(`/client/volunteers/${volunteer.id}`)">
            <button :class="['volunteer-card_fav', { 'volunteer-card_fav--active': isFavorited(volunteer) }]" :aria-label="isFavorited(volunteer) ? 'Verwijder uit favorieten' : 'Sla op als favoriet'" @click.stop="toggleFavorite({ id: volunteer.id, currently: isFavorited(volunteer) })">
              <i :class="isFavorited(volunteer) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" aria-hidden="true"></i>
            </button>

            <AppAvatar :src="volunteer.user?.profile_photo_url" :name="`${volunteer.user?.first_name} ${volunteer.user?.last_name}`" size="md" />

            <div class="volunteer-card_info">
              <p class="volunteer-card_name">{{ volunteer.user?.first_name }} {{ volunteer.user?.last_name }}</p>
              <p v-if="volunteer.personal_description" class="volunteer-card_desc">{{ volunteer.personal_description }}</p>
              <p v-else class="volunteer-card_desc volunteer-card_desc-empty">Geen beschrijving beschikbaar.</p>
            </div>

            <div v-if="volunteer.categories?.length" class="volunteer-card_cats">
              <AppBadge v-for="category in volunteer.categories" :key="category.id" variant="info">
                <i v-if="category.icon" :class="category.icon" aria-hidden="true" />
                {{ category.name }}
              </AppBadge>
            </div>

            <div v-if="availableOn && volunteer.availabilities?.length" class="volunteer-card_avail">
              <AppBadge v-for="availability in volunteer.availabilities.filter((av) => av.date.startsWith(availableOn))" :key="availability.id" variant="info">
                {{ daypartLabels[availability.time_of_day] ?? availability.time_of_day }}
              </AppBadge>
            </div>

            <div class="volunteer-card_footer">
              <RouterLink :to="`/client/volunteers/${volunteer.id}`" class="link-btn" @click.stop>Bekijken <i class="fa-solid fa-angle-right"></i></RouterLink>
            </div>
          </article>
        </div>

        <AppPagination v-if="!isLoading && volunteers?.length && lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
      </template>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  min-width: 10rem;
}
.field-input:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}
.field-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.saved-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-bg-card);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  min-height: 2.75rem;
  align-self: flex-end;
}
.saved-toggle-active {
  border-color: #ff0000;
  color: #ff0000;
  background: #fdf0f6;
}
.saved-toggle:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.saved-toggle--pulse {
  animation: fav-pulse 0.6s ease;
}

@keyframes fav-pulse {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.15); }
  50%  { transform: scale(0.95); }
  75%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.volunteer-card {
  background: var(--card-bg-teal);
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
}
.volunteer-card:hover {
  box-shadow: var(--shadow-md);
}

.volunteer-card_fav {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--color-text-muted);
  border-radius: 50%;
  line-height: 1;
  z-index: 1;
  scale: 150%;
}
.volunteer-card_fav--active {
  color: #ff0000;
}
.volunteer-card_fav:hover {
  color: #ff000077;
}
.volunteer-card_fav:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 50%;
}

.volunteer-card_info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}
.volunteer-card_name {
  font-weight: 700;
  font-size: var(--font-size-lg);
  margin: 0;
}
.volunteer-card_desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.volunteer-card_desc-empty {
  font-style: italic;
}
.volunteer-card_cats {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}
.volunteer-card_avail {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}
.volunteer-card_footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: var(--spacing-sm);
}
</style>
