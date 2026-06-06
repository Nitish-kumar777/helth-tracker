"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./components/Sidebar"
import { Header } from "./components/Header"
import { Zap } from "lucide-react"


export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#08080f] flex flex-col items-center justify-center gap-6">

        {/* Ambient glow */}
        <div className="pointer-events-none absolute w-[400px] h-[400px] rounded-full bg-violet-700/15 blur-[120px]" />

        {/* Logo mark */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_32px_rgba(124,58,237,0.5)]">
          <Zap size={24} className="text-white fill-white" />
          {/* spinning ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-violet-400 animate-spin" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[15px] font-bold text-white/80 tracking-tight">Habit Tracker</p>
          <p className="text-[11px] font-mono font-medium tracking-[0.2em] uppercase text-white/25">
            Loading your dashboard…
          </p>
        </div>

        {/* Dot pulse */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

      </div>
    )
  }

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#08080f] overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />

        {/* Scrollable page content */}
        <main className="flex-1 min-h-0 overflow-y-auto">
         
            <div className="min-h-full px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          
        </main>
      </div>
    </div>
  )
}