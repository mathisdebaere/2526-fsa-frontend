<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppAvatar from '@/components/atoms/AppAvatar.vue'

const auth = useAuthStore()
const router = useRouter()

const mobileOpen = ref(false)

const fullName = computed(() => (auth.user ? `${auth.user.first_name} ${auth.user.last_name}` : ''))

interface NavItem {
  to: string
  label: string
  icon: string
}

const navItems = computed((): NavItem[] => {
  if (auth.isClient) {
    return [
      { to: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
      { to: '/client/help-requests', label: 'Mijn hulpaanvragen', icon: 'fa-solid fa-circle-question' },
      { to: '/client/appointments', label: 'Mijn afspraken', icon: 'fa-solid fa-calendar' },
      { to: '/client/volunteers', label: 'Vrijwilligers', icon: 'fa-solid fa-hand-holding-heart' },
    ]
  }
  if (auth.isAdvisor) {
    return [
      { to: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
      { to: '/appointments', label: 'Afspraken', icon: 'fa-solid fa-calendar' },
      { to: '/help-requests', label: 'Hulpvragen', icon: 'fa-solid fa-circle-question' },
      { to: '/clients', label: 'Dienstvragers', icon: 'fa-solid fa-user' },
      { to: '/volunteers', label: 'Vrijwilligers', icon: 'fa-solid fa-hand-holding-heart' },
      { to: '/intakes', label: 'Intakes', icon: 'fa-solid fa-clipboard-list' },
      { to: '/subscriptions', label: 'Abonnementen', icon: 'fa-solid fa-gear' },
    ]
  }
  return [
    { to: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
    { to: '/appointments', label: 'Afspraken', icon: 'fa-solid fa-calendar' },
    { to: '/help-requests', label: 'Hulpvragen', icon: 'fa-solid fa-circle-question' },
  ]
})

async function handleLogout() {
  mobileOpen.value = false
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div v-if="mobileOpen" class="sidebar-overlay" aria-hidden="true" @click="mobileOpen = false" />
  <button class="sidebar-mobile-toggle" :aria-expanded="mobileOpen" aria-controls="app-sidebar" aria-label="Navigatie openen" @click="mobileOpen = !mobileOpen">
    <span class="sidebar-mobile-toggle_bars">
      <span class="sidebar-mobile-toggle_bar" />
      <span class="sidebar-mobile-toggle_bar" />
      <span class="sidebar-mobile-toggle_bar" />
    </span>
    <span class="sidebar-mobile-toggle_label">MENU</span>
  </button>

  <aside id="app-sidebar" :class="['sidebar', { 'sidebar--mobile-open': mobileOpen }]" aria-label="navigatie">
    <div class="sidebar_header">
      <RouterLink to="/dashboard" class="sidebar_brand" @click="mobileOpen = false">
        <img src="@/assets/images/logo.png" alt="" aria-hidden="true" class="sidebar_logo" />
      </RouterLink>
    </div>

    <div v-if="auth.user" class="sidebar_user">
      <RouterLink to="/profile" class="sidebar_user-link" :title="fullName" @click="mobileOpen = false">
        <AppAvatar :src="auth.user.profile_photo_url" :name="fullName" size="sm" />
        <div class="sidebar_user-info">
          <span class="sidebar_user-name">{{ auth.user.first_name }}</span>
          <span class="sidebar_user-role">
            {{ { client: 'Dienstvrager', volunteer: 'Vrijwilliger', advisor: 'Adviseur' }[auth.user.role] ?? auth.user.role }}
          </span>
        </div>
      </RouterLink>
    </div>

    <nav class="sidebar_nav" aria-label="Paginanavigatie">
      <ul role="list">
        <li v-for="item in navItems" :key="item.to">
          <RouterLink :to="item.to" class="sidebar_link" @click="mobileOpen = false">
            <i :class="item.icon" style="width: 1.25rem; text-align: center; flex-shrink: 0" aria-hidden="true"></i>
            <span class="sidebar_link-label">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar_footer">
      <RouterLink to="/profile" class="sidebar_link" @click="mobileOpen = false">
        <i class="fa-solid fa-user" style="width: 1.25rem; text-align: center; flex-shrink: 0" aria-hidden="true"></i>
        <span class="sidebar_link-label">Mijn profiel</span>
      </RouterLink>

      <button class="sidebar_logout" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket" style="width: 1.25rem; text-align: center; flex-shrink: 0" aria-hidden="true"></i>
        <span class="sidebar_logout-label">Afmelden</span>
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 67;
}

.sidebar-mobile-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 69;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-primary);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  color: #fff;
}

.sidebar-mobile-toggle_bars {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.sidebar-mobile-toggle_bar {
  display: block;
  width: 1.25rem;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}

.sidebar-mobile-toggle_label {
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.sidebar-mobile-toggle:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 15rem;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  flex-direction: column;
  z-index: 68;
  overflow: hidden;
}

.sidebar_header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.875rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
  min-height: 4rem;
}

.sidebar_brand {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #fff;
}

.sidebar_logo {
  height: 3rem;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar_user {
  padding: 0.875rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.sidebar_user-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: #fff;
  border-radius: var(--border-radius);
  padding: 0.375rem;
  overflow: hidden;
}

.sidebar_user-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar_user-link:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.sidebar_user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.sidebar_user-name {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar_user-role {
  font-size: 0.75rem;
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar_nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.625rem 0;
}

.sidebar_nav ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0 0.5rem;
}

.sidebar_link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  border-radius: var(--border-radius);
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar_link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.sidebar_link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 600;
}

.sidebar_link:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.sidebar_link-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar_footer {
  padding: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex-shrink: 0;
}

.sidebar_logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  color: rgba(255, 180, 180, 0.9);
  background: none;
  border: none;
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}

.sidebar_logout:hover {
  background: rgba(255, 80, 80, 0.15);
  color: #ffaaaa;
}

.sidebar_logout:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.sidebar_logout-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

@include breakpoint(md) {
  .sidebar-mobile-toggle {
    display: flex;
  }

  .sidebar {
    transform: translateX(-100%);
    width: min(16rem, 85vw);
  }

  .sidebar--mobile-open {
    transform: translateX(0);
  }

  .sidebar_collapse-btn {
    display: none;
  }
}
</style>
