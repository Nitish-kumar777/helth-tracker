"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Camera, User, Lock, Mail, Check, X, Loader2,
  Eye, EyeOff, Shield, AlertCircle, CheckCircle2,
  Pencil, KeyRound, RefreshCw, Sparkles, ArrowRight,
  Upload
} from "lucide-react"

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile",  label: "Profile",  icon: <User    size={15} /> },
  { id: "security", label: "Security", icon: <Lock    size={15} /> },
  { id: "email",    label: "Email",    icon: <Mail    size={15} /> },
]

// ── Input ─────────────────────────────────────────────────────────────────────
function Field({ label, hint, error, success, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/30">
          {label}
        </label>
      )}
      {children}
      {error   && <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle  size={10}/>{error}</p>}
      {success && <p className="text-[11px] text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10}/>{success}</p>}
      {hint && !error && !success && <p className="text-[11px] text-white/20">{hint}</p>}
    </div>
  )
}

function Input({ icon, right, className = "", ...props }) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">{icon}</div>}
      <input
        className={`
          w-full bg-white/[0.04] border border-white/[0.09] rounded-xl
          ${icon ? "pl-10" : "px-4"} ${right ? "pr-10" : "pr-4"} py-2.5
          text-[13.5px] text-white placeholder-white/20
          focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06]
          focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]
          transition-all duration-200 ${className}
        `}
        {...props}
      />
      {right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  )
}

