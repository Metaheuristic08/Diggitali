"use client"

import type React from "react"
import { useEffect, useState } from "react"

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Garantizar que el componente solo se renderice en el cliente
  useEffect(() => {
    // Pequeño retraso para asegurar que todos los recursos estén cargados
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // No renderizar nada en el servidor o durante la hidratación inicial
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center Ladico-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Inicializando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
