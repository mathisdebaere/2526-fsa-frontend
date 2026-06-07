import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '@/components/molecules/UserCard.vue'
import type { User } from '@/types/api'

const dienstvrager: User = {
  id: 1,
  first_name: 'Bart',
  last_name: 'Delrue',
  email: 'bart@example.be',
  role: 'client',
  account_status: 'verified',
  profile_photo_url: null,
  is_admin: false,
  email_verified_at: '2004-08-11',
  phone: null,
  created_at: '2004-08-11',
  updated_at: '2004-08-11',
}

describe('UserCard', () => {
  it('toont de volledige naam van de gebruiker', () => {
    const wrapper = mount(UserCard, { props: { user: dienstvrager } })
    expect(wrapper.text()).toContain('Bart Delrue')
  })

  it('toont het e-mailadres', () => {
    const wrapper = mount(UserCard, { props: { user: dienstvrager } })
    expect(wrapper.text()).toContain('bart@example.be')
  })

  it('toont de Nederlandse rolnaam voor een dienstvrager', () => {
    const wrapper = mount(UserCard, { props: { user: dienstvrager } })
    expect(wrapper.text()).toContain('Dienstvrager')
  })

  it('toont de Nederlandse rolnaam voor een vrijwilliger', () => {
    const vrijwilliger = { ...dienstvrager, role: 'volunteer' } as User
    const wrapper = mount(UserCard, { props: { user: vrijwilliger } })
    expect(wrapper.text()).toContain('Vrijwilliger')
  })

  it('toont de Nederlandse rolnaam voor een adviseur', () => {
    const adviseur = { ...dienstvrager, role: 'advisor' } as User
    const wrapper = mount(UserCard, { props: { user: adviseur } })
    expect(wrapper.text()).toContain('Adviseur')
  })

  it('toont de statusbadge "Geverifiëerd" wanneer account_status verified is', () => {
    const wrapper = mount(UserCard, { props: { user: dienstvrager } })
    expect(wrapper.text()).toContain('Geverifiëerd')
  })

  it('toont de statusbadge "Wacht op intake" wanneer account_status niet verified is', () => {
    const wachtend = { ...dienstvrager, account_status: 'waiting_for_interview' } as User
    const wrapper = mount(UserCard, { props: { user: wachtend } })
    expect(wrapper.text()).toContain('Wacht op intake')
  })

  it('rendert een link wanneer linkTo opgegeven is', () => {
    const wrapper = mount(UserCard, { props: { user: dienstvrager, linkTo: '/clients/1' } })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').attributes('href')).toBe('/clients/1')
  })

  it('rendert geen link wanneer linkTo niet opgegeven is', () => {
    const wrapper = mount(UserCard, { props: { user: dienstvrager } })
    expect(wrapper.find('a').exists()).toBe(false)
  })
})
