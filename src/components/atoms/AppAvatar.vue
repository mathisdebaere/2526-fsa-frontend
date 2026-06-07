<script setup lang="ts">
import avatarPlaceholder from '@/assets/images/avatar_placeholder.png'

withDefaults(
  defineProps<{
    src?: string | null
    name?: string
    size?: 'sm' | 'md' | 'lg'
    alt?: string
  }>(),
  { size: 'md', src: undefined, name: undefined, alt: undefined },
)
</script>

<template>
  <div :class="['avatar', `avatar--${size}`]" :aria-label="alt ?? name">
    <img :src="src ?? avatarPlaceholder" :alt="alt ?? name" class="avatar_img" />
  </div>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar--sm {
  width: 2rem;
  height: 2rem;
}
.avatar--md {
  width: 2.75rem;
  height: 2.75rem;
}
.avatar--lg {
  width: 4rem;
  height: 4rem;
}

.avatar_img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