function Btn({ variant = "primary", loading, icon, children, className = "", ...props }) {
  const base = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.5)] hover:-translate-y-px active:translate-y-0",
    secondary: "bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.09] hover:border-white/[0.16]",
    danger: "bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25",
    success: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25",
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ── OTP input ─────────────────────────────────────────────────────────────────
function OtpInput({ length = 6, value, onChange }) {
  const inputs = useRef([])
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length)

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }
  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[i] = val
    onChange(next.join(""))
    if (val && i < length - 1) inputs.current[i + 1]?.focus()
  }
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    onChange(pasted)
    inputs.current[Math.min(pasted.length, length - 1)]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`
            w-11 h-12 text-center text-[18px] font-bold font-mono rounded-xl border
            bg-white/[0.04] text-white
            focus:outline-none focus:border-violet-500/70 focus:bg-white/[0.07]
            focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]
            transition-all duration-200
            ${d ? "border-violet-500/50 bg-violet-500/[0.08]" : "border-white/[0.09]"}
          `}
        />
      ))}
    </div>
  )
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ session }) {
  const { update } = useSession()
  const [name,       setName]       = useState(session?.user?.name  || "")
  const [preview,    setPreview]    = useState(session?.user?.image || null)
  const [file,       setFile]       = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [msg,        setMsg]        = useState({ type: "", text: "" })
  const fileRef = useRef(null)

  const initial = (session?.user?.name || "U").charAt(0).toUpperCase()

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setMsg({ type:"error", text:"Image must be under 5MB" }); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setMsg({ type:"", text:"" })
  }

  const handleSave = async () => {
    if (!name.trim()) { setMsg({ type:"error", text:"Name cannot be empty" }); return }
    setSaving(true); setMsg({ type:"", text:"" })
    try {
      let imageUrl = session?.user?.image || null
      const body = { name: name.trim() }

      // Upload to Cloudinary first if new file selected
      if (file) {
        setUploading(true)
        const form = new FormData()
        form.append("file", file)
        const upRes  = await fetch("/api/settings/upload-avatar", { method:"POST", body: form })
        if (!upRes.ok) throw new Error("Image upload failed")
        const upData = await upRes.json()
        imageUrl = upData.url
        body.image = imageUrl
        setUploading(false)
      }

      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed to update")
      await update({ name: name.trim(), image: imageUrl })
      setFile(null)
      setMsg({ type:"success", text:"Profile updated successfully!" })
    } catch (e) {
      setMsg({ type:"error", text: e.message })
    } finally {
      setSaving(false); setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_0_24px_rgba(124,58,237,0.35)]">
            {preview
              ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white">{initial}</div>
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 -right-2 flex items-center justify-center w-8 h-8 rounded-xl bg-violet-600 border-2 border-[#0b0b18] text-white hover:bg-violet-500 transition-all shadow-lg"
          >
            <Camera size={13} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[14px] font-bold text-white">{session?.user?.name}</p>
          <p className="text-[12px] text-white/30">{session?.user?.email}</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-400/70 hover:text-violet-400 transition-colors mt-1"
          >
            <Upload size={11} /> Upload new photo
          </button>
          <p className="text-[10px] text-white/20">JPG, PNG or WebP — max 5MB</p>
        </div>
      </div>

      {/* Name */}
      <Field label="Display Name" error={msg.type==="error" ? msg.text : ""} success={msg.type==="success" ? msg.text : ""}>
        <Input
          icon={<Pencil size={14}/>}
          placeholder="Your full name"
          value={name}
          onChange={e => { setName(e.target.value); setMsg({ type:"", text:"" }) }}
        />
      </Field>

      {/* Email (read-only here, managed in Email tab) */}
      <Field label="Email Address" hint="To change your email, go to the Email tab">
        <Input
          icon={<Mail size={14}/>}
          value={session?.user?.email || ""}
          disabled
          className="opacity-40 cursor-not-allowed"
        />
      </Field>

      <Btn
        variant="primary"
        loading={saving || uploading}
        icon={<Check size={14}/>}
        onClick={handleSave}
        className="w-full sm:w-auto"
      >
        {uploading ? "Uploading…" : saving ? "Saving…" : "Save Changes"}
      </Btn>
    </div>
  )
}

// ── Security Tab (Password) ───────────────────────────────────────────────────
function SecurityTab() {
  const [step,        setStep]        = useState("idle")  // idle | sending | code | newpw | done
  const [codeSent,    setCodeSent]    = useState(false)
  const [otp,         setOtp]         = useState("")
  const [newPw,       setNewPw]       = useState("")
  const [confirmPw,   setConfirmPw]   = useState("")
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [resendCd,    setResendCd]    = useState(0)
  const [msg,         setMsg]         = useState({ type:"", text:"" })

  // Countdown timer
  useEffect(() => {
    if (resendCd <= 0) return
    const t = setTimeout(() => setResendCd(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCd])

  const sendCode = async () => {
    setLoading(true); setMsg({ type:"", text:"" })
    try {
      const res = await fetch("/api/settings/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password" }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed to send code")
      setCodeSent(true); setStep("code"); setResendCd(60)
    } catch(e) { setMsg({ type:"error", text: e.message }) }
    finally { setLoading(false) }
  }

  const verifyCode = async () => {
    if (otp.length < 6) { setMsg({ type:"error", text:"Enter the full 6-digit code" }); return }
    setLoading(true); setMsg({ type:"", text:"" })
    try {
      const res = await fetch("/api/settings/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type:"password", code: otp }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Invalid code")
      setStep("newpw")
    } catch(e) { setMsg({ type:"error", text: e.message }) }
    finally { setLoading(false) }
  }

  const changePassword = async () => {
    if (newPw.length < 8) { setMsg({ type:"error", text:"Password must be at least 8 characters" }); return }
    if (newPw !== confirmPw) { setMsg({ type:"error", text:"Passwords don't match" }); return }
    setLoading(true); setMsg({ type:"", text:"" })
    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otp, newPassword: newPw }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed to update password")
      setStep("done")
    } catch(e) { setMsg({ type:"error", text: e.message }) }
    finally { setLoading(false) }
  }

  const pwStrength = (pw) => {
    let score = 0
    if (pw.length >= 8)   score++
    if (pw.length >= 12)  score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }
  const strength = pwStrength(newPw)
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength] || ""
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500", "bg-emerald-400"][strength] || ""

  if (step === "done") return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30">
        <CheckCircle2 size={28} className="text-emerald-400" />
      </div>
      <div>
        <p className="text-[16px] font-bold text-white">Password updated!</p>
        <p className="text-[13px] text-white/30 mt-1">Your new password is active. Stay safe!</p>
      </div>
      <Btn variant="secondary" icon={<RefreshCw size={13}/>} onClick={() => { setStep("idle"); setOtp(""); setNewPw(""); setConfirmPw("") }}>
        Change again
      </Btn>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {["Request Code","Verify","New Password"].map((s, i) => {
          const stepIdx = step==="idle"?0:step==="code"||step==="sending"?1:2
          const done = i < stepIdx
          const active = i === stepIdx
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border transition-all ${
                done   ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                active ? "bg-violet-600/30 border-violet-500/50 text-violet-300" :
                         "bg-white/[0.04] border-white/[0.1] text-white/20"
              }`}>
                {done ? <Check size={11}/> : i+1}
              </div>
              <span className={`text-[11px] font-semibold hidden sm:block ${active?"text-white/70":done?"text-emerald-400/60":"text-white/20"}`}>{s}</span>
              {i < 2 && <div className={`flex-1 h-px ${done?"bg-emerald-500/30":"bg-white/[0.07]"}`}/>}
            </div>
          )
        })}
      </div>

      {/* Step: idle — request code */}
      {step === "idle" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex items-start gap-3">
            <Shield size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-white/80">We'll send a verification code</p>
              <p className="text-[12px] text-white/35 mt-0.5">A 6-digit code will be emailed to your account address to confirm it's you.</p>
            </div>
          </div>
          {msg.text && <p className="text-[12px] text-red-400 flex items-center gap-1.5"><AlertCircle size={12}/>{msg.text}</p>}
          <Btn variant="primary" loading={loading} icon={<KeyRound size={14}/>} onClick={sendCode} className="w-full">
            Send Verification Code
          </Btn>
        </div>
      )}

      {/* Step: code — enter OTP */}
      {step === "code" && (
        <div className="space-y-5">
          <div className="text-center space-y-1.5">
            <p className="text-[14px] font-semibold text-white/80">Check your inbox</p>
            <p className="text-[12px] text-white/30">Enter the 6-digit code we sent to your email</p>
          </div>
          <OtpInput length={6} value={otp} onChange={setOtp} />
          {msg.text && <p className="text-[12px] text-red-400 flex items-center gap-1.5 justify-center"><AlertCircle size={12}/>{msg.text}</p>}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Btn variant="primary" loading={loading} icon={<ArrowRight size={14}/>} onClick={verifyCode} className="flex-1">
              Verify Code
            </Btn>
            <Btn variant="secondary" disabled={resendCd > 0 || loading} icon={<RefreshCw size={13}/>} onClick={sendCode} className="flex-1">
              {resendCd > 0 ? `Resend in ${resendCd}s` : "Resend Code"}
            </Btn>
          </div>
        </div>
      )}

      {/* Step: newpw — set new password */}
      {step === "newpw" && (
        <div className="space-y-4">
          <Field label="New Password">
            <Input
              type={showPw ? "text" : "password"}
              icon={<Lock size={14}/>}
              placeholder="Min. 8 characters"
              value={newPw}
              onChange={e => { setNewPw(e.target.value); setMsg({ type:"", text:"" }) }}
              right={
                <button type="button" onClick={()=>setShowPw(v=>!v)} className="text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              }
            />
            {newPw && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i=>(
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i<=strength ? strengthColor : "bg-white/[0.07]"}`}/>
                  ))}
                </div>
                <p className={`text-[10px] font-semibold ${strengthColor.replace("bg-","text-")}`}>{strengthLabel}</p>
              </div>
            )}
          </Field>
          <Field
            label="Confirm Password"
            error={msg.type==="error" ? msg.text : ""}
            success={confirmPw && confirmPw===newPw ? "Passwords match" : ""}
          >
            <Input
              type={showConfirm ? "text" : "password"}
              icon={<Lock size={14}/>}
              placeholder="Repeat new password"
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setMsg({ type:"", text:"" }) }}
              right={
                <button type="button" onClick={()=>setShowConfirm(v=>!v)} className="text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              }
            />
          </Field>
          <Btn variant="primary" loading={loading} icon={<Shield size={14}/>} onClick={changePassword} className="w-full">
            Update Password
          </Btn>
        </div>
      )}
    </div>
  )
}

