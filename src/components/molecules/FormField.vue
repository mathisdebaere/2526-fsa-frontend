<script setup lang="ts">
import { useId } from 'vue'
import AppLabel from '@/components/atoms/AppLabel.vue'
import AppInput from '@/components/atoms/AppInput.vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    label: string
    id?: string
    type?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    error?: string | null
  }>(),
  { type: 'text', id: undefined, placeholder: undefined, error: undefined },
)

const generatedId = useId()
const fieldId = props.id ?? generatedId
</script>

<template>
  <div class="form-field">
    <div class="form-field_header">
      <AppLabel :for="fieldId" :required="required">{{ label }}</AppLabel>
      <span v-if="error" :id="`${fieldId}-error`" data-testid="veld-fout" class="form-field_error" role="alert">{{ error }}</span>
    </div>
    <AppInput :id="fieldId" v-model="model" :type="type" :required="required" :disabled="disabled" :error="error" :described-by="error ? `${fieldId}-error` : undefined" />
  </div>
</template>

<style scoped lang="scss">
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-field_header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: 0.375rem;
}

.form-field_error {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

@include breakpoint(sm) {
  .form-field_header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
  }
}
</style>
