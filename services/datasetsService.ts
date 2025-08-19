export interface DatasetMeta {
  id?: string
  competence: string // e.g., '1.3'
  level: 'Avanzado' | 'Básico' | 'Intermedio'
  exercise: string // e.g., 'ej1'
  filename: string
  mimeType: string
  url: string
  createdAt?: any
}

export async function uploadDataset(
  file: File,
  meta: { competence: string; level: DatasetMeta['level']; exercise: string }
): Promise<DatasetMeta> {
  // Construir ruta de subida local según los endpoints implementados (solo ej1 actualmente)
  const comp = encodeURIComponent(meta.competence)
  const lvl = encodeURIComponent(meta.level.toLowerCase())
  const ex = encodeURIComponent(meta.exercise)
  const endpoint = `/api/datasets/${comp}/${lvl}/${ex}/upload`

  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(endpoint, { method: 'POST', body: fd })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Fallo al subir dataset: ${res.status} ${txt}`)
  }
  const json = await res.json()
  return {
    competence: meta.competence,
    level: meta.level,
    exercise: meta.exercise,
    filename: file.name,
    mimeType: file.type || inferMime(file.name),
    url: json.url as string,
    createdAt: new Date(),
  }
}

function inferMime(name: string): string {
  if (name.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (name.endsWith('.csv')) return 'text/csv'
  return 'application/octet-stream'
}
