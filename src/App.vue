<script setup lang="ts">
import { RouterView } from 'vue-router'
import ConfirmDialog from '@/components/atoms/ConfirmDialog.vue'
import AccessibilityWidget from '@/components/organisms/AccessibilityWidget.vue'
</script>

<template>
  <RouterView />
  <ConfirmDialog />
  <AccessibilityWidget />
</template>
