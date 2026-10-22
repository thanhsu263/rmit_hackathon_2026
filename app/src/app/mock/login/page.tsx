'use client'

import React from 'react'
import Link from 'next/link'
import { CAST, AUTH_MODE } from '@/lib/auth/config'
import { mockSignIn } from '@/lib/auth/client'

const ROLE_METADATA: Record<string, {
  name: string
  badge: string
  badgeClass: string
  description: string
  icon: React.ReactNode
}> = {
  diglead: {
    name: "Marcus Thorne • Dig Lead",
    badge: "🔑 Holds selfencrypt",
    badgeClass: "badge badge-info",
    description: "Lead Archaeologist authorized to seal raw discovery coordinates with in-browser E2EE.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  heritage: {
    name: "Dr. Alistair Cross • Heritage Authority",
    badge: "🏛️ Steward 1 of 3",
    badgeClass: "badge",
    description: "State Heritage Steward responsible for evaluating cultural conservation & excavation requests.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="6" y1="21" x2="6" y2="9" />
        <line x1="10" y1="21" x2="10" y2="9" />
        <line x1="14" y1="21" x2="14" y2="9" />
        <line x1="18" y1="21" x2="18" y2="9" />
        <polygon points="12 2 2 7 22 7 12 2" />
      </svg>
    ),
  },
  custodian: {
    name: "Elder Kaelen Vane • Community Custodian",
    badge: "🛡️ Steward 2 of 3",
    badgeClass: "badge",
    description: "Indigenous Community Custodian safeguarding cultural heritage and sacred site sovereignty.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  researcher: {
    name: "Dr. Evelyn Vance • Field Researcher",
    badge: "🔒 2-of-3 Quorum Required",
    badgeClass: "badge badge-unsealed",
    description: "Academic researcher. Views 50 km generalized zone until 2-of-3 stewards grant decryption.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="22" y1="12" x2="18" y2="12" />
        <line x1="6" y1="12" x2="2" y2="12" />
        <line x1="12" y1="6" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="18" />
      </svg>
    ),
  },
}

export default function MockLoginPage() {
  if (AUTH_MODE !== 'mock') {
    return (
      <main className="container" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--ink-2)' }}>
        Simulated sign-in is only available in mock mode.
      </main>
    )
  }

  return (
    <main className="container" style={{ maxWidth: 640, margin: '48px auto', padding: '0 20px' }}>
      <div
        className="vault-card"
        style={{
          padding: '36px 32px',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 32px -4px rgba(245, 158, 11, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 500, letterSpacing: '-0.022em', color: 'var(--ink)', marginBottom: '8px' }}>
            Simulated Sign-In
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: 1.55, maxWidth: '480px', margin: '0 auto' }}>
            Choose a demo account to authenticate into the Custodian Vault. Each persona holds distinct cryptographic roles and quorum voting rights.
          </p>
        </div>

        {/* Persona Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CAST.map((c) => {
            const meta = ROLE_METADATA[c.username] || {
              name: c.title,
              badge: c.username,
              badgeClass: 'badge',
              description: `Demo user: ${c.username}`,
              icon: null,
            }

            return (
              <button
                key={c.username}
                type="button"
                onClick={() => mockSignIn(c.username)}
                className="role-card-btn"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Persona Icon */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </div>

                {/* Persona Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--ink)' }}>
                      {meta.name}
                    </strong>
                    <span className={meta.badgeClass} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      {meta.badge}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.45 }}>
                    {meta.description}
                  </p>
                </div>

                {/* Sign-in Arrow Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--accent)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  <span>Sign In</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
          <Link
            href="/"
            style={{
              color: 'var(--ink-3)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Return to Archaeological Sites
          </Link>
        </div>
      </div>
    </main>
  )
}
