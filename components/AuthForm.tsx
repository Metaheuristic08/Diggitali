"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const countries = [
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
]

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    country: "",
  })
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        })
      } else {
        if (!formData.name || !formData.age || !formData.country) {
          throw new Error("Todos los campos son obligatorios")
        }
        await register(
          formData.email,
          formData.password,
          formData.name,
          Number.parseInt(formData.age),
          formData.country,
        )
        toast({
          title: "¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente",
        })
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      let errorMessage = "Ha ocurrido un error inesperado"

      if (error.code === "auth/user-not-found") {
        errorMessage = "No existe una cuenta con este correo electrónico"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta"
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña"
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Ya existe una cuenta con este correo electrónico"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El correo electrónico no es válido"
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Esta cuenta ha sido deshabilitada"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos fallidos. Inténtalo de nuevo más tarde"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        </h3>
        <p className="text-gray-600 text-sm lg:text-base">
          {isLogin ? "Ingresa tus credenciales para acceder" : "Completa tus datos para comenzar"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {!isLogin && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
                disabled={loading}
                className="rounded-2xl border-2 border-gray-200 focus:border-[#286675] transition-colors h-11 lg:h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">Edad</Label>                  <Input
                  id="age"
                  type="number"
                  min="13"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required={!isLogin}
                  disabled={loading}
                  className="rounded-2xl border-2 border-gray-200 focus:border-[#286675] transition-colors h-11 lg:h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">País</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, country: value })} disabled={loading}>
                  <SelectTrigger className="rounded-2xl border-2 border-gray-200 focus:border-[#286675] h-11 lg:h-12">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
                    {countries.map((country) => (
                      <SelectItem 
                        key={country} 
                        value={country}
                        className="rounded-xl hover:bg-gray-50 focus:bg-gray-100"
                      >
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
            className="rounded-2xl border-2 border-gray-200 focus:border-[#286675] transition-colors h-11 lg:h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
            minLength={6}
            className="rounded-2xl border-2 border-gray-200 focus:border-[#286675] transition-colors h-11 lg:h-12"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 lg:h-12 bg-[#253239] hover:bg-[#1a2327] text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={loading}
        >
          {loading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-[#6b8f7a] hover:text-[#55705f] hover:underline transition-colors font-medium"
          disabled={loading}
        >
          {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  )
}
