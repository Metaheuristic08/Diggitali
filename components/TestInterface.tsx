"use client"

import { useState } from "react"
import type { TestSession } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface TestInterfaceProps {
  testSession: TestSession
  onAnswerSubmit: (answerIndex: number, questionIndex: number) => void
  onTestComplete: (session: TestSession) => void
}

export default function TestInterface({ testSession, onAnswerSubmit, onTestComplete }: TestInterfaceProps) {
  
  const router = useRouter();

  const initialAnswer = testSession?.answers?.[testSession.currentQuestionIndex] ?? null;
    
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(initialAnswer);
  const [currentIndex, setCurrentIndex] = useState(testSession?.currentQuestionIndex ?? 0);
  
  if (!testSession || !testSession.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el test</h2>
          <p className="text-gray-700 mb-4">No se ha podido cargar la información del test correctamente.</p>
          <a href="/dashboard" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }

  const currentQuestion = testSession.questions[currentIndex]
  const totalQuestions = 3 
  const progress = ((currentIndex + 1) / totalQuestions) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    onAnswerSubmit(answerIndex, currentIndex)
  }

  const handleNext = () => {
    if (selectedAnswer === null) return;

    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedAnswer(testSession.answers[nextIndex] ?? null)
    } else {
      const finalSession = {
        ...testSession,
        answers: testSession.answers.map((answer, index) => (index === currentIndex ? selectedAnswer : answer)),
      }
      onTestComplete(finalSession)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setSelectedAnswer(testSession.answers[prevIndex] ?? null)
    }
  }
  
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-[#f3fbfb]">
      
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 rounded-b-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between text-white space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard">
                <img
                  src="/ladico_green.png"
                  alt="Ladico Logo"
                  className="w-24 h-24 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>

              <span className="text-[#2e6372] sm:text-sm opacity-80 bg-white/10 px-2 sm:px-3 py-1 rounded-full text-center">
                {currentQuestion.dimension} | {currentQuestion.competence} - {testSession.level?.toString().toLowerCase?.() === 'intermedio' ? 'Intermedio' : testSession.level?.toString().toLowerCase?.() === 'avanzado' ? 'Avanzado' : 'Básico'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between text-white mb-4">
          <span className="text-xs text-[#286575] sm:text-sm font-medium bg-white/10 px-2 sm:px-3 py-1 rounded-full">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </span>
          <div className="flex space-x-1 sm:space-x-2">
            {Array.from({ length: totalQuestions }, (_, index) => (
              <div
                key={index}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index <= currentIndex ? 'bg-[#286575] shadow-lg' : 'bg-[#dde3e8]'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="bg-[#dde3e8] rounded-full h-2 sm:h-3 overflow-hidden">
          <div 
            className="h-full bg-[#286575] rounded-full transition-all duration-500 ease-in-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
        <Card 
          className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl border-0 transition-all duration-300 ring-2 ring-purple-500 ring-opacity-30 shadow-purple-500/10"
        >
          <CardContent className="p-4 sm:p-6 lg:p-8">
            
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
              </div>
            </div>

            
            <div className="mb-6 sm:mb-8">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-l-4 border-purple-500">
                <p className="text-gray-700 leading-relaxed font-medium text-sm sm:text-base">{currentQuestion.scenario}</p>
              </div>
            </div>

            
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{currentQuestion.title}</h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 bg-blue-50 px-3 sm:px-4 py-2 rounded-full inline-block">
                Selecciona sólo una respuesta
              </p>

              
              <div className="space-y-3 sm:space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
                      selectedAnswer === index
                            ? "border-purple-500 bg-purple-50 shadow-md transform scale-[1.01] sm:scale-[1.02] cursor-pointer"
                            : "border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                    }`}
                  >
                    <div className="relative mt-1">
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={selectedAnswer === index}
                        onChange={() => handleAnswerSelect(index)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all ${
                        selectedAnswer === index 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-700 leading-relaxed flex-1 text-sm sm:text-base">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex space-x-3 w-full sm:w-auto">
                {currentIndex > 0 && (
                  <Button 
                    onClick={handlePrevious} 
                    variant="outline" 
                    className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-transparent border-2 border-gray-300 hover:border-gray-400 rounded-xl sm:rounded-2xl font-medium transition-all text-sm sm:text-base"
                  >
                    Anterior
                  </Button>
                )}
              </div>

              <Button 
                onClick={handleNext} 
                disabled={selectedAnswer === null} 
                className="w-full sm:w-auto px-8 sm:px-10 py-3 bg-[#286675] rounded-xl sm:rounded-2xl font-medium text-white sm:text-lg shadow-lg hover:bg-[#3a7d89] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLastQuestion ? "Finalizar" : "Siguiente"}
              </Button>
            </div>

            {isLastQuestion && selectedAnswer !== null && (
              <div className="mt-4 text-center">

              </div>
            )}
            
            {selectedAnswer === null && (
              <div className="mt-4 sm:mt-6 flex items-center justify-center space-x-3 text-blue-600 bg-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-xs sm:text-sm font-medium">Por favor, selecciona una respuesta para continuar</span>
              </div>
            )}

            
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}