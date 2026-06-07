<script setup lang="ts">
// gebruikt van een vorig project (hervormd naar Vue)
import { ref, watch } from 'vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import AppButton from '@/components/atoms/AppButton.vue'

const { message, isOpen, confirm, cancel } = useConfirmDialog()
const dialog = ref<HTMLDialogElement | null>(null)

watch(isOpen, (open) => {
  if (open) dialog.value?.showModal()
  else dialog.value?.close()
})
</script>

<template>
  <dialog ref="dialog" class="app-dialog confirm-dialog" @close="cancel">
    <p class="confirm-dialog_message">{{ message }}</p>
    <div class="dialog-actions">
      <AppButton @click="confirm">Bevestigen</AppButton>
      <AppButton variant="ghost" @click="cancel">Annuleren</AppButton>
    </div>
  </dialog>
</template>

<style scoped>
.confirm-dialog_message {
  font-size: var(--font-size-base);
  margin: 0;
}
</style>
