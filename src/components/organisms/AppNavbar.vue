<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const fullName = computed(() => (auth.user ? `${auth.user.first_name} ${auth.user.last_name}` : ''))

const navLinks = computed(() => {
  const links = [{ name: 'dashboard', label: 'Dashboard', to: '/dashboard' }]

  if (auth.isAuthenticated) {
    links.push({ name: 'profile', label: 'Mijn profiel', to: '/profile' })
    links.push({ name: 'appointments', label: 'Afspraken', to: '/appointments' })
    if (!auth.isClient) {
      links.push({ name: 'help-requests', label: 'Hulpvragen', to: '/help-requests' })
    }
  }

  if (auth.isAdvisor || auth.isAdmin) {
    links.push({ name: 'clients', label: 'Dienstvragers', to: '/clients' })
    links.push({ name: 'volunteers', label: 'Vrijwilligers', to: '/volunteers' })
    links.push({ name: 'intakes', label: 'Intakes', to: '/intakes' })
    links.push({ name: 'subscriptions', label: 'Abonnementen', to: '/subscriptions' })
  }

  if (auth.isAdmin) {
    links.push({ name: 'users', label: 'Gebruikers', to: '/users' })
  }

  return links
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="navbar" role="banner">
    <div class="navbar_inner">
      <RouterLink to="/dashboard" class="navbar_logo" @click="closeMenu">
        <img src="@/assets/images/logo.png" alt="FijneWijk" class="navbar_logo-img" />
      </RouterLink>

      <nav class="navbar_nav" aria-label="navigatie">
        <ul role="list" class="navbar_links">
          <li v-for="link in navLinks" :key="link.name">
            <RouterLink :to="link.to" class="navbar_link">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </nav>
      <div v-if="auth.isAuthenticated" class="navbar_user">
        <RouterLink to="/profile" class="navbar_user-info" :aria-label="`Profiel van ${fullName}`">
          <AppAvatar :src="auth.user?.profile_photo_url" :name="fullName" size="sm" />
          <span class="navbar_user-name">{{ auth.user?.first_name }}</span>
        </RouterLink>
        <AppButton variant="ghost" size="sm" @click="handleLogout">Afmelden</AppButton>
      </div>
      <div v-else class="navbar_user">
        <RouterLink to="/login" class="navbar_link">Aanmelden</RouterLink>
      </div>

      <button class="navbar_hamburger" :aria-expanded="menuOpen" aria-controls="mobile-menu" aria-label="open menu" @click="toggleMenu">
        <span class="navbar_hamburger-bar"></span>
        <span class="navbar_hamburger-bar"></span>
        <span class="navbar_hamburger-bar"></span>
      </button>
    </div>

    <nav v-if="menuOpen" id="mobile-menu" class="navbar_mobile" aria-label="Mobiele navigatie">
      <ul role="list">
        <li v-for="link in navLinks" :key="link.name">
          <RouterLink :to="link.to" class="navbar_mobile-link" @click="closeMenu">
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>
      <AppButton v-if="auth.isAuthenticated" variant="danger" size="sm" full-width @click="handleLogout"> Afmelden </AppButton>
    </nav>
  </header>
</template>

<style scoped lang="scss">
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg-nav);
  box-shadow: var(--shadow-md);
}

.navbar_inner {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  height: var(--nav-height);
  padding: 0 var(--spacing-lg);
  max-width: var(--max-width);
  margin: 0 auto;
}

.navbar_logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: #fff;
  font-weight: 700;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.navbar_logo-img {
  height: 2rem;
  width: auto;
}

.navbar_nav {
  flex: 1;
  overflow: hidden;
}

.navbar_links {
  list-style: none;
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
}

.navbar_link {
  display: block;
  padding: 0.4rem 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: var(--font-size-sm);
  border-radius: var(--border-radius);
  white-space: nowrap;
}

.navbar_link:hover,
.navbar_link.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.navbar_link:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.navbar_user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.navbar_user-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none;
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: 600;
  border-radius: var(--border-radius);
  padding: 0.25rem;
}

.navbar_user-info:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.navbar_user-name {
  display: none;

  @include breakpoint-up(md) {
    display: block;
  }
}

.navbar_hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
}

.navbar_hamburger-bar {
  display: block;
  width: 1.5rem;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}

@include breakpoint(md) {
  .navbar_nav {
    display: none;
  }
  .navbar_hamburger {
    display: flex;
  }
}

.navbar_mobile {
  background: var(--color-primary-dark);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.navbar_mobile ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.navbar_mobile-link {
  display: block;
  padding: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: var(--font-size-base);
  border-radius: var(--border-radius);
}

.navbar_mobile-link:hover,
.navbar_mobile-link.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
</style>
