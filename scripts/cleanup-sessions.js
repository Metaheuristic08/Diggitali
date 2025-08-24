/**
 * Script de migración para limpiar sesiones duplicadas
 * 
 * Este script debe ejecutarse UNA VEZ para limpiar las sesiones duplicadas
 * que ya existen en la base de datos de Firebase.
 */

const { initializeApp } = require("firebase/app")
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc } = require("firebase/firestore")



const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Consolida sesiones duplicadas usando la misma lógica que el frontend
 */
function consolidateDuplicates(sessions) {
  if (sessions.length === 1) return sessions[0]

  console.log(`🔄 Consolidando ${sessions.length} sesiones duplicadas...`)
  
  // Mostrar detalles de cada sesión
  sessions.forEach((session, index) => {
    const answered = session.answers?.filter(a => a !== null && a !== undefined).length || 0
    const status = session.endTime ? 'completada' : answered > 0 ? 'en progreso' : 'inicial'
    console.log(`   Sesión ${index + 1}: ${session.id || 'SIN ID'} - ${status} (${answered} respuestas) ${session.score ? '- ' + session.score + '%' : ''}`)
  })

  // Separar por tipo
  const completedSessions = sessions.filter(s => s.endTime)
  const inProgressSessions = sessions.filter(s => !s.endTime && s.answers?.some(a => a !== null))
  const initialSessions = sessions.filter(s => !s.endTime && !s.answers?.some(a => a !== null))

  console.log(`   📊 Completadas: ${completedSessions.length}, En progreso: ${inProgressSessions.length}, Iniciales: ${initialSessions.length}`)

  // Prioridad 1: Sesiones completadas (la más reciente)
  if (completedSessions.length > 0) {
    const latest = completedSessions.sort((a, b) => {
      const timeA = a.endTime?.toDate?.() || a.endTime || new Date(a.startTime)
      const timeB = b.endTime?.toDate?.() || b.endTime || new Date(b.startTime)
      return new Date(timeB).getTime() - new Date(timeA).getTime()
    })[0]
    
    console.log(`✅ Manteniendo sesión completada: ${latest.id.substring(0, 8)}...`)
    return latest
  }

  // Prioridad 2: Sesiones en progreso (la que tiene más respuestas)
  if (inProgressSessions.length > 0) {
    const bestInProgress = inProgressSessions.sort((a, b) => {
      const answersA = a.answers?.filter(ans => ans !== null && ans !== undefined).length || 0
      const answersB = b.answers?.filter(ans => ans !== null && ans !== undefined).length || 0
      
      if (answersA !== answersB) {
        return answersB - answersA
      }
      
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    })[0]
    
    const answeredCount = bestInProgress.answers?.filter(ans => ans !== null && ans !== undefined).length || 0
    console.log(`🔄 Manteniendo sesión en progreso: ${bestInProgress.id.substring(0, 8)}... (${answeredCount} respuestas)`)
    return bestInProgress
  }

  // Prioridad 3: Sesiones iniciales (la más reciente)
  const latest = initialSessions.sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )[0] || sessions[0]
  
  console.log(`📅 Manteniendo sesión inicial: ${latest.id.substring(0, 8)}...`)
  return latest
}

/**
 * Encuentra y limpia sesiones duplicadas
 */
async function cleanDuplicateSessions() {
  console.log("🧹 Iniciando limpieza de sesiones duplicadas...")
  
  try {
    // Obtener todas las sesiones
    const allSessionsQuery = query(collection(db, "testSessions"))
    const allSessionsSnapshot = await getDocs(allSessionsQuery)
    
    console.log(`📊 Total de sesiones encontradas: ${allSessionsSnapshot.size}`)
    
    // Agrupar por usuario/competencia/nivel
    const sessionGroups = {}
    
    allSessionsSnapshot.forEach(docSnap => {
      const data = docSnap.data()
      const session = {
        id: docSnap.id,
        ...data
      }
      
      const key = `${session.userId}:${session.competence}:${session.level}`
      if (!sessionGroups[key]) {
        sessionGroups[key] = []
      }
      sessionGroups[key].push(session)
    })
    
    // Procesar grupos con duplicados
    let totalDeleted = 0
    let groupsProcessed = 0
    
    for (const [key, sessions] of Object.entries(sessionGroups)) {
      if (sessions.length > 1) {
        const [userId, competence, level] = key.split(':')
        console.log(`\n🔍 Procesando ${sessions.length} sesiones duplicadas para ${competence}/${level}`)
        
        // Consolidar y mantener la mejor sesión
        const bestSession = consolidateDuplicates(sessions)
        console.log(`📍 Sesión elegida como mejor: ${bestSession.id.substring(0, 8)}...`)
        
        const sessionsToDelete = sessions.filter(s => {
          const shouldDelete = s.id !== bestSession.id
          console.log(`   🔍 Sesión ${s.id} ${shouldDelete ? 'ELIMINAR' : 'MANTENER'} (vs mejor: ${bestSession.id})`)
          return shouldDelete
        })
        
        console.log(`🗑️ Sesiones a eliminar: ${sessionsToDelete.length}`)
        
        // Mostrar qué sesiones se van a eliminar
        sessionsToDelete.forEach((session, index) => {
          const answered = session.answers?.filter(a => a !== null && a !== undefined).length || 0
          const status = session.endTime ? 'completada' : answered > 0 ? 'en progreso' : 'inicial'
          console.log(`   ${index + 1}. ${session.id.substring(0, 8)}... - ${status} (${answered} respuestas)`)
        })
        
        // Eliminar sesiones duplicadas
        for (const session of sessionsToDelete) {
          try {
            console.log(`   🗑️ Eliminando sesión: ${session.id.substring(0, 8)}... (${session.endTime ? 'completada' : 'inicial'})`)
            await deleteDoc(doc(db, "testSessions", session.id))
            totalDeleted++
            console.log(`   ✅ Eliminada sesión ${session.id.substring(0, 8)}...`)
          } catch (error) {
            console.error(`   ❌ Error eliminando sesión ${session.id}:`, error)
          }
        }
        
        groupsProcessed++
      }
    }
    
    console.log("\n" + "=".repeat(50))
    console.log("📊 RESUMEN DE LIMPIEZA:")
    console.log(`✅ Grupos procesados: ${groupsProcessed}`)
    console.log(`🗑️ Sesiones eliminadas: ${totalDeleted}`)
    console.log(`📊 Sesiones restantes: ${allSessionsSnapshot.size - totalDeleted}`)
    console.log("=".repeat(50))
    
    if (totalDeleted > 0) {
      console.log("🎉 ¡Limpieza completada exitosamente!")
    } else {
      console.log("✨ No se encontraron sesiones duplicadas para limpiar")
    }
    
  } catch (error) {
    console.error("💥 Error durante la limpieza:", error)
    throw error
  }
}

