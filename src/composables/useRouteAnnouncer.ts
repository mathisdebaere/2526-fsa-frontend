import { ref } from 'vue'

const announcement = ref('')

export function useRouteAnnouncer() {
  return { announcement }
}
