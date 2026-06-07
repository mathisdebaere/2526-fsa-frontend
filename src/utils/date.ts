const locale = 'nl-BE'

// 11 augustus 2004
export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

// woensdag 11 augustus 2004
export function formatDateFull(d: string): string {
  return new Date(d).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// wo 11/08/2004
export function formatDateWeekday(d: string): string {
  return new Date(d).toLocaleDateString(locale, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// 11/08/2004
export function formatDateCompact(d: string): string {
  return new Date(d).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// 11 augustus
export function formatDateShort(d: string): string {
  return new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'long' })
}

// 11 aug, 14:30
export function formatDateTimeShort(iso: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
