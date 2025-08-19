"use client"

import { useState, useEffect, useRef } from "react"
import type { TestSession } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, X, Shield, AlertCircle, Info, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"

interface TestInterfaceProps {
  testSession: TestSession
  onAnswerSubmit: (answerIndex: number, questionIndex: number) => void
  onTestComplete: (session: TestSession) => void
}

export default function TestInterface({ testSession, onAnswerSubmit, onTestComplete }: TestInterfaceProps) {
  
  const initialAnswer = testSession && testSession.answers ? 
    testSession.answers[testSession.currentQuestionIndex] : null;
    
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(initialAnswer);
  const [currentIndex, setCurrentIndex] = useState(
    testSession ? testSession.currentQuestionIndex : 0
  );
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showInitialWarning, setShowInitialWarning] = useState(true);
  const [isQuestionInvalidated, setIsQuestionInvalidated] = useState(false);
  const [showInvalidationAlert, setShowInvalidationAlert] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
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

  // Auto-advance cuando se invalida la pregunta
  useEffect(() => {
    if (isQuestionInvalidated && showInvalidationAlert) {
      const timer = setTimeout(() => {
        handleNext();
      }, 3000); // 3 segundos de delay

      return () => clearTimeout(timer);
    }
  }, [isQuestionInvalidated, showInvalidationAlert]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isQuestionLocked && !isQuestionInvalidated) {
      setSelectedAnswer(answerIndex)
    }
  }

  const handleMouseLeave = () => {
    if (attemptsLeft > 0 && !isQuestionInvalidated) {
      setIsQuestionLocked(true);
      setShowWarning(true);
      setAttemptsLeft(prev => prev - 1);
      
      if (attemptsLeft === 1) {
        setIsQuestionInvalidated(true);
        setShowWarning(false);
        setShowInvalidationAlert(true);
      }
    }
  }

  const handleMouseEnter = () => {
    if (isQuestionLocked && !isQuestionInvalidated) {
      setIsQuestionLocked(false);
      setShowWarning(false);
    }
  }

  const handleNext = () => {
    if (selectedAnswer !== null && !isQuestionLocked) {
      onAnswerSubmit(selectedAnswer, currentIndex)
    }

    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedAnswer(testSession.answers[nextIndex])
      setIsQuestionLocked(false)
      setShowWarning(false)
      setAttemptsLeft(3)
      setIsQuestionInvalidated(false)
      setShowInvalidationAlert(false)
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
      setSelectedAnswer(testSession.answers[prevIndex])
      setIsQuestionLocked(false)
      setShowWarning(false)
      setAttemptsLeft(3)
      setIsQuestionInvalidated(false)
      setShowInvalidationAlert(false)
    }
  }

  const handleSkip = () => {
    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedAnswer(testSession.answers[nextIndex])
      setIsQuestionLocked(false)
      setShowWarning(false)
      setAttemptsLeft(3)
      setIsQuestionInvalidated(false)
      setShowInvalidationAlert(false)
    } else {
      const finalSession = {
        ...testSession,
        answers: testSession.answers.map((answer, index) => (index === currentIndex ? null : answer)),
      }
      onTestComplete(finalSession)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3fbfb]">
      
      {/* Popup inicial de advertencia mejorado */}
      <Dialog open={showInitialWarning} onOpenChange={setShowInitialWarning}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gray-100 rounded-lg"></div>
          <div className="relative">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                ⚠️ Advertencia Importante
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                <div className="space-y-4">
                  <p className="font-semibold text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                    Durante el test, debes mantener el mouse dentro del recuadro de la pregunta.
                  </p>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm font-bold text-yellow-800">Reglas del Test:</p>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Tienes <strong className="text-yellow-800">3 intentos</strong> para salir del área de la pregunta</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Si sales más de 3 veces, la pregunta se <strong className="text-red-600">invalidará automáticamente</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Mantén el mouse dentro del <strong className="text-[#5d8b6a]">recuadro blanco</strong> en todo momento</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-700 text-center">
                      <strong>💡 Consejo:</strong> Esta medida garantiza la integridad y validez de tu evaluación.
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setShowInitialWarning(false)}
                className="bg-gradient-to-r from-[#94b2ba] to-[#286675] hover:from-[#b7cfd6] hover:to-[#3b7d8a] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Entendido, comenzar test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 rounded-b-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between text-white space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard">
                <img
                  src="/Diggitali_green.png"
                  alt="Diggitali Logo"
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
          ref={cardRef}
          className={`bg-white shadow-2xl rounded-2xl sm:rounded-3xl border-0 transition-all duration-300 relative ${
            isQuestionLocked 
              ? 'ring-4 ring-red-500 ring-opacity-70 shadow-red-500/20' 
              : isQuestionInvalidated
                ? 'ring-4 ring-red-600 ring-opacity-90 shadow-red-600/30'
                : 'ring-2 ring-purple-500 ring-opacity-30 shadow-purple-500/10'
          }`}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          {/* Indicador de intentos */}
          <div className="absolute -top-3 -right-3 z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
              isQuestionInvalidated 
                ? 'bg-red-600' 
                : attemptsLeft === 3 
                  ? 'bg-green-500' 
                  : attemptsLeft === 2 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
            }`}>
              {isQuestionInvalidated ? 'INVALIDADA' : `${attemptsLeft}/3`}
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 lg:p-8">
            
            {showWarning && (
              <Alert variant="destructive" className="mb-4 sm:mb-6 border-red-300 bg-red-50 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm text-red-700">
                  <div className="flex items-center justify-between">
                    <span>⚠️ ¡Has salido del área! Intentos restantes: <strong>{attemptsLeft}</strong>. Vuelve al recuadro para desbloquear.</span>
                    <button 
                      onClick={() => setShowWarning(false)}
                      className="ml-2 p-1 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {showInvalidationAlert && (
              <Alert variant="destructive" className="mb-4 sm:mb-6 border-red-400 bg-red-100 animate-pulse">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm text-red-800 font-medium">
                  <div className="flex items-center justify-between">
                    <span>❌ Esta pregunta ha sido invalidada por exceder los 3 intentos. Avanzando automáticamente en 3 segundos...</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

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
                      isQuestionInvalidated 
                        ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-40"
                        : isQuestionLocked 
                          ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                          : selectedAnswer === index
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
                        disabled={isQuestionLocked || isQuestionInvalidated}
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
                disabled={selectedAnswer === null || isQuestionLocked} 
                className="w-full sm:w-auto px-8 sm:px-10 py-3 bg-[#286675] rounded-xl sm:rounded-2xl font-medium text-white sm:text-lg shadow-lg hover:bg-[#3a7d89] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentIndex === totalQuestions - 1 ? "Finalizar" : "Siguiente"}
              </Button>
            </div>

            
            {selectedAnswer === null && !isQuestionLocked && !isQuestionInvalidated && (
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
