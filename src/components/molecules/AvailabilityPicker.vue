<script setup lang="ts">
import { ref } from 'vue'
import type { Availability } from '@/types/api'
import { formatDateCompact as formatDate } from '@/utils/date'
import AppButton from '@/components/atoms/AppButton.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'

defineProps<{
  availabilities: Availability[]
  editable?: boolean
}>()

const emit = defineEmits<{
  add: [{ date: string; time_of_day: 'morning' | 'afternoon' | 'evening' }]
  remove: [id: number]
}>()

const date = ref('')
const timeOfDay = ref<'morning' | 'afternoon' | 'evening'>('morning')
const timeLabels: Record<string, string> = {
  morning: 'Ochtend',
  afternoon: 'Namiddag',
  evening: 'Avond',
}

function handleAdd() {
  if (!date.value) return
  emit('add', { date: date.value, time_of_day: timeOfDay.value })
  date.value = ''
}
</script>

<template>
  <section class="availability-picker" aria-label="Beschikbaarheden">
    <ul v-if="availabilities.length" class="availability-picker_list" role="list">
      <li v-for="a in availabilities" :key="a.id" class="availability-picker_item">
        <div class="availability-picker_info">
          <AppBadge variant="info">{{ timeLabels[a.time_of_day] }}</AppBadge>
          <span>{{ formatDate(a.date) }}</span>
        </div>
        <button v-if="editable" class="availability-picker_remove" :aria-label="`Verwijder ${a.date} ${timeLabels[a.time_of_day]}`" @click="emit('remove', a.id)">
          <i class="fa-solid fa-xmark"></i>
          <span class="availability-picker_remove-label">Verwijder beschikbaarheid</span>
        </button>
      </li>
    </ul>
    <p v-else class="availability-picker_empty">Nog geen beschikbaarheden ingegeven.</p>

    <form v-if="editable" class="availability-picker_form" @submit.prevent="handleAdd">
      <label class="availability-picker_label" for="avail-date">Datum</label>
      <input id="avail-date" v-model="date" type="date" class="availability-picker_input" required />

      <label class="availability-picker_label" for="avail-time">Tijdstip</label>
      <select id="avail-time" v-model="timeOfDay" class="availability-picker_input">
        <option value="morning">Ochtend</option>
        <option value="afternoon">Namiddag</option>
        <option value="evening">Avond</option>
      </select>

      <AppButton type="submit" size="sm">Toevoegen</AppButton>
    </form>
  </section>
</template>

<style scoped>
.availability-picker {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.availability-picker_list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.availability-picker_item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.5rem;
  background: var(--color-primary-light);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

.availability-picker_info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  min-width: 0;
}

.availability-picker_remove {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  padding: 0 0.25rem;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: inherit;
  flex-shrink: 0;
}

.availability-picker_remove-label {
  display: none;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.availability-picker_remove:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (max-width: 400px) {
  .availability-picker_item {
    flex-direction: column;
    align-items: stretch;
  }

  .availability-picker_remove {
    justify-content: center;
    padding: 0.4rem;
    border: 1px solid var(--color-danger);
    border-radius: var(--border-radius);
    background: var(--color-danger-light, #fef2f2);
    width: 100%;
    flex-shrink: unset;
  }

  .availability-picker_remove-label {
    display: inline;
  }
}

.availability-picker_empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.availability-picker_form {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-sm);
  align-items: center;
}

.availability-picker_label {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.availability-picker_input {
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: var(--font-size-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
}

.availability-picker_input:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.availability-picker_form > button {
  grid-column: 2;
}
</style>
