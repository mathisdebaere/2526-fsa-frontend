<script setup lang="ts">
import { useId } from 'vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    id?: string
    type?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    error?: string | null
    describedBy?: string
  }>(),
  { type: 'text', id: undefined, placeholder: undefined, error: undefined, describedBy: undefined },
)

const generatedId = useId()
const inputId = props.id ?? generatedId
</script>

<template>
  <input :id="inputId" v-model="model" :type="type" :required="required" :disabled="disabled" :aria-invalid="!!error" :aria-describedby="describedBy" class="app-input" :class="{ 'app-input-error': error }" />
</template>

<style scoped>
.app-input {
  width: 100%;
  padding: 0.65rem 0.875rem;
  font-family: inherit;
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  line-height: 1.5;
}

.app-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.app-input:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.app-input:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
  opacity: 0.7;
}

.app-input-error {
  border-color: var(--color-danger);
}
</style>
