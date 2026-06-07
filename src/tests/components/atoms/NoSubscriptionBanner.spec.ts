import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoSubscriptionBanner from '@/components/atoms/NoSubscriptionBanner.vue'

describe('NoSubscriptionBanner', () => {
  it('toont een bericht over geen actief abonnement als standaard', () => {
    const wrapper = mount(NoSubscriptionBanner)
    expect(wrapper.text()).toContain('Geen actief abonnement')
  })

  it('toont een bericht over een verlopen abonnement wanneer expired true is', () => {
    const wrapper = mount(NoSubscriptionBanner, { props: { expired: true } })
    expect(wrapper.text()).toContain('Abonnement verlopen')
  })

  it('heeft role alert', () => {
    const wrapper = mount(NoSubscriptionBanner)
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })
})
