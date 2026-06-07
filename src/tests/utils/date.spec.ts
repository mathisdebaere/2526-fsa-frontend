import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateFull,
  formatDateWeekday,
  formatDateCompact,
  formatDateShort,
} from '@/utils/date'

const DATUM = '2004-08-11T12:00:00.000Z'

describe('datumhulpfuncties', () => {
  it('formatDate formateert naar dag maandnaam jaar', () => {
    const result = formatDate(DATUM)
    expect(result).toContain('augustus')
    expect(result).toContain('2004')
    expect(result).toContain('11')
  })

  it('formatDateFull formateert met volledige weekdag en maandnaam', () => {
    const result = formatDateFull(DATUM)
    expect(result).toContain('woensdag')
    expect(result).toContain('augustus')
    expect(result).toContain('2004')
  })

  it('formatDateWeekday formateert met verkorte weekdag en numerieke datum', () => {
    const result = formatDateWeekday(DATUM)
    expect(result).toContain('11')
    expect(result).toContain('08')
    expect(result).toContain('2004')
  })

  it('formatDateCompact formateert naar DD/MM/YYYY', () => {
    expect(formatDateCompact(DATUM)).toBe('11/08/2004')
  })

  it('formatDateShort formateert naar dag en maandnaam zonder jaar', () => {
    const result = formatDateShort(DATUM)
    expect(result).toContain('augustus')
    expect(result).toContain('11')
    expect(result).not.toContain('2004')
  })
})
