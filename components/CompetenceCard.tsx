"use client"

import type { Competence } from "@/types"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMemo, useState } from "react"

interface CompetenceCardProps {
  competence: Competence
  questionCount?: number
  currentAreaLevel: "Básico" | "Intermedio" | "Avanzado"
  levelStatus: { completed: boolean; inProgress: boolean; answered: number; total: number; progressPct: number }
  areaCompletedAtLevel: boolean
  isNextCandidate: boolean
}

export default function CompetenceCard({ competence, questionCount = 0, currentAreaLevel, levelStatus, areaCompletedAtLevel, isNextCandidate }: CompetenceCardProps) {
  const router = useRouter()
  const { userData } = useAuth()
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [locallyStarted, setLocallyStarted] = useState(false)

  const hasEnoughQuestions = questionCount >= 3


  const getCompetenceSpecificColor = () => {
    const competenceColors: Record<string, string> = {
      "1.1": "#F5A78D",
      "1.2": "#F5A78D",
      "1.3": "#F5A78D",
      "2.1": "#3399D6",
      "2.2": "#3399D6",
      "2.3": "#3399D6",
      "2.4": "#3399D6",
      "2.5": "#3399D6",
      "2.6": "#3399D6",
      "3.1": "#CF4249",
      "3.2": "#CF4249",
      "3.3": "#CF4249",
      "3.4": "#CF4249",
      "4.1": "#A5D0A0",
      "4.2": "#A5D0A0",
      "4.3": "#A5D0A0",
      "4.4": "#A5D0A0",
    }
    return competenceColors[competence.id] || "#D1D5DB"
  }

  const ringColor = getCompetenceSpecificColor()

  const isLongDescription = competence.description.length > 80
  const displayDescription = showFullDescription || !isLongDescription
    ? competence.description
    : `${competence.description.substring(0, 80)}...`

  const levelNumber = useMemo(() => {
    return currentAreaLevel === "Básico" ? 1 : currentAreaLevel === "Intermedio" ? 2 : 3
  }, [currentAreaLevel])

  const circumference = useMemo(() => 2 * Math.PI * 18, [])
  const progressPct = levelStatus.progressPct
  const dashOffset = useMemo(() => circumference * (1 - progressPct / 100), [circumference, progressPct])

  const showDash = levelStatus.inProgress || levelStatus.completed || locallyStarted
  const labelText = showDash ? `Nivel ${levelNumber}` : "-"

  const canStartOrContinue = hasEnoughQuestions && !levelStatus.completed
  const btnLabel = levelStatus.inProgress ? "Continuar" : "Comenzar evaluación"

  const handleStartOrContinue = () => {
    if (!canStartOrContinue) return
    setLocallyStarted(true)
    const levelParam = currentAreaLevel.toLowerCase()
    router.push(`/test/${competence.id}?level=${levelParam}`)
  }

  return (
    <div className="relative bg-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group border border-gray-200 h-[300px] max-h-[300px] flex flex-col">
      <div className="overflow-hidden rounded-2xl bg-white h-full flex flex-col">
        <div
          className="h-6 rounded-t-2xl"
          style={{ backgroundColor: getCompetenceSpecificColor() }}
        />

        <div className="p-5 flex-1 flex flex-col overflow-hidden text-center">
          <div className="overflow-y-auto flex-1 pr-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 leading-tight min-h-[2.5rem] cursor-help">
                    {competence.name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{competence.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex justify-center my-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  {showDash && (
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      strokeWidth="4"
                      stroke={ringColor}
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.5s" }}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-[#286675]">{labelText}</span>
                </div>
              </div>
            </div>


          </div>

          <Button
            onClick={handleStartOrContinue}
            className={`w-full rounded-full py-3 text-sm font-semibold transition-all duration-200 border mt-3
            ${canStartOrContinue
                ? "bg-[#286675] hover:bg-[#1e4a56] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-transparent font-bold"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              }`}
            disabled={!canStartOrContinue}
          >
            {canStartOrContinue ? btnLabel : (
              <span className="flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-700">Bloqueado</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
