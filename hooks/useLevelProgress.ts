"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, query, where, onSnapshot, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import type { Competence } from "@/types"
import { useCompetences } from "./useCompetences"

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
  isPreviousCompetenceCompleted: (competenceId: string, level: LevelName) => boolean
}

export function useLevelProgress(): UseLevelProgressResult {
  const { user } = useAuth()
  const { competences, loading: loadingCompetences } = useCompetences()
  const [loading, setLoading] = useState(true)
  const [perCompetenceLevel, setPerCompetenceLevel] = useState<CompetenceLevelMap>({})

  // Efecto para escuchar cambios en las sesiones del usuario
  useEffect(() => {
    if (!user?.uid || !db || loadingCompetences) {
      setLoading(false)
      return
    }

    let unsubscribe: Unsubscribe | null = null

    // Configurar listener en tiempo real para las sesiones del usuario
    const q = query(collection(db, "testSessions"), where("userId", "==", user.uid))
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      // Inicializar estructura
      const initStatus = (): LevelStatus => ({ completed: false, inProgress: false, answered: 0, total: 3, progressPct: 0 })
      const map: CompetenceLevelMap = {} as CompetenceLevelMap
      for (const c of competences) {
        map[c.id] = {
          "Básico": initStatus(),
          "Intermedio": initStatus(),
          "Avanzado": initStatus(),
        }
      }

      // Agrupar sesiones por competencia/nivel para consolidación
      const sessionGroups: Record<string, Array<{doc: any, data: any}>> = {}
      
      snapshot.forEach((docSnap) => {
        const data: any = docSnap.data()
        const cid: string | undefined = data?.competence
        if (!cid || !map[cid]) return

        const lvlRaw: string = data?.level || "Básico"
        const levelNorm = normalizeLevel(lvlRaw)
        if (!levelNorm) return

        const key = `${cid}:${levelNorm}`
        if (!sessionGroups[key]) {
          sessionGroups[key] = []
        }
        sessionGroups[key].push({ doc: docSnap, data })
      })

      // Consolidar cada grupo de sesiones
      Object.entries(sessionGroups).forEach(([key, sessions]) => {
        const [cid, levelNorm] = key.split(':') as [string, LevelName]
        
        if (sessions.length > 1) {
          console.warn(`⚠️ Encontradas ${sessions.length} sesiones duplicadas para ${cid}/${levelNorm}`)
        }

        // Aplicar lógica de consolidación mejorada
        const consolidatedStatus = consolidateSessionGroup(sessions)
        map[cid][levelNorm] = consolidatedStatus
      })

      setPerCompetenceLevel(map)
      setLoading(false)
      
      // ✅ DEBUGGING MEJORADO: Log detallado de cada competencia
      const totalSessions = snapshot.size
      const completedLevels = Object.values(map).reduce((acc, comp) => {
        return acc + Object.values(comp).filter(level => level.completed).length
      }, 0)
      const inProgressLevels = Object.values(map).reduce((acc, comp) => {
        return acc + Object.values(comp).filter(level => level.inProgress).length
      }, 0)
      
      console.log(`📊 DATOS FIREBASE: ${totalSessions} sesiones → ${completedLevels} completados, ${inProgressLevels} en progreso`)
      
      if (totalSessions > 0) {
        const sessionDetails = snapshot.docs.map(doc => {
          const data = doc.data()
          return `${data.competence || 'N/A'}/${data.level || 'N/A'} (${data.endTime ? 'terminada' : 'en curso'})`
        })
        console.log(`📋 Sesiones encontradas:`, sessionDetails)
        
        // ✅ NUEVO: Log del estado consolidado de cada competencia
        console.log(`📊 ESTADO CONSOLIDADO POR COMPETENCIA:`)
        Object.entries(map).forEach(([competenceId, levels]) => {
          Object.entries(levels).forEach(([level, status]) => {
            if (status.completed || status.inProgress || status.answered > 0) {
              console.log(`  ${competenceId}/${level}: ${status.completed ? '✅ COMPLETADO' : status.inProgress ? '🔄 EN PROGRESO' : '⚪ INICIAL'} (${status.answered}/${status.total}, ${status.progressPct}%)`)
            }
          })
        })
      }
    }, (error) => {
      console.error("Error en listener de testSessions:", error)
      setLoading(false)
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user?.uid, competences, loadingCompetences])

  // Mapa de dimensiones por competencia
  const dimensionByCompetence = useMemo(() => {
    const out: Record<string, string> = {}
    for (const c of competences) out[c.id] = c.dimension
    return out
  }, [competences])

  // Estadísticas por área y nivel
  const areaStats = useMemo(() => {
    const stats: AreaStatsByLevel = {}
    for (const c of competences) {
      const dim = c.dimension
      if (!stats[dim]) stats[dim] = { "Básico": { completedCount: 0, totalCount: 0 }, "Intermedio": { completedCount: 0, totalCount: 0 }, "Avanzado": { completedCount: 0, totalCount: 0 } }
      
      for (const lvl of LEVELS) {
        stats[dim][lvl].totalCount += 1
        if (perCompetenceLevel[c.id]?.[lvl]?.completed) stats[dim][lvl].completedCount += 1
      }
    }
    return stats
  }, [competences, perCompetenceLevel])

  // Función para determinar el nivel actual de un área
  const currentAreaLevel = (dimension: string): LevelName => {
    const areaCompetences = competences.filter(c => c.dimension === dimension)
    if (!areaCompetences.length) return "Básico"
    
    const basicCompleted = areaCompetences.every(c =>
      perCompetenceLevel[c.id]?.["Básico"]?.completed === true
    )
    
    const interCompleted = areaCompetences.every(c => 
      perCompetenceLevel[c.id]?.["Intermedio"]?.completed === true
    )
    
    if (interCompleted) return "Avanzado"
    if (basicCompleted) return "Intermedio"
    return "Básico"
  }

  // Función para sugerir la siguiente competencia a intentar
  const nextCompetenceToAttempt = (dimension: string, level: LevelName): string | null => {
    const areaCompetences = competences.filter(c => c.dimension === dimension)
    if (!areaCompetences.length) return null
    
    // ✅ CAMBIO: Orden estrictamente progresivo
    const sortedCompetences = areaCompetences.sort((a, b) => a.code.localeCompare(b.code))
    
    // Buscar la primera competencia no completada en orden estricto
    const firstIncomplete = sortedCompetences.find(c => 
      !perCompetenceLevel[c.id]?.[level]?.completed
    )
    
    return firstIncomplete?.id || null
  }

  // ✅ NUEVA: Función para verificar si la competencia anterior está completada
  const isPreviousCompetenceCompleted = (competenceId: string, level: LevelName): boolean => {
    const currentCompetence = competences.find(c => c.id === competenceId)
    if (!currentCompetence) return false
    
    const areaCompetences = competences
      .filter(c => c.dimension === currentCompetence.dimension)
      .sort((a, b) => a.code.localeCompare(b.code))
    
    const currentIndex = areaCompetences.findIndex(c => c.id === competenceId)
    
    // Si es la primera competencia del área, está habilitada
    if (currentIndex === 0) return true
    
    // Verificar que todas las competencias anteriores estén completadas
    for (let i = 0; i < currentIndex; i++) {
      const prevCompetence = areaCompetences[i]
      const isCompleted = perCompetenceLevel[prevCompetence.id]?.[level]?.completed
      if (!isCompleted) return false
    }
    
    return true
  }

  return {
    loading: loading || loadingCompetences,
    competences,
    dimensionByCompetence,
    perCompetenceLevel,
    areaStats,
    currentAreaLevel,
    nextCompetenceToAttempt,
    isPreviousCompetenceCompleted,
  }
}

