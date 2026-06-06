"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight,
  Zap, Loader2, AlertCircle, CheckCircle2, Check
} from "lucide-react"

// ── Password strength ─────────────────────────────────────────────────────────
function pwStrength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const STRENGTH_META = [
  { label: "", color: "" },
  { label: "Weak", color: "bg-red-500    text-red-400" },
  { label: "Fair", color: "bg-amber-500  text-amber-400" },
  { label: "Good", color: "bg-yellow-400 text-yellow-400" },
  { label: "Strong", color: "bg-emerald-500 text-emerald-400" },
  { label: "Very Strong", color: "bg-emerald-400 text-emerald-300" },
]
const BAR_COLORS = [
  "", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500", "bg-emerald-400",
]

// ── Requirement row ───────────────────────────────────────────────────────────
function Req({ met, label }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] transition-colors ${met ? "text-emerald-400" : "text-white/25"}`}>
      {met ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0" />}
      {label}
    </div>
  )
}

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const clearFieldError = (field) =>
    setErrors(p => ({ ...p, [field]: "" }))

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = "Name is required"
    else if (name.trim().length < 2) e.name = "At least 2 characters"
    else if (!/^[a-zA-Z\s]+$/.test(name)) e.name = "Letters and spaces only"

    if (!email) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email"

    if (!password) e.password = "Password is required"
    else if (password.length < 8) e.password = "At least 8 characters"
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      e.password = "Needs uppercase, lowercase & number"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError("")
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/create-acc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      })
      if (res.ok) {
        router.push("/login")
      } else {
        const data = await res.json()
        setApiError(data.message || "Registration failed. Please try again.")
      }
    } catch {
      setApiError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const strength = pwStrength(password)
  const strengthM = STRENGTH_META[strength]
  const barColor = BAR_COLORS[strength]

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
            <p className="text-[20px] font-extrabold tracking-tight text-white">HealthTrack</p>
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/25 mt-0.5">create account</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-sm">

          <div className="mb-7">
            <h1 className="text-[24px] font-extrabold tracking-tight text-white">Get started</h1>
            <p className="text-[13px] text-white/35 mt-1">Create your account in seconds</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">
                Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={e => { setName(e.target.value); clearFieldError("name") }}
                  disabled={submitting}
                  className={`
                    w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-2.5
                    text-[13.5px] text-white placeholder-white/20
                    focus:outline-none focus:bg-white/[0.07]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    ${errors.name
                      ? "border-red-500/60 focus:border-red-500/70"
                      : "border-white/[0.09] focus:border-violet-500/60"
                    }
                  `}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle size={10} />{errors.name}
                </p>
              )}
            </div>

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
                  onChange={e => { setEmail(e.target.value); clearFieldError("email") }}
                  disabled={submitting}
                  className={`
                    w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-2.5
                    text-[13.5px] text-white placeholder-white/20
                    focus:outline-none focus:bg-white/[0.07]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    ${errors.email
                      ? "border-red-500/60 focus:border-red-500/70"
                      : "border-white/[0.09] focus:border-violet-500/60"
                    }
                  `}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle size={10} />{errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearFieldError("password") }}
                  disabled={submitting}
                  className={`
                    w-full bg-white/[0.04] border rounded-xl pl-10 pr-10 py-2.5
                    text-[13.5px] text-white placeholder-white/20
                    focus:outline-none focus:bg-white/[0.07]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    ${errors.password
                      ? "border-red-500/60 focus:border-red-500/70"
                      : "border-white/[0.09] focus:border-violet-500/60"
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength ? barColor : "bg-white/[0.07]"}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      <Req met={password.length >= 8} label="8+ characters" />
                      <Req met={/[A-Z]/.test(password)} label="Uppercase letter" />
                      <Req met={/[0-9]/.test(password)} label="Number" />
                      <Req met={/[a-z]/.test(password)} label="Lowercase letter" />
                    </div>
                    {strengthM.label && (
                      <span className={`text-[10px] font-bold flex-shrink-0 ml-3 ${strengthM.color.split(" ")[1]}`}>
                        {strengthM.label}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle size={10} />{errors.password}
                </p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-2 bg-red-500/[0.08] border border-red-500/25 rounded-xl px-3.5 py-2.5">
                <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                <p className="text-[12px] text-red-400">{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
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
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                : <><span>Create Account</span><ArrowRight size={14} /></>
              }
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[11px] font-mono text-white/20">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Login link */}
          <p className="text-center text-[13px] text-white/35">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </a>
          </p>
        </div>

        <p className="text-center text-[11px] font-mono text-white/15 mt-6">
          © {new Date().getFullYear()} HealthTrack
        </p>
      </div>
    </div>
  )
}