"use client"

import { signOut, useSession } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { Bell, LogOut, ChevronDown, Menu, Settings, User } from "lucide-react"
import Link from "next/link"

export function Header({ onMenuToggle }) {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const name  = session?.user?.name  || "User"
  const email = session?.user?.email || ""
  const role  = session?.user?.role  || "Member"
  const imageUrl = session?.user?.image || null
  const initial = name.charAt(0).toUpperCase()

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSignOut = async () => {
    setShowDropdown(false)
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="sticky top-0 z-20 bg-[#0b0b18]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between px-4 md:px-6 h-[60px] gap-4">

        {/* ── Left ── */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.09] hover:border-white/[0.14] transition-all duration-200"
          >
            <Menu size={16} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[11px] font-mono font-medium tracking-widest uppercase text-white/25">
              HealthTrack
            </span>
            <span className="hidden sm:block text-white/15">/</span>
            <span className="text-[14px] font-bold text-white/80 tracking-tight">
              Dashboard
            </span>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-2">

          {/* Notification bell */}
          <button
            aria-label="Notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200"
          >
            <Bell size={15} />
            {/* badge */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((v) => !v)}
              aria-label="User menu"
              className={`
                flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-all duration-200
                ${showDropdown
                  ? "bg-white/[0.08] border-violet-500/40 shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                  : "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.12]"
                }
              `}
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[12px] font-extrabold text-white shadow-[0_0_10px_rgba(124,58,237,0.4)] flex-shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="User"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              {/* Name — hidden on small */}
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-[13px] font-semibold text-white/85 leading-none truncate max-w-[120px]">{name}</p>
                <p className="text-[10px] text-white/30 font-mono mt-0.5 capitalize">{role}</p>
              </div>

              <ChevronDown
                size={13}
                className={`text-white/30 transition-transform duration-200 flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#12121f] border border-white/[0.09] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">

                {/* User info header */}
                <div className="px-4 py-3.5 border-b border-white/[0.07]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[13px] font-extrabold text-white shadow-[0_0_12px_rgba(124,58,237,0.35)] flex-shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-white truncate">{name}</p>
                      <p className="text-[11px] text-white/35 truncate">{email}</p>
                    </div>
                  </div>
                  <span className="inline-block mt-2.5 text-[10px] font-semibold tracking-wider uppercase bg-violet-500/15 text-violet-300 border border-violet-500/25 px-2 py-0.5 rounded-full capitalize">
                    {role}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1.5 px-1.5">
                  <Link href="dashboard/settings">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/55 hover:text-white/85 hover:bg-white/[0.05] transition-all duration-150 group">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors">
                      <User size={14} className="text-white/40 group-hover:text-white/70" />
                    </span>
                    Profile
                  </button>
                  </Link>
                  <Link href="dashboard/settings">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/55 hover:text-white/85 hover:bg-white/[0.05] transition-all duration-150 group">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors">
                      <Settings size={14} className="text-white/40 group-hover:text-white/70" />
                    </span>
                    Settings
                  </button>
                  </Link>
                </div>

                {/* Divider + Sign out */}
                <div className="border-t border-white/[0.07] py-1.5 px-1.5">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-150 group"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/[0.06] group-hover:bg-red-500/[0.12] transition-colors">
                      <LogOut size={14} className="text-red-400/60 group-hover:text-red-400" />
                    </span>
                    Sign Out
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}