<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import { useAccessibility } from '@/composables/useAccessibility'

const { settings, fontScales, increaseFontSize, decreaseFontSize, toggleHighContrast, toggleReadableFont, toggleReducedMotion, reset } = useAccessibility()

const isOpen = ref(false)
const widgetRef = ref<HTMLElement | null>(null)

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function onClickOutside(event: MouseEvent) {
  if (isOpen.value && widgetRef.value && !widgetRef.value.contains(event.target as Node)) {
    close()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="widgetRef" class="a11y-widget">
    <div v-if="isOpen" class="a11y-panel" role="dialog" aria-label="Toegankelijkheidsinstellingen">
      <div class="a11y-panel_header">
        <h2 class="a11y-panel_title">Toegankelijkheid</h2>
        <button type="button" class="a11y-panel_close" aria-label="Sluiten" @click="close">
          <AppIcon name="close" :size="16" />
        </button>
      </div>

      <div class="a11y-panel_group">
        <span class="a11y-panel_label">Tekstgrootte</span>
        <div class="a11y-panel_row">
          <button type="button" class="a11y-control" :disabled="settings.fontScaleIndex === 0" aria-label="Tekst verkleinen" @click="decreaseFontSize">
            <AppIcon name="minus" :size="16" />
          </button>
          <span class="a11y-panel_value">{{ fontScales[settings.fontScaleIndex] }}%</span>
          <button type="button" class="a11y-control" :disabled="settings.fontScaleIndex === fontScales.length - 1" aria-label="Tekst vergroten" @click="increaseFontSize">
            <AppIcon name="plus" :size="16" />
          </button>
        </div>
      </div>

      <div class="a11y-panel_group">
        <button type="button" class="a11y-toggle" :class="{ 'a11y-toggle-active': settings.highContrast }" :aria-pressed="settings.highContrast" @click="toggleHighContrast">
          <AppIcon name="contrast" :size="18" aria-hidden="true" />
          <span>Hoog contrast</span>
        </button>

        <button type="button" class="a11y-toggle" :class="{ 'a11y-toggle-active': settings.readableFont }" :aria-pressed="settings.readableFont" @click="toggleReadableFont">
          <AppIcon name="font" :size="18" aria-hidden="true" />
          <span>Leesvriendelijk lettertype</span>
        </button>

        <button type="button" class="a11y-toggle" :class="{ 'a11y-toggle-active': settings.reducedMotion }" :aria-pressed="settings.reducedMotion" @click="toggleReducedMotion">
          <AppIcon name="motion" :size="18" aria-hidden="true" />
          <span>Beweging verminderen</span>
        </button>
      </div>

      <button type="button" class="a11y-reset" @click="reset">
        <AppIcon name="refresh" :size="14" aria-hidden="true" />
        <span>Standaardinstellingen herstellen</span>
      </button>
    </div>

    <button type="button" class="a11y-trigger" :aria-expanded="isOpen" aria-label="Toegankelijkheidsopties openen" @click="toggleOpen">
      <AppIcon name="accessibility" :size="24" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.a11y-widget {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 10000;
}

.a11y-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--border-radius-full);
  border: none;
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.a11y-trigger:hover {
  background: var(--color-primary-dark);
}

.a11y-panel {
  position: absolute;
  bottom: calc(100% + var(--spacing-sm));
  right: 0;
  width: 17rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.a11y-panel_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.a11y-panel_title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text);
}

.a11y-panel_close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--border-radius);
}

.a11y-panel_close:hover {
  background: var(--color-primary-light);
  color: var(--color-text);
}

.a11y-panel_group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.a11y-panel_label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
}

.a11y-panel_row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.a11y-panel_value {
  flex: 1;
  text-align: center;
  font-weight: 600;
}

.a11y-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: none;
  color: var(--color-primary);
  cursor: pointer;
}

.a11y-control:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.a11y-control:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.a11y-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: none;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  cursor: pointer;
  text-align: left;
}

.a11y-toggle:hover {
  background: var(--color-primary-light);
}

.a11y-toggle-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.a11y-reset {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-family: var(--font-body);
  text-decoration: underline;
  cursor: pointer;
}

.a11y-reset:hover {
  color: var(--color-text);
}
</style>
