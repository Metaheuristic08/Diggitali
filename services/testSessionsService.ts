import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit } from "firebase/firestore"
import type { TestSession, Question } from "@/types"

/**
 * DEPRECADO: Reemplazado por simpleSessionService.ts
 * Se mantiene temporalmente por compatibilidad. Evitar usar en nuevo código.
 */

// ⚠️ LOGS TEMPORALES PARA DIAGNÓSTICO DE DUPLICIDAD
let firestoreCallCounter = 0
const pendingRequests = new Map<string, Promise<any>>()

function logFirestoreCall(operation: string, details: string) {
  firestoreCallCounter++
  // Log compacto sin trace para evitar ruido
  console.log(`[DEPRECATED testSessionsService #${firestoreCallCounter}] ${operation}: ${details}`)
}

export interface SessionSearchResult {
  session: TestSession | null
  docId: string | null
  isDuplicate: boolean
  duplicateCount: number
}

/**
 * Busca sesiones existentes para una combinación usuario/competencia/nivel
 * Devuelve la mejor sesión disponible con información sobre duplicados
 */
export async function findExistingSession(
  userId: string, 
  competence: string, 
  level: string
): Promise<SessionSearchResult> {
  const requestKey = `findSession::${userId}::${competence}::${level}`
  
  // ⚠️ CACHE DE PROMESAS - Evitar llamadas concurrentes duplicadas
  if (pendingRequests.has(requestKey)) {
    logFirestoreCall("CACHE HIT findExistingSession", requestKey)
    return pendingRequests.get(requestKey)!
  }
  
  logFirestoreCall("findExistingSession", requestKey)
  
  if (!db) {
    throw new Error("Firebase no está inicializado")
  }

  const promise = (async () => {
    try {
      // Buscar todas las sesiones para esta combinación
      const q = query(
        collection(db, "testSessions"),
        where("userId", "==", userId),
        where("competence", "==", competence),
        where("level", "==", level),
        orderBy("startTime", "desc")
      )

      const snapshot = await getDocs(q)
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data() as TestSession
      }))

      console.log(`🔍 Sesiones encontradas para ${competence}/${level}:`, sessions.length)

      if (sessions.length === 0) {
        return {
          session: null,
          docId: null,
          isDuplicate: false,
          duplicateCount: 0
        }
      }

      // Consolidar sesiones usando lógica priorizada
      const bestSession = consolidateSessions(sessions)
      
      return {
        session: { ...bestSession.data, id: bestSession.id },
        docId: bestSession.id,
        isDuplicate: sessions.length > 1,
        duplicateCount: sessions.length
      }

    } catch (error) {
      console.error("Error buscando sesiones existentes:", error)
      throw error
    } finally {
      // Limpiar cache después de un tiempo
      setTimeout(() => pendingRequests.delete(requestKey), 5000)
    }
  })()
  
  pendingRequests.set(requestKey, promise)
  return promise
}

/**
 * Crea o reutiliza una sesión de test
 * Evita duplicados buscando sesiones existentes primero
 */
export async function createOrReuseSession(
  userId: string,
  competence: string,
  level: string,
  questions: Question[]
): Promise<TestSession> {
  const requestKey = `createOrReuse::${userId}::${competence}::${level}`
  
  // ⚠️ CACHE DE PROMESAS - Evitar llamadas concurrentes duplicadas
  if (pendingRequests.has(requestKey)) {
    logFirestoreCall("CACHE HIT createOrReuseSession", requestKey)
    return pendingRequests.get(requestKey)!
  }
  
  logFirestoreCall("createOrReuseSession", requestKey)
  
  if (!db) {
    throw new Error("Firebase no está inicializado")
  }

  const promise = (async () => {
    try {
      // Buscar sesiones existentes
      const searchResult = await findExistingSession(userId, competence, level)

      if (searchResult.session && searchResult.docId) {
        // Si encontramos una sesión existente
        if (searchResult.isDuplicate) {
          console.warn(`⚠️ Encontradas ${searchResult.duplicateCount} sesiones duplicadas para ${competence}/${level}`)
        }

        const existingSession = searchResult.session
        
        // Si la sesión ya está completada, crear una nueva (para reintentos)
        if (existingSession.endTime) {
          console.log("📝 Sesión anterior completada, creando nueva sesión...")
          return await createNewSession(userId, competence, level, questions)
        }

        // Si la sesión está en progreso, reutilizarla
        console.log("♻️ Reutilizando sesión existente en progreso")
        return {
          ...existingSession,
          questions: questions, // Actualizar preguntas por si han cambiado
          id: searchResult.docId
        }
      }

      // No hay sesiones existentes, crear una nueva
      console.log("🆕 Creando nueva sesión")
      return await createNewSession(userId, competence, level, questions)

    } catch (error) {
      console.error("Error creando/reutilizando sesión:", error)
      throw error
    } finally {
      // Limpiar cache después de un tiempo
      setTimeout(() => pendingRequests.delete(requestKey), 5000)
    }
  })()
  
  pendingRequests.set(requestKey, promise)
  return promise
}

