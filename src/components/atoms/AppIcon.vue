<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: number
  ariaLabel?: string
}>()

const faMap: Record<string, string> = {
  user: 'fa-solid fa-user',
  calendar: 'fa-solid fa-calendar',
  'help-circle': 'fa-solid fa-circle-question',
  clipboard: 'fa-solid fa-clipboard-list',
  logout: 'fa-solid fa-right-from-bracket',
  menu: 'fa-solid fa-bars',
  close: 'fa-solid fa-xmark',
  check: 'fa-solid fa-check',
  edit: 'fa-solid fa-pen',
  trash: 'fa-solid fa-trash',
  plus: 'fa-solid fa-plus',
  'arrow-left': 'fa-solid fa-arrow-left',
  home: 'fa-solid fa-house',
  settings: 'fa-solid fa-gear',
  info: 'fa-solid fa-circle-info',
  warning: 'fa-solid fa-triangle-exclamation',
  volunteer: 'fa-solid fa-hand-holding-heart',
  accessibility: 'fa-solid fa-universal-access',
  contrast: 'fa-solid fa-circle-half-stroke',
  'text-size': 'fa-solid fa-text-height',
  font: 'fa-solid fa-font',
  motion: 'fa-solid fa-person-walking',
  refresh: 'fa-solid fa-rotate-left',
  minus: 'fa-solid fa-minus',
}

const faClass = computed(() => faMap[props.name] ?? 'fa-solid fa-circle-info')
</script>

<template>
  <i :class="faClass" :style="size ? { fontSize: `${size}px` } : undefined" :aria-label="ariaLabel" :aria-hidden="!ariaLabel ? 'true' : undefined" />
</template>
