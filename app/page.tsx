"use client"

import { useEffect } from "react"
import Header from "@/components/landing/Header"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import Footer from "@/components/landing/Footer"
import Areas from "@/components/landing/Areas"
import { getFirebaseAnalytics } from "@/lib/firebase"

export default function LandicoLanding() {
  useEffect(() => {
    const analytics = getFirebaseAnalytics()
    if (analytics) {
      console.log("Firebase Analytics initialized successfully")
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Areas />
      </main>
      <Footer />
    </div>
  )
}
