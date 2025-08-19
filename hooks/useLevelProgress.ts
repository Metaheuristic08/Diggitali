"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import type { Competence } from "@/types"
import { loadCompetences } from "@/services/questionsService"

type LevelName = "Básico" | "Intermedio" | "Avanzado"

const LEVELS: LevelName[] = ["Básico", "Intermedio", "Avanzado"]

export interface LevelStatus {
  completed: boolean // 3/3 correctas en ese nivel
  inProgress: boolean
  answered: number
  total: number
  progressPct: number
}

export interface CompetenceLevelMap {
  [competenceId: string]: {
    [level in LevelName]: LevelStatus
  }
}

interface AreaStatsByLevel {
  [dimension: string]: {
    [level in LevelName]: { completedCount: number; totalCount: number }
  }
}

export interface UseLevelProgressResult {
  loading: boolean
  competences: Competence[]
  dimensionByCompetence: Record<string, string>
  perCompetenceLevel: CompetenceLevelMap
  areaStats: AreaStatsByLevel
  currentAreaLevel: (dimension: string) => LevelName
  nextCompetenceToAttempt: (dimension: string, level: LevelName) => string | null
}

export function useLevelProgress(): UseLevelProgressResult {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [competences, setCompetences] = useState<Competence[]>([])
  const [perCompetenceLevel, setPerCompetenceLevel] = useState<CompetenceLevelMap>({} as CompetenceLevelMap)

  useEffect(() => {
    const run = async () => {
      if (!user?.uid || !db) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const comps = await loadCompetences()
        setCompetences(comps)

        // Traer todas las sesiones del usuario para derivar estados
        const q = query(collection(db, "testSessions"), where("userId", "==", user.uid))
        const snapshot = await getDocs(q)

        // Inicializar estructura
        const initStatus = (): LevelStatus => ({ completed: false, inProgress: false, answered: 0, total: 3, progressPct: 0 })
        const map: CompetenceLevelMap = {} as CompetenceLevelMap
        for (const c of comps) {
          map[c.id] = {
            "Básico": initStatus(),
            "Intermedio": initStatus(),
            "Avanzado": initStatus(),
          }
        }

        snapshot.forEach(docSnap => {
          const data: any = docSnap.data()
          const cid: string | undefined = data?.competence
          if (!cid || !map[cid]) return

          const lvlRaw: string = data?.level || "Básico"
          // Normalizar posibles valores previos "basico" → "Básico"
          const levelNorm = normalizeLevel(lvlRaw)
          if (!levelNorm) return

          const answers: Array<number | null> = Array.isArray(data?.answers) ? data.answers : []
          const answered = answers.filter(a => a !== null && a !== undefined).length
          const total = Math.max(3, answers.length || 3)
          const score: number = typeof data?.score === "number" ? data.score : Math.round((answered / total) * 100)
          const completed = typeof data?.endTime !== "undefined" && score === 100 // 3/3 correctas
          const inProgress = typeof data?.endTime === "undefined" || data?.endTime === null

          const current = map[cid][levelNorm]
          // Consolidar: si hay múltiples sesiones, preferimos completado; luego inProgress con mayor answered
          if (completed) {
            map[cid][levelNorm] = { completed: true, inProgress: false, answered: total, total, progressPct: 100 }
          } else if (inProgress && !current.completed) {
            if (answered >= (current.answered || 0)) {
              map[cid][levelNorm] = {
                completed: false,
                inProgress: true,
                answered,
                total,
                progressPct: Math.round((answered / total) * 100),
              }
            }
          } else if (!current.completed && !current.inProgress) {
            // Mantener inicial 0%
          }
        })

        setPerCompetenceLevel(map)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user?.uid])

  const dimensionByCompetence = useMemo(() => {
    const out: Record<string, string> = {}
    for (const c of competences) out[c.id] = c.dimension
    return out
  }, [competences])

  const areaStats: AreaStatsByLevel = useMemo(() => {
    const stats: AreaStatsByLevel = {}
    for (const c of competences) {
      const dim = c.dimension
      stats[dim] ||= { "Básico": { completedCount: 0, totalCount: 0 }, "Intermedio": { completedCount: 0, totalCount: 0 }, "Avanzado": { completedCount: 0, totalCount: 0 } }
      for (const lvl of LEVELS) {
        stats[dim][lvl].totalCount += 1
        if (perCompetenceLevel[c.id]?.[lvl]?.completed) stats[dim][lvl].completedCount += 1
      }
    }
    return stats
  }, [competences, perCompetenceLevel])

  const currentAreaLevel = (dimension: string): LevelName => {
    // El nivel actual de un área es el primer nivel cuyo total no está totalmente completado
    for (const lvl of LEVELS) {
      const s = areaStats[dimension]?.[lvl]
      if (!s || s.completedCount < s.totalCount) return lvl
    }
    return "Avanzado"
  }

  const nextCompetenceToAttempt = (dimension: string, level: LevelName): string | null => {
    // Buscar la primera competencia del área cuyo nivel no esté completado
    const comps = competences.filter(c => c.dimension === dimension).sort((a, b) => a.code.localeCompare(b.code))
    for (const c of comps) {
      if (!perCompetenceLevel[c.id]?.[level]?.completed) return c.id
    }
    return null
  }

  return { loading, competences, dimensionByCompetence, perCompetenceLevel, areaStats, currentAreaLevel, nextCompetenceToAttempt }
}

function normalizeLevel(raw: string): LevelName | null {
  const r = raw.toLowerCase()
  if (r.startsWith("b")) return "Básico"
  if (r.startsWith("i")) return "Intermedio"
  if (r.startsWith("a")) return "Avanzado"
  return null
}
