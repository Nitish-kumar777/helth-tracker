"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  Zap, Loader2, AlertCircle, CheckCircle2, KeyRound,
  RefreshCw, Shield
} from "lucide-react"

// ── OTP Input ─────────────────────────────────────────────────────────────────
function OtpInput({ length = 6, value, onChange }) {
  const refs = []
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length)

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1)
    const next = [...digits]; next[i] = val
    onChange(next.join(""))
    if (val && i < length - 1) refs[i + 1]?.focus()
  }
  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1]?.focus()
  }
  const handlePaste = (e) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    onChange(p)
    refs[Math.min(p.length, length - 1)]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className={`
            w-11 h-12 text-center text-[18px] font-bold font-mono rounded-xl border
            bg-white/[0.04] text-white transition-all duration-200
            focus:outline-none focus:bg-white/[0.07]
            focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]
            ${d ? "border-violet-500/50 bg-violet-500/[0.08] text-violet-200"
                : "border-white/[0.09] focus:border-violet-500/60"}
          `}
        />
      ))}
    </div>
  )
}

// ── Password strength ─────────────────────────────────────────────────────────
function pwStrength(pw) {
  let s = 0
  if (pw.length >= 8)           s++
  if (pw.length >= 12)          s++
  if (/[A-Z]/.test(pw))         s++
  if (/[0-9]/.test(pw))         s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const BAR_COLORS   = ["","bg-red-500","bg-amber-500","bg-yellow-400","bg-emerald-500","bg-emerald-400"]
const STRENGTH_TXT = ["","Weak","Fair","Good","Strong","Very Strong"]
const STRENGTH_CLR = ["","text-red-400","text-amber-400","text-yellow-400","text-emerald-400","text-emerald-300"]

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step,       setStep]      = useState("email")   // email | code | reset | done
  const [email,      setEmail]     = useState("")
  const [otp,        setOtp]       = useState("")
  const [newPw,      setNewPw]     = useState("")
  const [confirmPw,  setConfirmPw] = useState("")
  const [showPw,     setShowPw]    = useState(false)
  const [showCpw,    setShowCpw]   = useState(false)
  const [loading,    setLoading]   = useState(false)
  const [resendCd,   setResendCd]  = useState(0)
  const [error,      setError]     = useState("")
  const [success,    setSuccess]   = useState("")

  useEffect(() => {
    if (resendCd <= 0) return
    const t = setTimeout(() => setResendCd(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCd])

  const strength = pwStrength(newPw)

  // ── Step 1: send reset code ───────────────────────────────────────────────
  const handleSendCode = async (e) => {
    e.preventDefault()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) { setError("Enter a valid email address"); return }
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed to send code")
      setStep("code"); setResendCd(60)
      setSuccess("Code sent! Check your inbox.")
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── Step 2: verify code ───────────────────────────────────────────────────
  const handleVerifyCode = async () => {
    if (otp.length < 6) { setError("Enter the full 6-digit code"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code: otp }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Invalid code")
      setStep("reset"); setSuccess("")
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── Step 3: set new password ──────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPw.length < 8)   { setError("Password must be at least 8 characters"); return }
    if (newPw !== confirmPw) { setError("Passwords don't match"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code: otp, newPassword: newPw }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed to reset password")
      setStep("done")
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const resendCode = async () => {
    setLoading(true); setError(""); setSuccess("")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed")
      setResendCd(60); setSuccess("New code sent!")
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── Step indicator ────────────────────────────────────────────────────────
  const steps = ["Send Code", "Verify", "New Password"]
  const stepIdx = { email:0, code:1, reset:2, done:2 }[step]

  return (
    <div className="min-h-screen bg-[#08080f] text-white flex items-center justify-center px-4 py-12">
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
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/25 mt-0.5">password reset</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-sm">

          {/* Step bar */}
          {step !== "done" && (
            <div className="flex items-center gap-2 mb-7">
              {steps.map((s, i) => {
                const done   = i < stepIdx
                const active = i === stepIdx
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border transition-all flex-shrink-0 ${
                      done   ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                      active ? "bg-violet-600/30 border-violet-500/50 text-violet-300" :
                               "bg-white/[0.04] border-white/[0.1] text-white/20"
                    }`}>
                      {done ? <CheckCircle2 size={12}/> : i + 1}
                    </div>
                    <span className={`text-[11px] font-semibold hidden sm:block ${
                      active ? "text-white/70" : done ? "text-emerald-400/60" : "text-white/20"
                    }`}>{s}</span>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-px ${done ? "bg-emerald-500/30" : "bg-white/[0.07]"}`}/>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Step: email ── */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <h1 className="text-[22px] font-extrabold tracking-tight text-white">Forgot password?</h1>
                <p className="text-[13px] text-white/35 mt-1">Enter your email and we'll send a reset code.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"/>
                  <input
                    type="email" required placeholder="you@example.com"
                    value={email} onChange={e => { setEmail(e.target.value); setError("") }}
                    disabled={loading}
                    className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-10 pr-4 py-2.5 text-[13.5px] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] disabled:opacity-50 transition-all duration-200"
                  />
                </div>
              </div>

              {error   && <p className="text-[12px] text-red-400 flex items-center gap-1.5"><AlertCircle  size={12}/>{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13.5px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)] hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"/>
                {loading ? <><Loader2 size={15} className="animate-spin"/> Sending…</> : <><KeyRound size={14}/>Send Reset Code</>}
              </button>
            </form>
          )}

          {/* ── Step: code ── */}
          {step === "code" && (
            <div className="space-y-5">
              <div>
                <h1 className="text-[22px] font-extrabold tracking-tight text-white">Check your inbox</h1>
                <p className="text-[13px] text-white/35 mt-1">
                  We sent a 6-digit code to <span className="text-violet-300 font-semibold">{email}</span>
                </p>
              </div>

              <OtpInput length={6} value={otp} onChange={v => { setOtp(v); setError("") }}/>

              {error   && <p className="text-[12px] text-red-400 flex items-center gap-1.5 justify-center"><AlertCircle  size={12}/>{error}</p>}
              {success && <p className="text-[12px] text-emerald-400 flex items-center gap-1.5 justify-center"><CheckCircle2 size={12}/>{success}</p>}

              <div className="flex flex-col gap-2.5">
                <button onClick={handleVerifyCode} disabled={loading || otp.length < 6}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13.5px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)] hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"/>
                  {loading ? <><Loader2 size={15} className="animate-spin"/> Verifying…</> : <><ArrowRight size={14}/>Verify Code</>}
                </button>
                <button onClick={resendCode} disabled={resendCd > 0 || loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.09] text-[13px] font-semibold text-white/45 hover:text-white/70 hover:bg-white/[0.07] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <RefreshCw size={13}/>
                  {resendCd > 0 ? `Resend in ${resendCd}s` : "Resend Code"}
                </button>
              </div>

              <button onClick={() => { setStep("email"); setOtp(""); setError("") }}
                className="flex items-center gap-1.5 text-[12px] text-white/25 hover:text-white/50 transition-colors mx-auto">
                <ArrowLeft size={12}/> Back
              </button>
            </div>
          )}

          {/* ── Step: reset ── */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <h1 className="text-[22px] font-extrabold tracking-tight text-white">New password</h1>
                <p className="text-[13px] text-white/35 mt-1">Choose a strong password for your account.</p>
              </div>

              {/* New pw */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"/>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={newPw} onChange={e => { setNewPw(e.target.value); setError("") }}
                    disabled={loading}
                    className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-10 pr-10 py-2.5 text-[13.5px] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] disabled:opacity-50 transition-all duration-200"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                {newPw && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength ? BAR_COLORS[strength] : "bg-white/[0.07]"}`}/>
                      ))}
                    </div>
                    {strength > 0 && <p className={`text-[10px] font-bold ${STRENGTH_CLR[strength]}`}>{STRENGTH_TXT[strength]}</p>}
                  </div>
                )}
              </div>

              {/* Confirm pw */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"/>
                  <input
                    type={showCpw ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setError("") }}
                    disabled={loading}
                    className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-10 py-2.5 text-[13.5px] text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] disabled:opacity-50 transition-all duration-200 ${
                      confirmPw && confirmPw === newPw
                        ? "border-emerald-500/50 focus:border-emerald-500/70"
                        : "border-white/[0.09] focus:border-violet-500/60"
                    }`}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowCpw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showCpw ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                  {confirmPw && confirmPw === newPw && (
                    <CheckCircle2 size={13} className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-400"/>
                  )}
                </div>
              </div>

              {error && <p className="text-[12px] text-red-400 flex items-center gap-1.5"><AlertCircle size={12}/>{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13.5px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)] hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"/>
                {loading ? <><Loader2 size={15} className="animate-spin"/> Updating…</> : <><Shield size={14}/>Update Password</>}
              </button>
            </form>
          )}

          {/* ── Step: done ── */}
          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/25 shadow-[0_0_32px_rgba(52,211,153,0.2)]">
                <CheckCircle2 size={28} className="text-emerald-400"/>
              </div>
              <div className="space-y-1.5">
                <p className="text-[20px] font-extrabold text-white">Password updated!</p>
                <p className="text-[13px] text-white/35">Your new password is active. You can sign in now.</p>
              </div>
              <button onClick={() => router.push("/login")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)] hover:-translate-y-px transition-all relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"/>
                <ArrowRight size={14}/> Go to Sign In
              </button>
            </div>
          )}

          {/* Back to login */}
          {step !== "done" && (
            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              <a href="/login" className="text-[13px] text-white/30 hover:text-white/55 transition-colors flex items-center justify-center gap-1.5">
                <ArrowLeft size={12}/> Back to Sign In
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] font-mono text-white/15 mt-6">
          © {new Date().getFullYear()} HealthTrack
        </p>
      </div>
    </div>
  )
}