function normalizeLevel(raw: string): LevelName | null {
  const normalized = raw.toLowerCase()
  if (normalized.includes("básico") || normalized.includes("basico")) return "Básico"
  if (normalized.includes("intermedio")) return "Intermedio"
  if (normalized.includes("avanzado")) return "Avanzado"
  return null
}

/**
 * Consolida un grupo de sesiones duplicadas para la misma competencia/nivel
 * Aplica la siguiente priorización:
 * 1. Sesiones completadas (endTime definido y score = 100)
 * 2. Sesiones en progreso con mayor número de respuestas
 * 3. Sesiones más recientes
 */
function consolidateSessionGroup(sessions: Array<{doc: any, data: any}>): LevelStatus {
  const initStatus = (): LevelStatus => ({ completed: false, inProgress: false, answered: 0, total: 3, progressPct: 0 })
  
  if (sessions.length === 0) {
    return initStatus()
  }

  if (sessions.length === 1) {
    // Solo una sesión, procesarla directamente
    return processSessionData(sessions[0].data)
  }

  console.log(`🔄 Consolidando ${sessions.length} sesiones duplicadas...`)

  // Separar sesiones completadas de las en progreso
  const processedSessions = sessions.map(s => ({
    ...s,
    processed: processSessionData(s.data)
  }))

  const completedSessions = processedSessions.filter(s => s.processed.completed)
  const inProgressSessions = processedSessions.filter(s => s.processed.inProgress)
  const initialSessions = processedSessions.filter(s => !s.processed.completed && !s.processed.inProgress)

  // Prioridad 1: Sesiones completadas (tomar la más reciente)
  if (completedSessions.length > 0) {
    const latest = completedSessions.sort((a, b) => {
      const timeA = a.data.endTime || a.data.startTime
      const timeB = b.data.endTime || b.data.startTime
      return new Date(timeB).getTime() - new Date(timeA).getTime()
    })[0]
    
    console.log("✅ Usando sesión completada más reciente")
    return latest.processed
  }

  // Prioridad 2: Sesiones en progreso (la que tiene más respuestas)
  if (inProgressSessions.length > 0) {
    const bestInProgress = inProgressSessions.sort((a, b) => {
      // Primero por número de respuestas
      if (a.processed.answered !== b.processed.answered) {
        return b.processed.answered - a.processed.answered
      }
      // Si empatan, por más reciente
      return new Date(b.data.startTime).getTime() - new Date(a.data.startTime).getTime()
    })[0]
    
    console.log(`🔄 Usando sesión en progreso con ${bestInProgress.processed.answered} respuestas`)
    return bestInProgress.processed
  }

  // Prioridad 3: Sesiones iniciales (la más reciente)
  if (initialSessions.length > 0) {
    const latest = initialSessions.sort((a, b) => 
      new Date(b.data.startTime).getTime() - new Date(a.data.startTime).getTime()
    )[0]
    
    console.log("📅 Usando sesión inicial más reciente")
    return latest.processed
  }

  // Fallback
  return initStatus()
}

