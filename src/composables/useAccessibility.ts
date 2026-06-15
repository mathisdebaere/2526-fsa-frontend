import { reactive, watch } from 'vue'

const STORAGE_KEY = 'a11y-settings'

const FONT_SCALES = [100, 112, 125, 137, 150]

interface AccessibilitySettings {
  fontScaleIndex: number
  highContrast: boolean
  readableFont: boolean
  reducedMotion: boolean
}

function loadSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        fontScaleIndex: parsed.fontScaleIndex ?? 0,
        highContrast: !!parsed.highContrast,
        readableFont: !!parsed.readableFont,
        reducedMotion: !!parsed.reducedMotion,
      }
    }
  } catch {
    // ignore invalid stored data
  }
  return { fontScaleIndex: 0, highContrast: false, readableFont: false, reducedMotion: false }
}

const settings = reactive<AccessibilitySettings>(loadSettings())

function applySettings() {
  const root = document.documentElement

  root.style.fontSize = `${FONT_SCALES[settings.fontScaleIndex]}%`
  root.classList.toggle('a11y-contrast', settings.highContrast)
  root.classList.toggle('a11y-readable-font', settings.readableFont)
  root.classList.toggle('a11y-reduced-motion', settings.reducedMotion)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

watch(settings, applySettings, { immediate: true })

export function useAccessibility() {
  function increaseFontSize() {
    settings.fontScaleIndex = Math.min(settings.fontScaleIndex + 1, FONT_SCALES.length - 1)
  }

  function decreaseFontSize() {
    settings.fontScaleIndex = Math.max(settings.fontScaleIndex - 1, 0)
  }

  function toggleHighContrast() {
    settings.highContrast = !settings.highContrast
  }

  function toggleReadableFont() {
    settings.readableFont = !settings.readableFont
  }

  function toggleReducedMotion() {
    settings.reducedMotion = !settings.reducedMotion
  }

  function reset() {
    settings.fontScaleIndex = 0
    settings.highContrast = false
    settings.readableFont = false
    settings.reducedMotion = false
  }

  return {
    settings,
    fontScales: FONT_SCALES,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReadableFont,
    toggleReducedMotion,
    reset,
  }
}
