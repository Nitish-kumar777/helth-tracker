"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_32px_rgba(124,58,237,0.5)]">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <Loader2 size={20} className="animate-spin text-violet-500" />
        </div>
      </div>
    )
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
      return
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#08080f] text-white flex items-center justify-center px-4 py-12">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-700/[0.08] blur-[100px]" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_32px_rgba(124,58,237,0.45)]">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <div className="text-center">
            <p className="text-[20px] font-extrabold tracking-tight text-white">Habit Tracker</p>
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/25 mt-0.5">dashboard</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-sm">

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[24px] font-extrabold tracking-tight text-white">Welcome back</h1>
            <p className="text-[13px] text-white/35 mt-1">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError("") }}
                  required
                  disabled={loading}
                  className="
                    w-full bg-white/[0.04] border border-white/[0.09] rounded-xl
                    pl-10 pr-4 py-2.5
                    text-[13.5px] text-white placeholder-white/20
                    focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">
                  Password
                </label>
                <a href="/reset-password" className="text-[11px] font-semibold text-violet-400/70 hover:text-violet-400 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError("") }}
                  required
                  disabled={loading}
                  className="
                    w-full bg-white/[0.04] border border-white/[0.09] rounded-xl
                    pl-10 pr-10 py-2.5
                    text-[13.5px] text-white placeholder-white/20
                    focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/[0.08] border border-red-500/25 rounded-xl px-3.5 py-2.5">
                <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                <p className="text-[12px] text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full flex items-center justify-center gap-2 mt-2
                px-4 py-2.5 rounded-xl
                bg-gradient-to-r from-violet-600 to-purple-500
                text-[13.5px] font-bold text-white
                shadow-[0_4px_20px_rgba(124,58,237,0.4)]
                hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)]
                hover:-translate-y-px active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                transition-all duration-200 relative overflow-hidden
              "
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                : <><span>Sign in</span><ArrowRight size={14} /></>
              }
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[11px] font-mono text-white/20">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Register link */}
          <p className="text-center text-[13px] text-white/35">
            Don't have an account?{" "}
            <a href="/register" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Create one
            </a>
          </p>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[11px] font-mono text-white/15 mt-6">
          © {new Date().getFullYear()} Habit Tracker
        </p>
      </div>
    </div>
  )
}