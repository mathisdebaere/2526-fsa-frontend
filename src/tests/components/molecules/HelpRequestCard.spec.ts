import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

const mockAuth = vi.hoisted(() => ({ isVolunteer: false }))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuth,
}))

import HelpRequestCard from '@/components/molecules/HelpRequestCard.vue'
import type { HelpRequest } from '@/types/api'

const basisVerzoek: HelpRequest = {
  id: 1,
  status: 'open',
  help_request_category_id: 2,
  client_id: 3,
  volunteer_id: null,
  extra_notes: null,
  region: null,
  date: null,
  time: null,
}

describe('HelpRequestCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockAuth.isVolunteer = false
  })

  it('toont de categorie-id wanneer geen categorienaam opgegeven is', () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    expect(wrapper.text()).toContain('Categorie #2')
  })

  it('toont de categorienaam wanneer een categorie opgegeven is', () => {
    const verzoek = {
      ...basisVerzoek,
      category: { id: 2, name: 'Vervoer', description: null, icon: null },
    }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.text()).toContain('Vervoer')
  })

  it('toont de regio wanneer opgegeven', () => {
    const verzoek = { ...basisVerzoek, region: 'Gent' }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.text()).toContain('Gent')
  })

  it('toont geen regio-rij wanneer region null is', () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    expect(wrapper.text()).not.toContain('Regio')
  })

  it('toont datum wanneer opgegeven', () => {
    const verzoek = { ...basisVerzoek, date: '2004-08-11' }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.text()).toContain('Datum')
  })

  it('toont geen datum-rij wanneer date null is', () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    expect(wrapper.text()).not.toContain('Datum')
  })

  it('toont tijdstip wanneer opgegeven', () => {
    const verzoek = { ...basisVerzoek, time: '10:30:00' }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.text()).toContain('Tijdstip')
    expect(wrapper.text()).toContain('10:30')
  })

  it('toont geen tijdstip-rij wanneer time null is', () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    expect(wrapper.text()).not.toContain('Tijdstip')
  })

  it('toont "Nog geen vrijwilliger" wanneer geen vrijwilliger gekoppeld is', () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    expect(wrapper.text()).toContain('Nog geen vrijwilliger')
  })

  it('toont de naam van de vrijwilliger wanneer gekoppeld', () => {
    const verzoek = {
      ...basisVerzoek,
      volunteer: {
        id: 5,
        personal_description: null,
        background_notes: null,
        user_id: 10,
        user: { first_name: 'Bart', last_name: 'Delrue' },
      } as any,
    }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.text()).toContain('Bart Delrue')
  })

  it('toont extra notities wanneer opgegeven', () => {
    const verzoek = { ...basisVerzoek, extra_notes: 'Speciale instructies' }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.text()).toContain('Speciale instructies')
  })

  it('toont geen notities-blok wanneer extra_notes null is', () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    expect(wrapper.find('.help-card_notes').exists()).toBe(false)
  })

  it('toont de overlay wanneer accepting true is', () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek, accepting: true } })
    expect(wrapper.find('.help-card_overlay').exists()).toBe(true)
  })

  it('toont geen overlay wanneer accepting false is', () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek, accepting: false } })
    expect(wrapper.find('.help-card_overlay').exists()).toBe(false)
  })

  it('toont "Ik wil helpen" knop wanneer vrijwilliger en status open', () => {
    mockAuth.isVolunteer = true
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    expect(wrapper.find('.help-card_accept').exists()).toBe(true)
  })

  it('toont geen "Ik wil helpen" knop wanneer niet vrijwilliger', () => {
    mockAuth.isVolunteer = false
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    expect(wrapper.find('.help-card_accept').exists()).toBe(false)
  })

  it('toont geen "Ik wil helpen" knop wanneer vrijwilliger maar status niet open', () => {
    mockAuth.isVolunteer = true
    const verzoek = { ...basisVerzoek, status: 'matched' as const }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.find('.help-card_accept').exists()).toBe(false)
  })

  it('toont de statusbadge "Gematcht" voor matched status', () => {
    const verzoek = { ...basisVerzoek, status: 'matched' as const }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.text()).toContain('Gematcht')
  })

  it('toont een fallback label voor een onbekende status', () => {
    const verzoek = { ...basisVerzoek, status: 'onbekend' as any }
    const wrapper = mount(HelpRequestCard, { props: { request: verzoek } })
    expect(wrapper.text()).toContain('onbekend')
  })

  it('emits view bij klik op de bekijken-knop', async () => {
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    await wrapper.find('.link-btn').trigger('click')
    expect(wrapper.emitted('view')?.[0]).toEqual([1])
  })

  it('emits accept bij klik op "Ik wil helpen"', async () => {
    mockAuth.isVolunteer = true
    const wrapper = mount(HelpRequestCard, { props: { request: basisVerzoek } })
    await wrapper.find('.help-card_accept').trigger('click')
    expect(wrapper.emitted('accept')?.[0]).toEqual([1])
  })
})
