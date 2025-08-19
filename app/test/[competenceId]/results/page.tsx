"use client"

import { useSearchParams, useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { useEffect, useState } from "react"
import { loadCompetences } from "@/services/questionsService"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function TestResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()

  const score = Number.parseInt(searchParams.get("score") || "0")
  const passed = searchParams.get("passed") === "true"
  const correctAnswers = Number.parseInt(searchParams.get("correct") || "0")
  const totalQuestions = 3
  const isAlreadyCompleted = searchParams.get("completed") === "true"
  const areaCompleted = searchParams.get("areaCompleted") === "1"
  const levelParam = (searchParams.get("level") || "basico").toLowerCase()
  const [firstCompetenceInArea, setFirstCompetenceInArea] = useState<string | null>(null)
  const [loadingArea, setLoadingArea] = useState(false)
  const [areaCounts, setAreaCounts] = useState<{ completed: number; total: number } | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!areaCompleted) return
      setLoadingArea(true)
      try {
        const comps = await loadCompetences()
        const currentId = params.competenceId as string
        const current = comps.find(c => c.id === currentId)
        if (!current) return
        const inArea = comps.filter(c => c.dimension === current.dimension).sort((a, b) => a.code.localeCompare(b.code))
        setFirstCompetenceInArea(inArea[0]?.id || null)

        // Contar cuántas competencias del área tienen 100% en este nivel
        const lvl = levelParam
        let completed = 0
        for (const c of inArea) {
          if (!db) continue
          const qs = await getDocs(query(collection(db, "testSessions"), where("competence", "==", c.id), where("level", "==", lvl)))
          const hasPerfect = qs.docs.some(d => (d.data() as any)?.score === 100)
          if (hasPerfect) completed++
        }
        setAreaCounts({ completed, total: inArea.length })
      } finally {
        setLoadingArea(false)
      }
    }
    run()
  }, [areaCompleted, params.competenceId])

  const handleReturnToDashboard = () => {
    router.push("/dashboard")
  }

  const handleRetakeTest = () => {
    if (!isAlreadyCompleted) {
      router.back()
    }
  }

  const handleContinueEvaluation = () => {
    // Continuar al siguiente nivel de la primera competencia (1er código del área) si completó el área
    const currentCompetenceId = firstCompetenceInArea || (params.competenceId as string)
    // Simplemente re-dirigir a la primera competencia del área pero con siguiente nivel
    const nextLevel = levelParam.startsWith("b") ? "intermedio" : levelParam.startsWith("i") ? "avanzado" : null
    if (nextLevel) {
      router.push(`/test/${currentCompetenceId}?level=${nextLevel}`)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <>
      {/* Sidebar fijo (ya maneja su propio responsive) */}
      <Sidebar />

      {/* Contenido con padding para no quedar debajo del sidebar en desktop */}
      <div className="min-h-screen bg-[#f3fbfb] lg:pl-72 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-2xl shadow-2xl rounded-2xl sm:rounded-3xl border-0 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-b from-white to-gray-50 pb-6 sm:pb-8 px-4 sm:px-6">
            <div className="mx-auto mb-4 sm:mb-6">
              {passed ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                  <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
                </div>
              )}
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 bg-[#5d8b6a] bg-clip-text text-transparent px-2">
              {areaCompleted ? "¡Nivel del área completado!" : isAlreadyCompleted ? "¡Competencia Completada!" : passed ? "¡Felicitaciones!" : "Sigue practicando"}
            </CardTitle>

            <p className="text-gray-600 text-base sm:text-lg px-2">
              {areaCompleted
                ? "Has completado este nivel en todas las competencias del área."
                : isAlreadyCompleted
                  ? "Ya has completado exitosamente esta competencia anteriormente"
                  : passed
                    ? "Has completado exitosamente esta competencia"
                    : "Necesitas al menos 2 respuestas correctas para avanzar"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              <div className="p-3 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{totalQuestions}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Preguntas</div>
              </div>

              <div className="p-3 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl shadow-sm border border-green-200">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{correctAnswers}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Correctas</div>
              </div>

              <div className="p-3 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl shadow-sm border border-red-200">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{totalQuestions - correctAnswers}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Incorrectas</div>
              </div>
            </div>

            <div className="text-center p-6 sm:p-8 via-blue-50 to-gray-400 rounded-2xl sm:rounded-3xl border border-gray-300 shadow-lg">
              <div className="text-4xl sm:text-5xl font-bold bg-[#5d8b6a] bg-clip-text text-transparent mb-2 sm:mb-3">
                {score}%
              </div>
              <div className="text-gray-600 text-base sm:text-lg font-medium">Puntuación obtenida</div>
              {passed && (
                <div className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium shadow-sm">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  +10 Diggitali ganados
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {areaCompleted && (
                <div className="p-4 sm:p-5 bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl text-center">
                  <p className="text-green-800 text-sm sm:text-base font-medium">
                    {loadingArea
                      ? "Calculando resultados del área..."
                      : areaCounts
                        ? `Completaste ${areaCounts.completed}/${areaCounts.total} competencias en este nivel.`
                        : "Área completada en este nivel."}
                  </p>
                </div>
              )}
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">Resumen de respuestas:</h3>
              <div className="space-y-2 sm:space-y-3">
                {Array.from({ length: totalQuestions }, (_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
                  >
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Pregunta {index + 1}</span>
                    {index < correctAnswers ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        <span className="text-green-600 font-medium text-xs sm:text-sm">Correcta</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                        <span className="text-red-600 font-medium text-xs sm:text-sm">Incorrecta</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200 shadow-sm">
              <p className="text-blue-800 leading-relaxed text-sm sm:text-base">
                {isAlreadyCompleted
                  ? "Has completado esta competencia previamente. Tus Diggitalis ya han sido otorgados. Explora otras competencias para seguir creciendo."
                  : passed
                    ? "¡Excelente trabajo! Has completado esta competencia exitosamente. ¡Continúa desarrollando tus habilidades digitales!"
                    : "No te desanimes. Puedes volver a intentarlo cuando te sientas preparado. Recuerda revisar los recursos de apoyo."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              {areaCompleted && (
                <Button onClick={handleReturnToDashboard} variant="outline" className="flex-1 rounded-xl sm:rounded-2xl py-3 text-base sm:text-lg font-medium">
                  Ir al Dashboard
                </Button> 
              )}
              <Button onClick={handleContinueEvaluation} className="flex-1 bg-[#286675] hover:bg-[#1e4a56] text-white rounded-xl sm:rounded-2xl py-3 text-base sm:text-lg font-semibold">
                Continuar evaluación
              </Button>
              {!passed && !isAlreadyCompleted && (
                <Button
                  onClick={handleRetakeTest}
                  variant="outline"
                  className="flex-1 bg-transparent border-2 border-gray-300 hover:border-gray-400 rounded-xl sm:rounded-2xl py-3 text-base sm:text-lg font-medium transition-all"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Intentar de nuevo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
