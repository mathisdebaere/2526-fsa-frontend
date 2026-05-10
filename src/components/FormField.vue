<script setup lang="ts">
import { useId } from 'vue'

const model = defineModel<string>({ required: true })

const props = defineProps<{
  label: string
  error?: string | null
  type?: string
  required?: boolean
  id?: string
}>()

const generatedId = useId()
const inputId = props.id ?? generatedId
</script>

<template>
  <label :for="inputId">
    <span class="field-label">{{ label }}</span>
    <span v-if="error" class="field-error">{{ error }}</span>
    <input v-model="model" :type="type ?? 'text'" :id="inputId" :required="required" />
  </label>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  .field-label {
    font-size: 0.85rem;
    color: $text-muted;
  }

  .field-error {
    font-size: 0.8rem;
    color: rgb(255, 100, 100);
  }

  input {
    padding: 0.55rem 0.75rem;
    background: $nav-bg;
    border: 0.0625rem solid rgba(255, 255, 255, 0.1);
    border-radius: $radius;
    color: $text;
    font-size: 0.95rem;
    transition: border-color $transition;

    &:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
    }

    &:focus-visible {
      @include focus-ring;
    }
  }
}
</style>
