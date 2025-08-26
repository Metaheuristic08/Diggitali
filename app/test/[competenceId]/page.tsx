"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Question, TestSession } from "@/types"
import TestInterface from "@/components/TestInterface"
import { useToast } from "@/hooks/use-toast"

import { saveUserResult } from "@/utils/results-manager"
import { loadQuestionsByCompetence, updateQuestionStats, loadCompetences } from "@/services/questionsService"
import { createOrReuseSession, updateSession } from "@/services/testSessionsService"

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [questions, setQuestions] = useState<Question[]>([])
  const [testSession, setTestSession] = useState<TestSession | null>(null)
  const [loading, setLoading] = useState(true)

  // ⚠️ GUARD PARA PREVENIR EJECUCIONES MÚLTIPLES
  const loadQuestionsRan = useRef(false)

  
  

  useEffect(() => {
    // ⚠️ GUARD: Prevenir ejecuciones múltiples
    if (loadQuestionsRan.current) {
      console.log("⚠️ useEffect ya ejecutado previamente, saltando...")
      return
    }
    
    if (!user || !userData) {
      router.push("/")
      return
    }

    
    const competenceId = params.competenceId as string
    if (userData.completedCompetences.includes(competenceId)) {
      console.log(`Usuario ya completó la competencia: ${competenceId}. Redirigiendo a resultados.`)
      
      // Limpiar sessionStorage para evitar mostrar datos incorrectos
      try {
        sessionStorage.removeItem('testResultData')
      } catch (error) {
        console.error('Error limpiando sessionStorage:', error)
      }
      
      router.push(`/test/${competenceId}/results?score=100&passed=true&correct=3&completed=true`)
      return
    }

    // Marcar como ejecutado ANTES de la llamada async
    loadQuestionsRan.current = true
    loadQuestions()
  }, [user, userData, params.competenceId, router])

  const loadQuestions = async () => {
    try {
      const competenceId = params.competenceId as string
      const levelParam = (searchParams.get("level") || "basico").toLowerCase()
      const levelName = levelParam.startsWith("b") ? "Básico" : levelParam.startsWith("i") ? "Intermedio" : "Avanzado"

      if (!db) {
        throw new Error("Firebase no está inicializado. Por favor, comprueba tu conexión a Internet.")
      }
      
      console.log(`🔄 Cargando/creando sesión para competencia: ${competenceId}, nivel: ${levelParam}`)
      
      const loadedQuestions = await loadQuestionsByCompetence(competenceId, levelName, 3)
      
      if (loadedQuestions.length < 3) {
        throw new Error(`No hay suficientes preguntas para la competencia ${competenceId}`)
      }
      
      setQuestions(loadedQuestions)
      
      // ✅ USAR EL NUEVO SERVICIO EN LUGAR DE CREAR SESIONES DUPLICADAS
      const session = await createOrReuseSession(
        user!.uid,
        competenceId,
        levelParam,
        loadedQuestions
      )
      
      console.log(`✅ Sesión obtenida: ${session.id ? (session.answers?.some(a => a !== null) ? 'existente en progreso' : 'existente inicial') : 'nueva'}`)
      setTestSession(session)
    } catch (error) {
      console.error("Error loading questions:", error)
      toast({
        title: "Error al cargar preguntas",
        description: error instanceof Error ? error.message : "No se pudieron cargar las preguntas. Verifica que hay suficientes preguntas en la base de datos.",
        variant: "destructive",
      })
      
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async (answerIndex: number, questionIndex: number) => {
    if (!testSession) return

    
    const currentQuestion = testSession.questions[questionIndex]
    const isCorrect = answerIndex === currentQuestion.correctAnswerIndex
    

    const updatedAnswers = [...testSession.answers]
    updatedAnswers[questionIndex] = answerIndex

    const updatedSession = {
      ...testSession,
      answers: updatedAnswers,
    }

    setTestSession(updatedSession)

    // ✅ USAR EL NUEVO SERVICIO PARA ACTUALIZAR
    try {
      if (updatedSession.id) {
        await updateSession(updatedSession.id, {
          answers: updatedSession.answers,
          currentQuestionIndex: questionIndex,
        })
      }
    } catch (e) {
      console.error("No se pudo actualizar el progreso de la sesión:", e)
    }
  }

  const handleTestComplete = async (finalSession: TestSession) => {
    try {
      
      let correctAnswers = 0

      
      await Promise.all(finalSession.questions.map(async (question, index) => {
        const userAnswer = finalSession.answers[index]
        const wasCorrect = userAnswer === question.correctAnswerIndex
        
        console.log(`Pregunta ${index + 1}: ${question.title}`)
        console.log(`  Usuario respondió: ${userAnswer !== null ? `Opción ${userAnswer + 1} (índice ${userAnswer}) - "${question.options[userAnswer]}"` : "No respondió"}`)
        console.log(`  Respuesta correcta: Opción ${question.correctAnswerIndex + 1} (índice ${question.correctAnswerIndex}) - "${question.options[question.correctAnswerIndex]}"`)
        console.log(`  ¿Correcta?: ${wasCorrect ? "SÍ" : "NO"}`)
        console.log(`  🔍 DEBUG: userAnswer=${userAnswer}, correctAnswerIndex=${question.correctAnswerIndex}, comparison=${userAnswer} === ${question.correctAnswerIndex} = ${wasCorrect}`)
        console.log("---")
        
        if (wasCorrect) {
          correctAnswers++
          console.log(`✅ Respuesta ${index + 1} marcada como correcta. Total correctas: ${correctAnswers}`)
        } else {
          console.log(`❌ Respuesta ${index + 1} marcada como incorrecta.`)
        }
        
        
        await updateQuestionStats(question.id, wasCorrect)
      }))

  const score = Math.round((correctAnswers / finalSession.questions.length) * 100)
  const passed = correctAnswers >= 2 

      const completedSession = {
        ...finalSession,
        endTime: new Date(),
        score,
        passed,
      }

      // ✅ USAR EL NUEVO SERVICIO PARA ACTUALIZAR (NO CREAR NUEVA SESIÓN)
      if (db) {
        try {
          if (finalSession.id) {
            await updateSession(finalSession.id, {
              endTime: completedSession.endTime,
              score: completedSession.score,
              passed: completedSession.passed,
              answers: completedSession.answers,
            })
          } else {
            // Solo si no hay ID (caso excepcional), usar el servicio para crear
            console.warn("⚠️ Sesión sin ID, esto no debería pasar con el nuevo servicio")
            // En caso extremo, crear una nueva sesión completada
            await addDoc(collection(db, "testSessions"), completedSession)
          }
        } catch (error) {
          console.error("Error saving test session:", error)
        }
      }

      
      try {
        await saveUserResult(completedSession)
      } catch (error) {
        console.error("Error saving user result:", error)
      }

      
  if (passed && userData && db) {
        try {
          const updatedCompetences = [...userData.completedCompetences]
          if (!updatedCompetences.includes(finalSession.competence)) {
            updatedCompetences.push(finalSession.competence)
          }

          await updateDoc(doc(db, "users", user!.uid), {
            completedCompetences: updatedCompetences,
            
            
            
            
            LadicoScore: userData.LadicoScore + (passed ? 10 : 0),
          })
        } catch (error) {
          console.error("Error updating user progress:", error)
        }
      }

      
      // Decidir siguiente paso según progreso del área y nivel actual
      const comps = await loadCompetences()
      const currentComp = comps.find(c => c.id === (params.competenceId as string))
      const dimension = currentComp?.dimension || ""
      const levelParam = (searchParams.get("level") || "basico").toLowerCase()

      // Lista ordenada de competencias del área
      const areaCompetences = comps.filter(c => c.dimension === dimension).sort((a, b) => a.code.localeCompare(b.code))

      // Chequear completadas (3/3 correctas) para el nivel
      let allCompletedAtLevel = true
      let nextCompetenceId: string | null = null
      for (const c of areaCompetences) {
        const qs = await getDocs(query(collection(db!, "testSessions"), where("userId", "==", user!.uid), where("competence", "==", c.id), where("level", "==", levelParam)))
        const hasPerfect = qs.docs.some(d => (d.data() as any)?.score === 100)
        if (!hasPerfect) {
          allCompletedAtLevel = false
          if (!nextCompetenceId) nextCompetenceId = c.id
        }
      }

      // ✅ ARREGLO: Determinar si RECIÉN se completó el área vs ya estaba completa
      const wasAreaAlreadyComplete = allCompletedAtLevel && nextCompetenceId !== params.competenceId
      const justCompletedArea = allCompletedAtLevel && !wasAreaAlreadyComplete

      console.log(`🎯 Estado del área:`)
      console.log(`  - allCompletedAtLevel: ${allCompletedAtLevel}`)
      console.log(`  - wasAreaAlreadyComplete: ${wasAreaAlreadyComplete}`)
      console.log(`  - justCompletedArea: ${justCompletedArea}`)
      console.log(`  - nextCompetenceId: ${nextCompetenceId}`)
      
      // Guardar datos del test en sessionStorage para la página de resultados
      const testResultData = {
        questions: finalSession.questions,
        answers: finalSession.answers,
        competence: finalSession.competence,
        level: levelParam,
        score,
        correctAnswers,
        totalQuestions: finalSession.questions.length,
        isAreaComplete: justCompletedArea // Solo si RECIÉN completó el área
      }
    
      
      try {
        sessionStorage.setItem('testResultData', JSON.stringify(testResultData))
        console.log('Datos del test guardados en sessionStorage:', testResultData)
      } catch (error) {
        console.error('Error guardando datos en sessionStorage:', error)
      }

      // ✅ ARREGLO: Solo marcar areaCompleted=1 si RECIÉN completó toda el área
      const areaCompletedParam = justCompletedArea ? "1" : "0"
      router.push(`/test/${params.competenceId}/results?score=${score}&passed=${passed}&correct=${correctAnswers}&areaCompleted=${areaCompletedParam}&level=${levelParam}`)
    } catch (error) {
      console.error("Error saving test results:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los resultados",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#286675]"></div>
      </div>
    )
  }

  if (!testSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No se ha podido iniciar la prueba</h2>
          <p className="text-gray-600 mb-6">
            Hubo un problema al cargar las preguntas para esta competencia. Por favor intenta nuevamente.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-transparent">
      <TestInterface
        testSession={testSession}
        onAnswerSubmit={handleAnswerSubmit}
        onTestComplete={handleTestComplete}
      />
    </div>
  )
}