/**
 * Procesa los datos de una sesión individual y retorna el LevelStatus correspondiente
 */
function processSessionData(data: any): LevelStatus {
  const answers: Array<number | null> = Array.isArray(data?.answers) ? data.answers : []
  const answered = answers.filter(a => a !== null && a !== undefined).length
  const total = Math.max(3, answers.length || 3)
  const score: number = typeof data?.score === "number" ? data.score : Math.round((answered / total) * 100)
  const hasEndTime = typeof data?.endTime !== "undefined" && data?.endTime !== null
  // Nuevo: considerar flag 'passed' (>= 2/3 correctas) para marcar competencia completada aunque no sea perfecto
  const passed: boolean = data?.passed === true || score >= 66

  const completed = hasEndTime && (score === 100 || passed)
  // Si terminó pero no alcanzó el umbral de aprobado, aún mostramos el progreso como intento finalizado
  const inProgress = !hasEndTime && answered > 0

  if (completed) {
    return {
      completed: true,
      inProgress: false,
      answered, // conservar número real de respondidas
      total,
      progressPct: score === 100 ? 100 : Math.min(99, Math.max(score, Math.round((answered / total) * 100))) // evitar 100 si no perfecto
    }
  }

  if (inProgress) {
    return {
      completed: false,
      inProgress: true,
      answered,
      total,
      progressPct: Math.round((answered / total) * 100)
    }
  }

  // Caso sin actividad
  return {
    completed: false,
    inProgress: false,
    answered: 0,
    total,
    progressPct: 0
  }
}
