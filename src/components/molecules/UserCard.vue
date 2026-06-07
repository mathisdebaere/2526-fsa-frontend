<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/api'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'

const props = defineProps<{
  user: User
  linkTo?: string
}>()

const roleLabel: Record<string, string> = {
  client: 'Dienstvrager',
  volunteer: 'Vrijwilliger',
  advisor: 'Adviseur',
}

const statusVariant = computed(() => (props.user.account_status === 'verified' ? 'success' : 'warning'))
const statusLabel = computed(() => (props.user.account_status === 'verified' ? 'Geverifiëerd' : 'Wacht op intake'))
const fullName = computed(() => `${props.user.first_name} ${props.user.last_name}`)
</script>

<template>
  <article class="user-card">
    <AppAvatar :src="user.profile_photo_url" :name="fullName" size="md" />
    <div class="user-card_info">
      <component :is="linkTo ? 'a' : 'span'" :href="linkTo" class="user-card_name">
        {{ fullName }}
      </component>
      <p class="user-card_email">{{ user.email }}</p>
      <div class="user-card_meta">
        <AppBadge variant="info">{{ roleLabel[user.role] ?? user.role }}</AppBadge>
        <AppBadge :variant="statusVariant">{{ statusLabel }}</AppBadge>
      </div>
    </div>
  </article>
</template>

<style scoped>
.user-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.user-card_info {
  flex: 1;
  min-width: 0;
}

.user-card_name {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
  margin-bottom: 0.125rem;
}

.user-card_name:hover {
  text-decoration: underline;
}

.user-card_email {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-card_meta {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}
</style>
