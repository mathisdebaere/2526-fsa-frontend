import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresAdmin?: boolean
    requiresAdvisor?: boolean
    requiresClient?: boolean
    loginGuard?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/LandingPage.vue'),
      meta: { title: 'FijneWijk | Home', loginGuard: true },
    },

    // Authenticatiee
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { title: 'Aanmelden', loginGuard: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/RegisterPage.vue'),
      meta: { title: 'Registreren', loginGuard: true },
    },

    // Dashboard
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/dashboard/DashboardPage.vue'),
      meta: { title: 'Dashboard', requiresAuth: true },
    },

    // Profielpaginas
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/profile/ProfilePage.vue'),
      meta: { title: 'Mijn profiel', requiresAuth: true },
    },

    {
      path: '/clients',
      name: 'clients',
      component: () => import('@/pages/clients/ClientsPage.vue'),
      meta: { title: 'Dienstvragers', requiresAuth: true, requiresAdvisor: true },
    },
    {
      path: '/clients/:id',
      name: 'client-detail',
      component: () => import('@/pages/clients/ClientDetailPage.vue'),
      meta: { title: 'Dienstvrager', requiresAuth: true, requiresAdvisor: true },
    },

    {
      path: '/volunteers',
      name: 'volunteers',
      component: () => import('@/pages/volunteers/VolunteersPage.vue'),
      meta: { title: 'Vrijwilligers', requiresAuth: true, requiresAdvisor: true },
    },
    {
      path: '/volunteers/:id',
      name: 'volunteer-detail',
      component: () => import('@/pages/volunteers/VolunteerDetailPage.vue'),
      meta: { title: 'Vrijwilliger', requiresAuth: true, requiresAdvisor: true },
    },

    // AFspraken
    {
      path: '/appointments',
      name: 'appointments',
      component: () => import('@/pages/appointments/AppointmentsPage.vue'),
      meta: { title: 'Afspraken', requiresAuth: true },
    },
    {
      path: '/appointments/:id',
      name: 'appointment-detail',
      component: () => import('@/pages/appointments/AppointmentDetailPage.vue'),
      meta: { title: 'Afspraak', requiresAuth: true },
    },

    // Helpaanvragen
    {
      path: '/help-requests',
      name: 'help-requests',
      component: () => import('@/pages/help-requests/HelpRequestsPage.vue'),
      meta: { title: 'Hulpvragen', requiresAuth: true },
    },
    {
      path: '/help-requests/:id',
      name: 'help-request-detail',
      component: () => import('@/pages/help-requests/HelpRequestDetailPage.vue'),
      meta: { title: 'Hulpvraag', requiresAuth: true },
    },

    // oudejse views
    {
      path: '/client/help-requests',
      name: 'client-help-requests',
      component: () => import('@/pages/client/ClientHelpRequestsPage.vue'),
      meta: { title: 'Mijn hulpaanvragen', requiresAuth: true, requiresClient: true },
    },
    {
      path: '/client/appointments',
      name: 'client-appointments',
      component: () => import('@/pages/client/ClientMatchesPage.vue'),
      meta: { title: 'Mijn afspraken', requiresAuth: true, requiresClient: true },
    },
    {
      path: '/client/volunteers',
      name: 'client-volunteers',
      component: () => import('@/pages/client/ClientVolunteersPage.vue'),
      meta: { title: 'Vrijwilligers', requiresAuth: true, requiresClient: true },
    },
    {
      path: '/client/volunteers/:id',
      name: 'client-volunteer-detail',
      component: () => import('@/pages/volunteers/VolunteerDetailPage.vue'),
      meta: { title: 'Vrijwilliger', requiresAuth: true, requiresClient: true },
    },

    // Intakes
    {
      path: '/intakes',
      name: 'intakes',
      component: () => import('@/pages/intakes/IntakesPage.vue'),
      meta: { title: 'Intakes', requiresAuth: true, requiresAdvisor: true },
    },
    {
      path: '/intakes/:id',
      name: 'intake-detail',
      component: () => import('@/pages/intakes/IntakeDetailPage.vue'),
      meta: { title: 'Intake inplannen', requiresAuth: true, requiresAdvisor: true },
    },

    // Subscriptions
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: () => import('@/pages/subscriptions/SubscriptionsPage.vue'),
      meta: { title: 'Abonnementen', requiresAuth: true, requiresAdvisor: true },
    },

    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/pages/PrivacyPolicyPage.vue'),
      meta: { title: 'Privacybeleid' },
    },

    {
      path: '/pending-approval',
      name: 'pending-approval',
      component: () => import('@/pages/auth/PendingApprovalPage.vue'),
      meta: { title: 'Registratie ontvangen' },
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/errors/NotFoundPage.vue'),
      meta: { title: 'Pagina niet gevonden' },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.fetchUser()
  }

  if (to.meta.loginGuard && auth.isAuthenticated) {
    return auth.isPendingApproval ? '/pending-approval' : '/dashboard'
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (auth.isPendingApproval && to.name !== 'pending-approval') {
    return '/pending-approval'
  }

  if (to.name === 'pending-approval' && auth.isAuthenticated && !auth.isPendingApproval) {
    return '/dashboard'
  }

  if (to.meta.requiresAdvisor && !auth.isAdvisor) {
    return { name: 'not-found' }
  }

  if (to.meta.requiresClient && !auth.isClient) {
    return { name: 'not-found' }
  }

  if ((to.name === 'help-requests' || to.name === 'help-request-detail') && auth.isClient) {
    return { name: 'client-help-requests' }
  }
})

router.afterEach((to) => {
  const appName = 'FijneWijk'
  document.title = to.meta.title ? `${to.meta.title} | ${appName}` : appName
})

export default router