// ── Email Tab ─────────────────────────────────────────────────────────────────
function EmailTab({ session }) {
  const { update } = useSession()
  const [step,      setStep]      = useState("idle")  // idle | code | verify | done
  const [newEmail,  setNewEmail]  = useState("")
  const [otp,       setOtp]       = useState("")
  const [loading,   setLoading]   = useState(false)
  const [resendCd,  setResendCd]  = useState(0)
  const [msg,       setMsg]       = useState({ type:"", text:"" })
  const isVerified = session?.user?.emailVerified

  useEffect(() => {
    if (resendCd <= 0) return
    const t = setTimeout(() => setResendCd(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCd])

  const sendChangeCode = async () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(newEmail)) { setMsg({ type:"error", text:"Enter a valid email address" }); return }
    setLoading(true); setMsg({ type:"", text:"" })
    try {
      const res = await fetch("/api/settings/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email-change", newEmail }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed to send code")
      setStep("code"); setResendCd(60)
    } catch(e) { setMsg({ type:"error", text: e.message }) }
    finally { setLoading(false) }
  }

  const verifyChange = async () => {
    if (otp.length < 6) { setMsg({ type:"error", text:"Enter the full 6-digit code" }); return }
    setLoading(true); setMsg({ type:"", text:"" })
    try {
      const res = await fetch("/api/settings/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otp, newEmail }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Invalid or expired code")
      await update({ email: newEmail })
      setStep("done")
    } catch(e) { setMsg({ type:"error", text: e.message }) }
    finally { setLoading(false) }
  }

  const resendVerification = async () => {
    setLoading(true); setMsg({ type:"", text:"" })
    try {
      const res = await fetch("/api/settings/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "verify-email" }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed to send")
      setMsg({ type:"success", text:"Verification email sent! Check your inbox." })
      setResendCd(60)
    } catch(e) { setMsg({ type:"error", text: e.message }) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">

      {/* Current email + verified badge */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] flex-shrink-0">
          <Mail size={15} className="text-white/40" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-white/30 uppercase tracking-wider font-semibold">Current Email</p>
          <p className="text-[14px] font-semibold text-white truncate mt-0.5">{session?.user?.email}</p>
        </div>
        {isVerified
          ? <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full flex-shrink-0">
              <CheckCircle2 size={11}/> Verified
            </span>
          : <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full flex-shrink-0">
              <AlertCircle size={11}/> Unverified
            </span>
        }
      </div>

      {/* Verify current email (if unverified) */}
      {!isVerified && step === "idle" && (
        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-amber-300">Email not verified</p>
              <p className="text-[12px] text-amber-400/60 mt-0.5">Verify your email to secure your account and enable all features.</p>
            </div>
          </div>
          {msg.type==="success" && <p className="text-[12px] text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={11}/>{msg.text}</p>}
          {msg.type==="error"   && <p className="text-[12px] text-red-400 flex items-center gap-1.5"><AlertCircle size={11}/>{msg.text}</p>}
          <Btn variant="success" loading={loading} disabled={resendCd > 0} icon={<Mail size={13}/>} onClick={resendVerification}>
            {resendCd > 0 ? `Resend in ${resendCd}s` : "Send Verification Email"}
          </Btn>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/[0.06]" />

      {/* Change email section */}
      <div>
        <p className="text-[13px] font-bold text-white mb-1">Change Email Address</p>
        <p className="text-[12px] text-white/30 mb-4">A verification code will be sent to your new email address.</p>

        {(step==="idle"||step==="code") && (
          <div className="space-y-4">
            <Field label="New Email Address" error={msg.type==="error"&&step==="idle"?msg.text:""}>
              <Input
                icon={<Mail size={14}/>}
                type="email"
                placeholder="new@email.com"
                value={newEmail}
                onChange={e=>{ setNewEmail(e.target.value); setMsg({ type:"", text:"" }) }}
                disabled={step==="code"}
              />
            </Field>

            {step==="idle" && (
              <Btn variant="primary" loading={loading} icon={<ArrowRight size={14}/>} onClick={sendChangeCode} className="w-full sm:w-auto">
                Send Verification Code
              </Btn>
            )}

            {step==="code" && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <p className="text-[13px] font-semibold text-white/70">Code sent to <span className="text-violet-300">{newEmail}</span></p>
                  <p className="text-[12px] text-white/25">Enter the 6-digit code to confirm your new email</p>
                </div>
                <OtpInput length={6} value={otp} onChange={setOtp} />
                {msg.type==="error" && <p className="text-[12px] text-red-400 flex items-center gap-1.5 justify-center"><AlertCircle size={12}/>{msg.text}</p>}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Btn variant="primary" loading={loading} icon={<Check size={14}/>} onClick={verifyChange} className="flex-1">
                    Confirm Change
                  </Btn>
                  <Btn variant="secondary" disabled={resendCd>0||loading} icon={<RefreshCw size={13}/>} onClick={sendChangeCode} className="flex-1">
                    {resendCd>0?`Resend in ${resendCd}s`:"Resend"}
                  </Btn>
                  <Btn variant="secondary" onClick={()=>{setStep("idle");setOtp("");setMsg({type:"",text:""})}} className="flex-1">
                    Cancel
                  </Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {step==="done" && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-3xl bg-emerald-500/15 border border-emerald-500/30">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white">Email changed!</p>
              <p className="text-[12px] text-white/30 mt-1">Your account now uses <span className="text-violet-300">{newEmail}</span></p>
            </div>
            <Btn variant="secondary" icon={<RefreshCw size={13}/>} onClick={()=>{setStep("idle");setNewEmail("");setOtp("")}}>
              Change again
            </Btn>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-[120px] -z-0" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-700/8 blur-[100px] -z-0" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-10 space-y-6">

        {/* Page header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={13} className="text-violet-400" />
            <span className="text-[10px] font-mono font-semibold tracking-[0.22em] uppercase text-white/25">Account</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-[13px] text-white/35 mt-1">Manage your profile, password and email address.</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                text-[12.5px] font-semibold transition-all duration-200
                ${activeTab === t.id
                  ? "bg-violet-600/25 text-violet-300 border border-violet-500/40 shadow-[0_2px_8px_rgba(124,58,237,0.2)]"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                }
              `}
            >
              <span className="flex-shrink-0">{t.icon}</span>
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-5 md:p-6">
          {activeTab === "profile"  && <ProfileTab  session={session} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "email"    && <EmailTab    session={session} />}
        </div>

      </div>
    </div>
  )
}