// lib/email.js
// Sends transactional emails via Nodemailer + Gmail OAuth2 / SMTP
// Set these in your .env:
//
//   EMAIL_FROM=Habit Tracker <noreply@yourdomain.com>
//
//   ── Option A: Gmail App Password (simplest) ──────────────────────────────
//   EMAIL_HOST=smtp.gmail.com
//   EMAIL_PORT=465
//   EMAIL_SECURE=true
//   EMAIL_USER=your@gmail.com
//   EMAIL_PASS=xxxx xxxx xxxx xxxx     ← 16-char App Password
//
//   ── Option B: Any SMTP (Resend, Mailgun, SendGrid, Brevo, etc.) ──────────
//   EMAIL_HOST=smtp.resend.com         (or smtp.mailgun.org, etc.)
//   EMAIL_PORT=465
//   EMAIL_SECURE=true
//   EMAIL_USER=resend                  (provider-specific)
//   EMAIL_PASS=re_xxxxxxxxxxxx         ← API key used as password
//
// Usage:
//   import { sendEmail } from "@/lib/email"
//   await sendEmail({ to: "user@example.com", subject: "Hello", html: "<p>Hi</p>" })

import nodemailer from "nodemailer"

// ── Singleton transporter ─────────────────────────────────────────────────────
let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter

  const required = ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS", "EMAIL_FROM"]
  const missing  = required.filter((k) => !process.env[k])
  if (missing.length) {
    throw new Error(`[email] Missing env vars: ${missing.join(", ")}`)
  }

  _transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT  || "465"),
    secure: process.env.EMAIL_SECURE !== "false",   // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  return _transporter
}

// ── Base template wrapper ─────────────────────────────────────────────────────
function wrapTemplate(html, preheader = "") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Habit Tracker</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#08080f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:#08080f;">${preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080f;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px;padding:10px 14px;vertical-align:middle;">
                    <span style="font-size:20px;color:#fff;">⚡</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Habit Tracker</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0f0f1e;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:36px 32px;">
              ${html}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;font-family:monospace;">
                © ${new Date().getFullYear()} Habit Tracker · You're receiving this because you have an account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Pre-built templates ───────────────────────────────────────────────────────

/** OTP code email (password reset / email change / email verify) */
function otpTemplate({ code, title, subtitle, note }) {
  const digits = code.split("").map((d) => `
    <td style="
      background:rgba(124,58,237,0.1);
      border:1px solid rgba(124,58,237,0.3);
      border-radius:10px;
      width:44px;height:52px;
      text-align:center;vertical-align:middle;
      font-size:26px;font-weight:900;
      color:#a78bfa;
      font-family:monospace;
      padding:0 4px;
    ">${d}</td>
  `).join('<td style="width:6px;"></td>')

  return wrapTemplate(`
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;">${title}</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:14px;margin:0 0 32px;line-height:1.6;">${subtitle}</p>

    <!-- OTP boxes -->
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
      <tr>${digits}</tr>
    </table>

    <!-- Expiry note -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px 16px;margin-bottom:24px;">
      <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;text-align:center;">
        ⏱ ${note}
      </p>
    </div>

    <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;text-align:center;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `, `Your ${title} code: ${code}`)
}

// ── Public sendEmail function ─────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {string}  opts.to       Recipient email address
 * @param {string}  opts.subject  Email subject line
 * @param {string}  [opts.html]   Raw HTML body (overrides template)
 * @param {string}  [opts.text]   Plain-text fallback
 * @param {object}  [opts.template]  Use a built-in template instead of raw html
 *   template.type: "otp"
 *   template.data: { code, title, subtitle, note }
 */
export async function sendEmail({ to, subject, html, text, template }) {
  const transporter = getTransporter()

  let finalHtml = html

  if (template?.type === "otp") {
    finalHtml = otpTemplate(template.data)
  }

  if (!finalHtml) throw new Error("[email] No html or template provided")

  const info = await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject,
    html:    finalHtml,
    text:    text || finalHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  })

  if (process.env.NODE_ENV === "development") {
    console.log(`[email] Sent to ${to} — Message ID: ${info.messageId}`)
  }

  return info
}

// ── Convenience helpers (used by the settings API routes) ────────────────────

export function sendPasswordResetCode(to, code) {
  return sendEmail({
    to,
    subject: "Habit Tracker — Password Reset Code",
    template: {
      type: "otp",
      data: {
        code,
        title:    "Reset Your Password",
        subtitle: "Use the 6-digit code below to reset your Habit Tracker password.",
        note:     "This code expires in 10 minutes.",
      },
    },
  })
}

export function sendEmailChangeCode(to, code) {
  return sendEmail({
    to,
    subject: "Habit Tracker — Confirm Email Change",
    template: {
      type: "otp",
      data: {
        code,
        title:    "Confirm Your New Email",
        subtitle: "Enter this code in Habit Tracker to confirm your new email address.",
        note:     "This code expires in 10 minutes. Your email won't change until you enter it.",
      },
    },
  })
}



export function sendVerificationEmail(to, code) {
  return sendEmail({
    to,
    subject: "Habit Tracker — Verify Your Email",
    template: {
      type: "otp",
      data: {
        code,
        title:    "Verify Your Email",
        subtitle: "Enter this code in Habit Tracker to verify your email address.",
        note:     "This code expires in 10 minutes.",
      },
    },
  })
}