/**
 * Genera reporte de sesiones duplicadas sin eliminar nada
 */
async function reportDuplicates() {
  console.log("📋 Generando reporte de sesiones duplicadas...")
  
  try {
    const allSessionsQuery = query(collection(db, "testSessions"))
    const allSessionsSnapshot = await getDocs(allSessionsQuery)
    
    // Agrupar por usuario/competencia/nivel
    const sessionGroups = {}
    
    allSessionsSnapshot.forEach(docSnap => {
      const data = docSnap.data()
      const session = {
        id: docSnap.id,
        ...data
      }
      
      const key = `${session.userId}:${session.competence}:${session.level}`
      if (!sessionGroups[key]) {
        sessionGroups[key] = []
      }
      sessionGroups[key].push(session)
    })
    
    // Mostrar reporte
    const duplicateGroups = Object.entries(sessionGroups).filter(([, sessions]) => sessions.length > 1)
    const totalDuplicates = duplicateGroups.reduce((acc, [, sessions]) => acc + sessions.length - 1, 0)
    
    console.log(`\n📊 REPORTE DE DUPLICADOS:`)
    console.log(`Total de sesiones: ${allSessionsSnapshot.size}`)
    console.log(`Grupos con duplicados: ${duplicateGroups.length}`)
    console.log(`Sesiones duplicadas: ${totalDuplicates}`)
    console.log(`Sesiones únicas: ${allSessionsSnapshot.size - totalDuplicates}`)
    
    if (duplicateGroups.length > 0) {
      console.log("\n📋 DETALLES DE DUPLICADOS:")
      duplicateGroups.forEach(([key, sessions]) => {
        const [userId, competence, level] = key.split(':')
        console.log(`\n  ${competence}/${level} (Usuario: ${userId.substring(0, 8)}...):`)
        sessions.forEach((session, index) => {
          const answered = session.answers?.filter(a => a !== null && a !== undefined).length || 0
          const status = session.endTime ? 'completada' : answered > 0 ? 'en progreso' : 'inicial'
          const score = session.score ? ` - ${session.score}%` : ''
          console.log(`    ${index + 1}. ${session.id.substring(0, 8)}... - ${status} (${answered} respuestas)${score}`)
        })
      })
    }
    
  } catch (error) {
    console.error("💥 Error generando reporte:", error)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'report'
  
  console.log("🚀 Script de limpieza de sesiones duplicadas")
  console.log("📊 Proyecto:", firebaseConfig.projectId)
  console.log("⏰ Fecha:", new Date().toLocaleString('es-ES'))
  console.log("=".repeat(50))
  
  try {
    if (command === 'clean') {
      console.log("⚠️  MODO LIMPIEZA: Se eliminarán sesiones duplicadas")
      console.log("⏳ Iniciando en 3 segundos...")
      await new Promise(resolve => setTimeout(resolve, 3000))
      await cleanDuplicateSessions()
    } else {
      console.log("📋 MODO REPORTE: Solo se mostrarán duplicados")
      await reportDuplicates()
      console.log("\n💡 Para ejecutar limpieza: node cleanup-sessions.js clean")
    }
  } catch (error) {
    console.error("💥 Error fatal:", error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🏁 Script finalizado")
      process.exit(0)
    })
    .catch(error => {
      console.error("\n💥 Error fatal:", error)
      process.exit(1)
    })
}

module.exports = { cleanDuplicateSessions, reportDuplicates }
