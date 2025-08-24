"use client"

import { useState, useEffect } from 'react'
import { loadCompetences } from '@/services/questionsService'
import type { Competence } from '@/types'

interface UseCompetencesResult {
  competences: Competence[]
  loading: boolean
  error: Error | null
}

export function useCompetences(): UseCompetencesResult {
  const [competences, setCompetences] = useState<Competence[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCompetences = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Usar loadCompetences que ahora tiene cache implementado
        const loadedCompetences = await loadCompetences()
        setCompetences(loadedCompetences)
      } catch (err) {
        console.error("Error al cargar competencias en useCompetences:", err)
        setError(err instanceof Error ? err : new Error('Error desconocido'))
      } finally {
        setLoading(false)
      }
    }

    fetchCompetences()
  }, []) // Sin dependencias para evitar re-ejecutar

  return { competences, loading, error }
}
