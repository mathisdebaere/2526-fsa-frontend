<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery } from '@pinia/colada'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { usePageState, usePaginatedData, PER_PAGE } from '@/composables/usePaginatedData'
import type { Volunteer, PaginatedResponse, HelpRequestCategory, Review } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'

type VolunteerWithReviews = Volunteer & { reviews?: Review[] }

const api = useApi()
const router = useRouter()
const { currentPage, goToPage, resetPage } = usePageState()

const categoryFilter = ref<number | ''>('')
const volunteerSearch = ref('')

const { data: categories } = useQuery({
  key: ['help-request-categories'],
  query: () => api.get<HelpRequestCategory[]>('/help-request-categories'),
})

const { data: allData, isLoading } = useQuery({
  key: ['volunteers', 'all'],
  query: () => api.get<PaginatedResponse<VolunteerWithReviews>>('/volunteers?include=user,reviews.appointment.helpRequest.category&per_page=999'),
})

const { items: allVolunteers } = usePaginatedData<VolunteerWithReviews>(allData)

const filtered = computed(() => {
  let list = allVolunteers.value ?? []
  if (categoryFilter.value) {
    list = list.filter((v) => v.reviews?.some((r) => r.appointment?.help_request?.category?.id === categoryFilter.value))
  }
  if (volunteerSearch.value.trim()) {
    const q = volunteerSearch.value.toLowerCase()
    list = list.filter((v) => `${v.user?.first_name ?? ''} ${v.user?.last_name ?? ''}`.toLowerCase().includes(q))
  }
  return list
})

const total = computed(() => filtered.value.length)
const lastPage = computed(() => Math.max(1, Math.ceil(total.value / PER_PAGE)))
const volunteers = computed(() => filtered.value.slice((currentPage.value - 1) * PER_PAGE, currentPage.value * PER_PAGE))

watch([categoryFilter, volunteerSearch], () => resetPage())
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Vrijwilligers</h1>
      </header>

      <div class="filter-bar">
        <label for="volunteer-search" class="sr-only">Zoek op naam</label>
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true" />
          <input id="volunteer-search" v-model="volunteerSearch" type="search" class="field-input search-input" placeholder="Zoek op naam" />
        </div>
        <label for="category-filter" class="sr-only">Categorie</label>
        <select id="category-filter" v-model="categoryFilter" class="field-input">
          <option value="">Alle categorieën</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </div>
      <AppSpinner v-if="isLoading" label="Vrijwilligers worden ingeladen..." />

      <p v-else-if="!volunteers?.length" class="page-empty">
        {{ categoryFilter ? 'Geen vrijwilligers met interesse in deze categorie.' : 'Geen vrijwilligers gevonden.' }}
      </p>

      <div v-else class="card-grid">
        <article v-for="volunteer in volunteers" :key="volunteer.id" class="card volunteer-card" @click="router.push(`/volunteers/${volunteer.id}`)">
          <AppAvatar :src="volunteer.user?.profile_photo_url" :name="`${volunteer.user?.first_name} ${volunteer.user?.last_name}`" size="md" />

          <div class="volunteer-card_info">
            <p class="volunteer-card_name">{{ volunteer.user?.first_name }} {{ volunteer.user?.last_name }}</p>
            <p v-if="volunteer.user?.email" class="volunteer-card_sub">{{ volunteer.user.email }}</p>
            <p v-else class="volunteer-card_sub volunteer-card_sub--empty">Onbekend</p>
            <p v-if="volunteer.personal_description" class="volunteer-card_desc">{{ volunteer.personal_description }}</p>
            <p v-else class="volunteer-card_desc volunteer-card_desc-empty">Geen beschrijving beschikbaar.</p>
          </div>

          <div class="volunteer-card_footer">
            <RouterLink :to="`/volunteers/${volunteer.id}`" class="link-btn" @click.stop>Bekijken <i class="fa-solid fa-angle-right"></i></RouterLink>
          </div>
        </article>
      </div>

      <AppPagination v-if="!isLoading && volunteers?.length && lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
    </div>
  </DefaultLayout>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: flex-end;
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
  min-height: 2.75rem;
  box-sizing: border-box;
}
.field-input:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 14rem;
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
  width: 100%;
}

.volunteer-card {
  background: var(--card-bg-teal);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.volunteer-card:hover {
  box-shadow: var(--shadow-md);
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
.volunteer-card_sub {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}
.volunteer-card_sub--empty {
  font-style: italic;
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
.volunteer-card_footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: var(--spacing-sm);
}
</style>
