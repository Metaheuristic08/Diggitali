"use client"

import { useState, useEffect } from 'react'
import { loadCompetences } from '@/services/questionsService'
import type { Competence } from '@/types'

// Caché compartido en memoria para todos los componentes que usen este hook
let sharedCompetences: Competence[] | null = null;
let fetchPromise: Promise<Competence[]> | null = null;

interface UseCompetencesResult {
  competences: Competence[]
  loading: boolean
  error: Error | null
}

export function useCompetences(): UseCompetencesResult {
  const [competences, setCompetences] = useState<Competence[]>(sharedCompetences || [])
  const [loading, setLoading] = useState<boolean>(!sharedCompetences)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Si ya tenemos datos en caché, no hacemos nada
    if (sharedCompetences) {
      return;
    }

    // Si ya hay una petición en curso, esperamos a que termine
    if (fetchPromise) {
      fetchPromise.then(data => {
        setCompetences(data);
        setLoading(false);
      }).catch(err => {
        console.error("Error al cargar competencias en useCompetences:", err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        setLoading(false);
      });
      return;
    }

    // Si no hay petición en curso, la iniciamos
    const fetchCompetences = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Crear una única promesa que todos los hooks compartirán
        fetchPromise = loadCompetences();
        const data = await fetchPromise;
        
        // Guardar en caché compartida
        sharedCompetences = data;
        setCompetences(data);
      } catch (err) {
        console.error("Error al cargar competencias en useCompetences:", err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
        fetchPromise = null;
      }
    };

    fetchCompetences();
  }, []); // Sin dependencias para evitar re-ejecutar

  return { competences, loading, error };
}
