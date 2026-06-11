<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'

const props = defineProps<{
  currentPage: number
  lastPage: number
  total: number
  perPage: number
}>()

const emit = defineEmits<{ pageChange: [n: number] }>()

function changePage(n: number) {
  emit('pageChange', n)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const pages = computed((): (number | '...')[] => {
  const { currentPage: cur, lastPage: last } = props
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const result: (number | '...')[] = [1]

  if (cur > 3) result.push('...')

  const start = Math.max(2, cur - 1)
  const end = Math.min(last - 1, cur + 1)
  for (let i = start; i <= end; i++) result.push(i)

  if (cur < last - 2) result.push('...')
  result.push(last)

  return result
})
</script>

<template>
  <div v-if="lastPage > 1" data-testid="paginatie" class="pagination">
    <span class="pagination_info"> Pagina {{ currentPage }} van {{ lastPage }} ({{ total }} resultaten) </span>
    <div class="pagination_controls">
      <AppButton data-testid="paginatie-vorige" size="sm" variant="ghost" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"> <i class="fa-solid fa-angle-left"></i> <span class="pagination_btn-label">Vorige</span> </AppButton>

      <template v-for="p in pages" :key="String(p)">
        <span v-if="p === '...'" class="pagination_ellipsis"></span>
        <button v-else class="pagination_num" :class="{ 'pagination_num-active': p === currentPage }" :aria-current="p === currentPage ? 'page' : undefined" @click="changePage(p as number)">
          {{ p }}
        </button>
      </template>

      <AppButton data-testid="paginatie-volgende" size="sm" variant="ghost" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)"> <span class="pagination_btn-label">Volgende</span> <i class="fa-solid fa-angle-right"></i> </AppButton>
    </div>
  </div>
  <p v-else-if="total > 0" class="pagination_info">{{ total }} resultaten</p>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.pagination_info {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.pagination_controls {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination_ellipsis {
  padding: 0 0.25rem;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.pagination_num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: none;
  font-family: var(--font-body);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}

.pagination_num:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}
.pagination_num:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.pagination_num-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  cursor: default;
}

@include breakpoint(mob) {
  .pagination_btn-label {
    display: none;
  }
  .pagination_num {
    width: 1.75rem;
    height: 1.75rem;
  }
}
</style>