/**
 * Crea una nueva sesión de test
 */
async function createNewSession(
  userId: string,
  competence: string,
  level: string,
  questions: Question[]
): Promise<TestSession> {
  logFirestoreCall("createNewSession (addDoc)", `${userId}::${competence}::${level}`)
  
  if (!db) {
    throw new Error("Firebase no está inicializado")
  }

  const session: TestSession = {
    id: "",
    userId,
    competence,
    level,
    questions,
    answers: new Array(questions.length).fill(null),
    currentQuestionIndex: 0,
    startTime: new Date(),
    score: 0,
    passed: false,
  }

  try {
    const docRef = await addDoc(collection(db, "testSessions"), session)
    return { ...session, id: docRef.id }
  } catch (error) {
    console.error("Error creando nueva sesión:", error)
    throw error
  }
}

/**
 * Consolida múltiples sesiones priorizando por:
 * 1. Sesiones completadas (con endTime)
 * 2. Sesiones en progreso con más respuestas
 * 3. Sesiones más recientes
 */
function consolidateSessions(sessions: Array<{ id: string; data: TestSession }>): { id: string; data: TestSession } {
  if (sessions.length === 0) {
    throw new Error("No hay sesiones para consolidar")
  }

  if (sessions.length === 1) {
    return sessions[0]
  }

  console.log("🔄 Consolidando sesiones...")

  // Separar sesiones completadas de las en progreso
  const completedSessions = sessions.filter(s => s.data.endTime)
  const inProgressSessions = sessions.filter(s => !s.data.endTime)

  // Prioridad 1: Sesiones completadas (tomar la más reciente)
  if (completedSessions.length > 0) {
    const latest = completedSessions.sort((a, b) => 
      new Date(b.data.startTime).getTime() - new Date(a.data.startTime).getTime()
    )[0]
    
    console.log("✅ Usando sesión completada más reciente")
    return latest
  }

  // Prioridad 2: Sesiones en progreso (tomar la que tiene más respuestas)
  if (inProgressSessions.length > 0) {
    const bestInProgress = inProgressSessions.sort((a, b) => {
      const answersA = a.data.answers?.filter(ans => ans !== null && ans !== undefined).length || 0
      const answersB = b.data.answers?.filter(ans => ans !== null && ans !== undefined).length || 0
      
      if (answersA !== answersB) {
        return answersB - answersA // Más respuestas primero
      }
      
      // Si tienen las mismas respuestas, tomar la más reciente
      return new Date(b.data.startTime).getTime() - new Date(a.data.startTime).getTime()
    })[0]
    
    const answeredCount = bestInProgress.data.answers?.filter(ans => ans !== null && ans !== undefined).length || 0
    console.log(`🔄 Usando sesión en progreso con ${answeredCount} respuestas`)
    return bestInProgress
  }

  // Fallback: la sesión más reciente
  const latest = sessions.sort((a, b) => 
    new Date(b.data.startTime).getTime() - new Date(a.data.startTime).getTime()
  )[0]
  
  console.log("📅 Usando sesión más reciente")
  return latest
}

/**
 * Actualiza una sesión existente
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<TestSession>
): Promise<void> {
  if (!db) {
    throw new Error("Firebase no está inicializado")
  }

  try {
    await updateDoc(doc(db, "testSessions", sessionId), updates)
  } catch (error) {
    console.error("Error actualizando sesión:", error)
    throw error
  }
}

/**
 * Obtiene estadísticas de sesiones duplicadas para debugging
 */
export async function getSessionStats(userId: string): Promise<{
  totalSessions: number
  duplicateGroups: Array<{
    competence: string
    level: string
    count: number
  }>
}> {
  if (!db) {
    throw new Error("Firebase no está inicializado")
  }

  try {
    const q = query(
      collection(db, "testSessions"),
      where("userId", "==", userId)
    )

    const snapshot = await getDocs(q)
    const sessions = snapshot.docs.map(doc => doc.data() as TestSession)

    // Agrupar por competencia/nivel
    const groups: Record<string, number> = {}
    sessions.forEach(session => {
      const key = `${session.competence}/${session.level}`
      groups[key] = (groups[key] || 0) + 1
    })

    const duplicateGroups = Object.entries(groups)
      .filter(([, count]) => count > 1)
      .map(([key, count]) => {
        const [competence, level] = key.split('/')
        return { competence, level, count }
      })

    return {
      totalSessions: sessions.length,
      duplicateGroups
    }
  } catch (error) {
    console.error("Error obteniendo estadísticas de sesiones:", error)
    throw error
  }
}
