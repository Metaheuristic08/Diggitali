"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Question, TestSession } from "@/types"
import TestInterface from "@/components/TestInterface"
import { useToast } from "@/hooks/use-toast"


import { saveUserResult } from "@/utils/results-manager"
import { loadQuestionsByCompetence, updateQuestionStats, loadCompetences } from "@/services/questionsService"

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [questions, setQuestions] = useState<Question[]>([])
  const [testSession, setTestSession] = useState<TestSession | null>(null)
  const [loading, setLoading] = useState(true)

  
  

  useEffect(() => {
    if (!user || !userData) {
      router.push("/")
      return
    }

    
    const competenceId = params.competenceId as string
    if (userData.completedCompetences.includes(competenceId)) {
      console.log(`Usuario ya completó la competencia: ${competenceId}. Redirigiendo a resultados.`)
      
      router.push(`/test/${competenceId}/results?score=100&passed=true&correct=3&completed=true`)
      return
    }

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
      
      
      console.log(`Cargando preguntas para competencia: ${competenceId}`)
      
  const loadedQuestions = await loadQuestionsByCompetence(competenceId, levelName, 3)
      
      
      
      
      setQuestions(loadedQuestions)
      
      
      const session: TestSession = {
        id: "",
        userId: user!.uid,
        competence: competenceId,
        level: levelParam, // basico|intermedio|avanzado
        questions: loadedQuestions,
        answers: new Array(3).fill(null),
        currentQuestionIndex: 0,
        startTime: new Date(),
        score: 0,
        passed: false,
      }

      // Crear doc inicial de sesión para reflejar progreso parcial
      try {
        const docRef = await addDoc(collection(db, "testSessions"), session)
        setTestSession({ ...session, id: docRef.id })
      } catch (e) {
        console.error("No se pudo crear la sesión inicial:", e)
        setTestSession(session)
      }
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
    
    console.log("=== RESPUESTA DEL USUARIO ===")
    console.log(`Competencia: ${testSession.competence}`)
    console.log(`Pregunta ${questionIndex + 1}: ${currentQuestion.title}`)
    console.log(`Respuesta del usuario: Opción ${answerIndex + 1} (índice ${answerIndex}) - "${currentQuestion.options[answerIndex]}"`)
    console.log(`Respuesta correcta: Opción ${currentQuestion.correctAnswerIndex + 1} (índice ${currentQuestion.correctAnswerIndex}) - "${currentQuestion.options[currentQuestion.correctAnswerIndex]}"`)
    console.log(`¿Es correcta?: ${isCorrect ? "SÍ" : "NO"}`)
    console.log("=============================")

    const updatedAnswers = [...testSession.answers]
    updatedAnswers[questionIndex] = answerIndex

    const updatedSession = {
      ...testSession,
      answers: updatedAnswers,
    }

    setTestSession(updatedSession)

    // Persistir progreso parcial
    try {
      if (db && updatedSession.id) {
        await updateDoc(doc(db, "testSessions", updatedSession.id), {
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
      
      console.log("=== RESUMEN FINAL DE RESPUESTAS ===")
      
      
      await Promise.all(finalSession.questions.map(async (question, index) => {
        const userAnswer = finalSession.answers[index]
        const wasCorrect = userAnswer === question.correctAnswerIndex
        
        console.log(`Pregunta ${index + 1}: ${question.title}`)
        console.log(`  Usuario respondió: ${userAnswer !== null ? `Opción ${userAnswer + 1} (índice ${userAnswer}) - "${question.options[userAnswer]}"` : "No respondió"}`)
        console.log(`  Respuesta correcta: Opción ${question.correctAnswerIndex + 1} (índice ${question.correctAnswerIndex}) - "${question.options[question.correctAnswerIndex]}"`)
        console.log(`  ¿Correcta?: ${wasCorrect ? "SÍ" : "NO"}`)
        console.log("---")
        
        if (wasCorrect) {
          correctAnswers++
        }
        
        
        await updateQuestionStats(question.id, wasCorrect)
      }))

  const score = Math.round((correctAnswers / finalSession.questions.length) * 100)
  const passed = correctAnswers >= 2 

      console.log(`RESULTADO FINAL: ${correctAnswers}/${finalSession.questions.length} correctas (${score}%)`)
      console.log(`¿APROBÓ?: ${passed ? "SÍ" : "NO"} (necesita 2/3 para aprobar)`)
      console.log("===================================")

      const completedSession = {
        ...finalSession,
        endTime: new Date(),
        score,
        passed,
      }

      
      if (db) {
        try {
          if (finalSession.id) {
            await updateDoc(doc(db, "testSessions", finalSession.id), {
              endTime: completedSession.endTime,
              score: completedSession.score,
              passed: completedSession.passed,
              answers: completedSession.answers,
            })
          } else {
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
            
            
            
            
            DiggitaliScore: userData.DiggitaliScore + (passed ? 10 : 0),
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

      if (!allCompletedAtLevel && nextCompetenceId) {
        // Pasar directo al siguiente de la misma área y nivel
        router.push(`/test/${nextCompetenceId}?level=${levelParam}`)
        return
      }

      // Área completa en este nivel → ir a resultados agregados con pistas
      router.push(`/test/${params.competenceId}/results?score=${score}&passed=${passed}&correct=${correctAnswers}&areaCompleted=1&level=${levelParam}`)
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
