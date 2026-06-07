<script setup lang="ts">
import { computed } from 'vue'
import type { HelpRequest } from '@/types/api'
import { useAuthStore } from '@/stores/auth'
import AppBadge from '@/components/atoms/AppBadge.vue'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  request: HelpRequest
  isOwn?: boolean
  accepting?: boolean
}>()

const emit = defineEmits<{
  view: [id: number]
  accept: [id: number]
}>()

const auth = useAuthStore()

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; accent: string }> = {
  open: { label: 'Open', variant: 'info', accent: 'var(--color-primary)' },
  matched: { label: 'Gematcht', variant: 'warning', accent: 'var(--color-yellow)' },
  completed: { label: 'Voltooid', variant: 'success', accent: 'var(--color-sage)' },
  cancelled: { label: 'Geannuleerd', variant: 'danger', accent: 'var(--color-rose)' },
}

const badgeStatus = computed(() => statusConfig[props.request.status] ?? { label: props.request.status, variant: 'default' as const, accent: 'var(--color-border)' })

const volunteerName = computed(() => {
  const u = props.request.volunteer?.user
  return u ? `${u.first_name} ${u.last_name}` : null
})
</script>

<template>
  <article class="help-card card" :class="`help-card-${request.status}`">
    <div v-if="accepting" class="help-card_overlay" aria-hidden="true"></div>

    <div class="help-card_header">
      <span class="help-card_category">
        {{ request.category?.name ?? `Categorie #${request.help_request_category_id}` }}
      </span>
      <div class="help-card_badges">
        <AppBadge :variant="badgeStatus.variant">{{ badgeStatus.label }}</AppBadge>
      </div>
    </div>

    <dl class="help-card_meta">
      <div v-if="request.region" class="help-card_meta-row">
        <dt>Regio</dt>
        <dd>{{ request.region }}</dd>
      </div>
      <div v-if="request.date" class="help-card_meta-row">
        <dt>Datum</dt>
        <dd style="text-transform: capitalize">{{ formatDate(request.date) }}</dd>
      </div>
      <div v-if="request.time" class="help-card_meta-row">
        <dt>Tijdstip</dt>
        <dd>{{ request.time?.slice(0, 5) }}</dd>
      </div>
      <div class="help-card_meta-row">
        <dt>Vrijwilliger</dt>
        <dd :class="{ 'help-card_volunteer-none': !volunteerName }">
          {{ volunteerName ?? 'Nog geen vrijwilliger' }}
        </dd>
      </div>
    </dl>

    <p v-if="request.extra_notes" class="help-card_notes">"{{ request.extra_notes }}"</p>

    <footer class="help-card_footer">
      <button v-if="auth.isVolunteer && request.status === 'open'" class="help-card_accept" :disabled="accepting" @click="emit('accept', request.id)">Ik wil helpen</button>
      <button class="link-btn" :disabled="accepting" @click="emit('view', request.id)">Bekijken <i class="fa-solid fa-angle-right"></i></button>
    </footer>
  </article>
</template>

<style scoped>
.help-card {
  background: var(--color-bg-card);
  height: 100%;
  position: relative;
}
.help-card-open {
  background: var(--card-bg-primary);
}
.help-card-matched {
  background: var(--card-bg-yellow);
}
.help-card-completed {
  background: var(--card-bg-sage);
}
.help-card-cancelled {
  background: var(--card-bg-danger);
}
.help-card:hover {
  box-shadow: var(--shadow-md);
}

.help-card_accept {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.75rem;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius);
  color: #fff;
  font-family: var(--font-body);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.help-card_accept:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}
.help-card_accept:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.help-card_accept:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.help-card_overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.help-card_header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.help-card_badges {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.help-card_category {
  font-weight: 700;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.help-card_meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
  font-size: var(--font-size-sm);
}

.help-card_meta-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.help-card_meta dt {
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.help-card_meta dd {
  margin: 0;
  text-align: right;
}

.help-card_volunteer-none {
  color: var(--color-text-muted);
  font-style: italic;
}

.help-card_notes {
  font-style: italic;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
}

.help-card_footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: auto;
  padding-top: var(--spacing-sm);
}
</style>
