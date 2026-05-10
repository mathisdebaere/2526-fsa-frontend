<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLoading } from '@/composables/useLoading'
import { useRouteAnnouncer } from '@/composables/useRouteAnnouncer'

const auth = useAuthStore()
const { loading } = useLoading()
const { announcement } = useRouteAnnouncer()
</script>

<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <div aria-live="polite" aria-atomic="true" class="sr-only">{{ announcement }}</div>

  <div v-show="loading" role="status" aria-live="polite">Loading...</div>

  <nav>
    <div class="nav__left">
      <img src="@/assets/images/logo.png" alt="Logo" class="nav__logo" />
      <RouterLink :to="{ name: 'home' }">Home</RouterLink>
      <RouterLink :to="{ name: 'about' }">About</RouterLink>
      <RouterLink v-if="auth.user" :to="{ name: 'dashboard' }">Dashboard</RouterLink>
      <RouterLink v-if="auth.user?.role === 'admin'" :to="{ name: 'admin' }">Admin</RouterLink>
    </div>
    <div class="nav__right">
      <RouterLink v-if="!auth.user" :to="{ name: 'login' }" class="nav__login">Login</RouterLink>
      <RouterLink v-if="auth.user" :to="{ name: 'logout' }" class="nav__logout">Logout</RouterLink>
    </div>
  </nav>

  <div id="main-content">
    <RouterView />
  </div>
</template>

<style lang="scss">
@use '@/assets/variables' as *;

.sr-only {
  position: absolute;
  width: 0.0625rem;
  height: 0.0625rem;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: $nav-accent;
  color: #fff;
  border-radius: $radius;
  font-weight: 600;
  z-index: 999;

  &:focus {
    top: 1rem;
    @include focus-ring;
  }
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $nav-height;
  padding: 0 1.5rem;
  background: $nav-bg;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.4);

  .nav__left,
  .nav__right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  a {
    color: $nav-text;
    text-decoration: none;
    padding: 0.4rem 0.85rem;
    border-radius: $radius;
  
    font-size: 0.9rem;
    transition: background $transition, color $transition;

    &.router-link-active {
      color: white;
      font-weight: 600;
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  a.nav__logout {
    color: rgb(255, 51, 51);
    border: 0.0625rem solid rgb(255, 51, 51);
    background-color: rgba(255, 51, 51, 0.212);
    font-size: 0.9rem;
    font-weight: 600;

    &:hover {
      background-color: rgb(255, 51, 51);
      color: rgb(255, 255, 255)
    }
  }

  a.nav__login {
    border: 0.0625rem solid white;
  }

  .nav__logo {
    height: 2rem;
    width: auto;
  }
}

#main-content {
  max-width: 50rem;
  margin: 2.5rem auto;
  padding: 0 1.5rem;
}

[role='status'] {
  position: fixed;
  top: $nav-height;
  left: 0;
  right: 0;
  padding: 0.5rem 1.5rem;
  color: $nav-accent;
  font-size: 0.85rem;
  text-align: center;
  z-index: 10;
}
</style>
