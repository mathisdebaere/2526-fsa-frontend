<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { HelpRequest } from '@/types/api'
import HelpRequestCard from '@/components/molecules/HelpRequestCard.vue'

defineProps<{
  requests: HelpRequest[]
  loading?: boolean
  acceptingId?: number | null
}>()

const emit = defineEmits<{
  accept: [id: number]
}>()

const router = useRouter()
const auth = useAuthStore()

function isOwn(req: HelpRequest) {
  return req.client?.user_id === auth.user?.id
}
</script>

<template>
  <section aria-label="Hulpvragen lijst">
    <p v-if="!requests.length" class="page-empty">Geen hulpvragen gevonden.</p>
    <ul v-else role="list" class="card-grid">
      <li v-for="req in requests" :key="req.id" style="list-style: none">
        <HelpRequestCard :request="req" :is-own="isOwn(req)" :accepting="acceptingId === req.id" @view="router.push(`/help-requests/${$event}`)" @accept="emit('accept', $event)" />
      </li>
    </ul>
  </section>
</template>
