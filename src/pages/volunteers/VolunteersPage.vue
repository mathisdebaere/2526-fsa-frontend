<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@pinia/colada'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { usePageState, usePaginatedData, PER_PAGE } from '@/composables/usePaginatedData'
import type { Volunteer, PaginatedResponse, HelpRequestCategory, Review } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'

type VolunteerWithReviews = Volunteer & { reviews?: Review[] }

const api = useApi()
const router = useRouter()
const { currentPage, goToPage, resetPage } = usePageState()

const categoryFilter = ref<number | ''>('')

const { data: categories } = useQuery({
  key: ['help-request-categories'],
  query: () => api.get<HelpRequestCategory[]>('/help-request-categories'),
})

const { data: pageData } = useQuery({
  key: () => ['volunteers', currentPage.value, categoryFilter.value],
  query: () => {
    const include = categoryFilter.value ? 'user,reviews.appointment.helpRequest.category' : 'user'
    const params = new URLSearchParams({ include, per_page: String(PER_PAGE), page: String(currentPage.value) })
    return api.get<PaginatedResponse<VolunteerWithReviews>>(`/volunteers?${params}`)
  },
})

const { items: volunteersRaw, total, lastPage } = usePaginatedData<VolunteerWithReviews>(pageData)

const volunteers = computed(() => {
  if (!categoryFilter.value || !volunteersRaw.value) return volunteersRaw.value
  return volunteersRaw.value.filter((volunteer) => volunteer.reviews?.some((review) => review.appointment?.help_request?.category?.id === categoryFilter.value))
})

function onCategoryChange() {
  resetPage()
}
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Vrijwilligers</h1>
      </header>

      <div class="filter-bar">
        <label for="category-filter" class="filter-bar_label">Categorie</label>
        <select id="category-filter" v-model="categoryFilter" class="filter-bar_select" @change="onCategoryChange">
          <option value="">Alle categorieën</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </div>

      <p v-if="!volunteers?.length" class="page-empty">
        {{ categoryFilter ? 'Geen vrijwilligers met ervaringen in deze categorie.' : 'Geen vrijwilligers gevonden.' }}
      </p>

      <div v-else class="card-grid">
        <article v-for="volunteer in volunteers" :key="volunteer.id" class="card volunteer-card" @click="router.push(`/volunteers/${volunteer.id}`)">
          <AppAvatar :src="volunteer.user?.profile_photo_url" :name="`${volunteer.user?.first_name} ${volunteer.user?.last_name}`" size="md" />

          <div class="volunteer-card_info">
            <p class="volunteer-card_name">{{ volunteer.user?.first_name }} {{ volunteer.user?.last_name }}</p>
            <p class="volunteer-card_sub">{{ volunteer.user?.email ?? '-' }}</p>
            <p v-if="volunteer.personal_description" class="volunteer-card_desc">{{ volunteer.personal_description }}</p>
            <p v-else class="volunteer-card_desc volunteer-card_desc-empty">Geen beschrijving beschikbaar.</p>
          </div>

          <div class="volunteer-card_footer">
            <RouterLink :to="`/volunteers/${volunteer.id}`" class="link-btn" @click.stop>Bekijken <i class="fa-solid fa-angle-right"></i></RouterLink>
          </div>
        </article>
      </div>

      <AppPagination v-if="lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
    </div>
  </DefaultLayout>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}
.filter-bar_label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
}
.filter-bar_select {
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: var(--font-size-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
  min-width: 14rem;
}
.filter-bar_select:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
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
