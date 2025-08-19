"use client"

import { ArrowRight, Play, Star } from "lucide-react"

export default function Hero() {
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <section id="inicio" className="min-h-screen flex items-center justify-center Diggitali-section pt-32">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-2">
                        Evalúa y Certifica tus
                        <span className="text-[#5d8b6a]"> Competencias Digitales</span>
                        </h1>

                        <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                        Descubre tu nivel real en las 5 áreas fundamentales del Marco Europeo de Competencias Digitales. 
                        Una evaluación profesional basada en estándares internacionales, diseñada para estudiantes, 
                        profesionales y ciudadanos del siglo XXI.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12 items-center sm:items-start">
                            <button onClick={() => scrollTo("caracteristicas")} className="bg-gradient-to-r from-[#94b2ba] to-[#286675] text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:opacity-90">
                                ¿Qué ofrecemos?
                            </button>
                        </div>

                        
                        <div className="grid grid-cols-3 gap-6">
                            <div className="Diggitali-stat-card">
                                <div className="text-3xl font-bold text-[#1f302b] mb-2">Cursos</div>
                                <div className="text-gray-600">Para diferentes edades y conocimientos.</div>
                            </div>
                            <div className="Diggitali-stat-card">
                                <div className="text-3xl font-bold text-[#1f302b] mb-2">Ayuda</div>
                                <div className="text-gray-600">Adecuado para quién sea.</div>
                            </div>
                            <div className="Diggitali-stat-card">
                                <div className="text-3xl font-bold text-[#1f302b] mb-2">Logros</div>
                                <div className="text-gray-600">Puntajes y miscelaneos para todos.</div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="relative">
                        <div className="border-2 border-gray-200  rounded-3xl p-12 bg-gradient-to-br from-gray-50 to-gray-20 border-2 border-bg-gradient-to-r from-[#94b2ba] to-[#286675]">
                            <div className="relative">
                                <div className="w-full h-80 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-gray-100 flex items-center justify-center mb-8">
                                    <img
                                        src="/Diggitali.png"
                                        alt="Diggitali Logo"
                                        className="w-40 h-40 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg border-2 border-gray-200"
                                    />
                                </div>

                                
                                
                                <div
                                    className="absolute -top-6 -right-6 w-28 h-[90px] bg-white rounded-xl shadow-lg animate-float border border-gray-200"
                                    style={{ animationDelay: "1.0s" }}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                            <span className="text-xl">🔍</span>
                                        </div>
                                        <span className="text-gray-700 text-sm">Información</span>
                                    </div>
                                </div>

                                
                                <div
                                    className="absolute -bottom-6 -right-6 w-28 h-[90px] bg-white rounded-xl shadow-lg animate-float border border-gray-200"
                                    style={{ animationDelay: "1.5s" }}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                                            <span className="text-xl">💬</span>
                                        </div>
                                        <span className="text-gray-700 text-sm">Comunicación</span>
                                    </div>
                                </div>

                                
                                <div
                                    className="absolute -bottom-6 -left-6 w-28 h-[90px] bg-white rounded-xl shadow-lg animate-float border border-gray-200"
                                    style={{ animationDelay: "2.0s" }}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                                            <span className="text-xl">🎨</span>
                                        </div>
                                        <span className="text-gray-700 text-sm">Creación</span>
                                    </div>
                                </div>

                                
                                <div
                                    className="absolute top-1/2 -left-8 w-28 h-[90px] bg-white rounded-xl shadow-lg animate-float border border-gray-200"
                                    style={{ animationDelay: "2.5s" }}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                            <span className="text-xl">🛡️</span>
                                        </div>
                                        <span className="text-gray-700 text-sm">Seguridad</span>
                                    </div>
                                </div>

                                
                                <div
                                    className="absolute top-1/4 -right-8 w-28 h-[90px] bg-white rounded-xl shadow-lg animate-float border border-gray-200"
                                    style={{ animationDelay: "3.0s" }}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                            <span className="text-xl">⚙️</span>
                                        </div>
                                        <span className="text-gray-700 text-sm">Resolución</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
