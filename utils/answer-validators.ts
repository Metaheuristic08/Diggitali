/**
 * Utilidades para validar respuestas de ejercicios.
 * - compareNumbers: maneja coma/punto y separadores de miles.
 * - compareText: ignora mayúsculas, acentos y espacios redundantes.
 * - compareDates: parsea formatos comunes y compara por ISO YYYY-MM-DD.
 */

export type ValidationResult = {
  ok: boolean
  normalizedUser?: string
  normalizedExpected?: string
  reason?: string
}

/** Normaliza números con coma/punto y separadores de miles */
export function toNumberFlexible(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  let s = String(value).trim()
  if (!s) return null

  // Elimina espacios y separadores de miles comunes
  s = s.replace(/\s+/g, '')

  // Detectar coma o punto como decimal: si ambos existen, el último símbolo suele ser decimal en notación humana
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')

  if (lastComma !== -1 && lastDot !== -1) {
    // Retirar el separador de miles (el que NO es el último)
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '') // puntos como miles
      s = s.replace(',', '.') // coma decimal
    } else {
      s = s.replace(/,/g, '') // comas como miles
      // el punto queda como decimal
    }
  } else if (lastComma !== -1) {
    // Solo coma: usar coma como decimal
    s = s.replace(/\./g, '') // por si hay puntos como miles
    s = s.replace(',', '.')
  } else {
    // Solo punto o ninguno: remover comas por si eran miles
    s = s.replace(/,/g, '')
  }

  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** Compara números con tolerancia opcional (epsilon) */
export function compareNumbers(user: string | number, expected: string | number, epsilon = 1e-9): ValidationResult {
  const a = toNumberFlexible(user)
  const b = toNumberFlexible(expected)
  if (a === null || b === null) return { ok: false, reason: 'Formato numérico inválido' }
  return { ok: Math.abs(a - b) <= epsilon, normalizedUser: String(a), normalizedExpected: String(b) }
}

/** Normaliza texto: minúsculas, sin acentos, colapsa espacios */
export function normalizeText(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function compareText(user: string, expected: string): ValidationResult {
  const u = normalizeText(user)
  const e = normalizeText(expected)
  return { ok: u === e, normalizedUser: u, normalizedExpected: e }
}

/** Normaliza fechas a ISO (YYYY-MM-DD) para comparación */
export function toISODateFlexible(value: string | Date): string | null {
  if (value instanceof Date && !isNaN(value.getTime())) {
    // Obtener fecha calendario sin hora
    const y = value.getUTCFullYear()
    const m = value.getUTCMonth() + 1
    const d = value.getUTCDate()
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  let s = String(value).trim()
  if (!s) return null

  // Reemplazar distintos separadores por '-'
  s = s.replace(/[\/.]/g, '-')

  // Patrones comunes: YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY
  const parts = s.split('-').map((p) => p.padStart(2, '0'))
  if (parts.length !== 3) return null

  const [a, b, c] = parts

  const tryBuild = (y: string, m: string, d: string): string | null => {
    const yy = Number(y)
    const mm = Number(m)
    const dd = Number(d)
    if (!Number.isFinite(yy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null
    const dt = new Date(Date.UTC(yy, mm - 1, dd))
    if (dt.getUTCFullYear() !== yy || dt.getUTCMonth() !== mm - 1 || dt.getUTCDate() !== dd) return null
    const iso = `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
    return iso
  }

  // Heurística: si la primera parte tiene 4 dígitos, tomarla como año
  if (/^\d{4}$/.test(a)) {
    return tryBuild(a, b, c)
  }
  // Si la última parte tiene 4 dígitos, probar D-M-YYYY y M-D-YYYY
  if (/^\d{4}$/.test(c)) {
    // Intento 1: DD-MM-YYYY
    const dmy = tryBuild(c, b, a)
    if (dmy) return dmy
    // Intento 2: MM-DD-YYYY
    const mdy = tryBuild(c, a, b)
    if (mdy) return mdy
  }
  return null
}

export function compareDates(user: string | Date, expected: string | Date): ValidationResult {
  const u = toISODateFlexible(user)
  const e = toISODateFlexible(expected)
  if (!u || !e) return { ok: false, reason: 'Formato de fecha inválido' }
  return { ok: u === e, normalizedUser: u, normalizedExpected: e }
}
