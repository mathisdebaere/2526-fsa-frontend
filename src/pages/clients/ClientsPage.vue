<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { usePageState } from '@/composables/usePaginatedData'
import type { Client, PaginatedResponse } from '@/types/api'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppPagination from '@/components/atoms/AppPagination.vue'

const PER_PAGE = 18

const api = useApi()
const router = useRouter()
const { currentPage, goToPage } = usePageState()

const allClients = ref<Client[]>([])
const isLoading = ref(true)

async function fetchAll() {
  isLoading.value = true
  try {
    const first = await api.get<PaginatedResponse<Client>>(`/clients?include=user,subscriptions&per_page=100&page=1`)
    const rows: Client[] = Array.isArray(first) ? first : (first.data ?? [])
    const pages = Array.isArray(first) ? 1 : (first.last_page ?? 1)

    if (pages > 1) {
      const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => api.get<PaginatedResponse<Client>>(`/clients?include=user,subscriptions&per_page=100&page=${i + 2}`)))
      for (const page of rest) {
        rows.push(...(Array.isArray(page) ? page : (page.data ?? [])))
      }
    }

    allClients.value = rows
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAll)

const today = new Date().toISOString().slice(0, 10)

function isActive(client: Client): boolean {
  const subs = client.subscriptions ?? []
  return subs.some((s) => s.status === 'active' && s.end_date.slice(0, 10) >= today)
}

const sorted = computed(() => [...allClients.value].sort((a, b) => Number(isActive(b)) - Number(isActive(a))))

const total = computed(() => sorted.value.length)
const lastPage = computed(() => Math.max(1, Math.ceil(total.value / PER_PAGE)))
const clients = computed(() => sorted.value.slice((currentPage.value - 1) * PER_PAGE, currentPage.value * PER_PAGE))
</script>

<template>
  <DefaultLayout>
    <div class="page-wrap">
      <header class="page-header">
        <h1>Dienstvragers</h1>
      </header>

      <p v-if="!clients.length" class="page-empty">Geen dienstvragers gevonden.</p>

      <div v-if="clients.length" class="card-grid">
        <article v-for="client in clients" :key="client.id" class="card volunteer-card" @click="router.push(`/clients/${client.id}`)">
          <div class="volunteer-card_top">
            <AppAvatar :src="client.user?.profile_photo_url" :name="`${client.user?.first_name} ${client.user?.last_name}`" size="md" />
            <AppBadge :variant="isActive(client) ? 'success' : 'danger'">
              {{ isActive(client) ? 'Actief lid' : 'Niet actief' }}
            </AppBadge>
          </div>

          <div class="volunteer-card_info">
            <p class="volunteer-card_name">{{ client.user?.first_name }} {{ client.user?.last_name }}</p>
            <p class="volunteer-card_sub">{{ client.user?.email ?? '-' }}</p>
            <p v-if="client.personal_description" class="volunteer-card_desc">{{ client.personal_description }}</p>
            <p v-else class="volunteer-card_desc volunteer-card_desc-empty">Geen beschrijving beschikbaar.</p>
          </div>

          <div class="volunteer-card_footer">
            <RouterLink :to="`/clients/${client.id}`" class="link-btn" @click.stop>Bekijken <i class="fa-solid fa-angle-right"></i></RouterLink>
          </div>
        </article>
      </div>

      <AppPagination v-if="lastPage > 1" :current-page="currentPage" :last-page="lastPage" :total="total" :per-page="PER_PAGE" @page-change="goToPage" />
    </div>
  </DefaultLayout>
</template>

<style scoped>
.volunteer-card {
  background: var(--card-bg-primary);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.volunteer-card:hover {
  box-shadow: var(--shadow-md);
}

.volunteer-card_top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
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
