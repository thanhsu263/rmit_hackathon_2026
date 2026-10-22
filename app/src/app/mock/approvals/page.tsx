'use client'
// MOCK mode stand-in for tide-console -> QEA Approvals: stewards file and authorize role changes (2 of 3).
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/client'
import { AUTH_MODE, CAST, ROLE_ADMIN, ROLE_DECRYPT, ROLE_ENCRYPT } from '@/lib/auth/config'

type CR = {
  id: string; kind: 'GRANT_ROLE' | 'REMOVE_ROLE'; role: string; target: string; proposedBy: string
  approvals: string[]; denials: string[]; status: string; createdAt: string; closedAt: string | null
}
type State = { roles: Record<string, string[]>; requests: CR[]; admins: string[]; quorum: number }

export default function MockApprovalsPage() {
  const { ready, authenticated, username, token, login } = useAuth()
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [kind, setKind] = useState<CR['kind']>('GRANT_ROLE')
  const [role, setRole] = useState(ROLE_DECRYPT)
  const [target, setTarget] = useState('researcher')

  const call = useCallback(async (body?: unknown) => {
    const res = await fetch('/api/mock/governance', {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
    return data
  }, [token])

  const load = useCallback(async () => {
    try { setState(await call()); setError('') } catch (e) { setError((e as Error).message) }
  }, [call])

  useEffect(() => { if (token) load() }, [token, load])

  const act = async (body: unknown) => {
    setBusy(true); setError('')
    try { await call(body); await load() } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  if (AUTH_MODE !== 'mock') return <main className="container" style={{ paddingTop: "64px", color: "var(--ink-2)" }}>In live mode, approvals happen in tide-console → QEA Approvals.</main>
  if (!ready) return <main className="container" style={{ paddingTop: "64px", color: "var(--ink-2)" }}>Loading…</main>
  if (!authenticated) return <main className="container" style={{ paddingTop: "64px" }}><button type="button" className="btn btn-primary" onClick={login}>Sign in</button></main>

  const isSteward = state?.roles[username]?.includes(ROLE_ADMIN) ?? false
  const pending = state?.requests.filter((r) => r.status === 'PENDING') ?? []
  const closed = state?.requests.filter((r) => r.status !== 'PENDING') ?? []

  return (
    <main className="container" style={{ maxWidth: "840px", paddingTop: "48px", paddingBottom: "64px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 500, letterSpacing: "-0.022em", color: "var(--ink)", marginBottom: "8px" }}>
          Simulated Approvals
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
          Stand-in for TideCloak&apos;s QEA Approvals. Any role change needs {state?.quorum ?? 2} of {state?.admins.length ?? 3} stewards.
          Signed in as <strong style={{ color: "var(--ink)" }}>{username}</strong>{isSteward ? ' (steward)' : ''}.
        </p>
      </div>

      {error && (
        <div className="alert-banner alert-banner-denied" role="alert" style={{ marginBottom: "24px" }}>
          <p>{error}</p>
        </div>
      )}

      {isSteward && (
        <section className="vault-card" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.018em", color: "var(--ink)", marginBottom: "16px" }}>
            File a Change Request
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.78rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                Action
              </label>
              <select className="demo-select" value={kind} onChange={(e) => setKind(e.target.value as CR['kind'])}>
                <option value="GRANT_ROLE">Grant role</option>
                <option value="REMOVE_ROLE">Remove role</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.78rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                Role
              </label>
              <select className="demo-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value={ROLE_DECRYPT}>{ROLE_DECRYPT}</option>
                <option value={ROLE_ENCRYPT}>{ROLE_ENCRYPT}</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.78rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                Target User
              </label>
              <select className="demo-select" value={target} onChange={(e) => setTarget(e.target.value)}>
                {CAST.map((c) => <option key={c.username} value={c.username}>{c.username}</option>)}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => act({ action: 'propose', kind, role, target })}
              style={{ alignSelf: "flex-end" }}
            >
              {busy ? 'Working…' : 'File Change Request'}
            </button>
          </div>
        </section>
      )}

      <section className="vault-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.018em", color: "var(--ink)", margin: 0 }}>
            Pending Requests ({pending.length})
          </h2>
        </div>
        {pending.length === 0 && <p style={{ color: "var(--ink-3)", fontSize: "0.88rem", margin: 0 }}>No pending change requests.</p>}
        {pending.map((r) => (
          <div key={r.id} style={{ borderTop: "1px solid var(--line)", padding: "16px 0" }}>
            <div style={{ color: "var(--ink)", fontWeight: 500, fontSize: "0.95rem", marginBottom: "4px" }}>
              <strong>{r.kind === 'GRANT_ROLE' ? 'Grant' : 'Remove'}</strong> {r.role} → <code style={{ color: "var(--ink-2)", fontFamily: "var(--font-mono)" }}>{r.target}</code>
            </div>
            <div style={{ color: "var(--ink-2)", fontSize: "0.84rem", lineHeight: 1.5 }}>
              Filed by {r.proposedBy} · Approvals {r.approvals.length}/{state?.quorum}: {r.approvals.join(', ') || 'None'}
              {r.denials.length > 0 && ` · Denied by ${r.denials.join(', ')}`}
            </div>
            {isSteward && !r.approvals.includes(username) && !r.denials.includes(username) && (
              <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => act({ action: 'decide', id: r.id, approve: true })}>
                  Authorize
                </button>
                <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => act({ action: 'decide', id: r.id, approve: false })}>
                  Deny
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="vault-card" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.018em", color: "var(--ink)", marginBottom: "16px" }}>
          Current Realm Roles
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {state && Object.entries(state.roles).map(([u, rs]) => (
            <div key={u} style={{ borderLeft: "2px solid var(--line)", paddingLeft: "12px" }}>
              <strong style={{ display: "block", color: "var(--ink)", fontSize: "0.88rem", fontWeight: 500 }}>{u}</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
                {rs.join(', ') || '—'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="vault-card">
        <h2 style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.018em", color: "var(--ink)", marginBottom: "16px" }}>
          Approval History
        </h2>
        {closed.length === 0 && <p style={{ color: "var(--ink-3)", fontSize: "0.88rem", margin: 0 }}>Nothing committed or denied yet.</p>}
        {closed.map((r) => (
          <div key={r.id} style={{ borderTop: "1px solid var(--line)", padding: "12px 0", fontSize: "0.86rem", color: "var(--ink-2)" }}>
            <span style={{ color: r.status === 'APPROVED' ? 'var(--ok)' : 'var(--no)', fontWeight: 500 }}>{r.status}</span> · {r.kind === 'GRANT_ROLE' ? 'Grant' : 'Remove'} {r.role} → {r.target} · Approved by {r.approvals.join(', ')}
            {r.closedAt && ` · ${new Date(r.closedAt).toLocaleTimeString()}`}
          </div>
        ))}
      </section>
    </main>
  )
}
