'use client'
// MOCK mode stand-in for tide-console -> QEA Approvals: stewards file and authorize role changes (2 of 3).
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/client'
import { AUTH_MODE, CAST, ROLE_ADMIN, ROLE_DECRYPT, ROLE_ENCRYPT } from '@/lib/auth/config'
import { StewardSeals } from '@/components/StewardSeals'

type CR = {
  id: string; kind: 'GRANT_ROLE' | 'REMOVE_ROLE'; role: string; target: string; proposedBy: string
  approvals: string[]; denials: string[]; status: string; createdAt: string; closedAt: string | null
}
type State = { roles: Record<string, string[]>; requests: CR[]; admins: string[]; quorum: number }

const fieldLabel = { fontSize: '0.74rem', color: 'var(--ink-3)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontWeight: 500 }

function ChangeLabel({ r }: { r: CR }) {
  return (
    <>
      {r.kind === 'GRANT_ROLE' ? 'Grant' : 'Remove'} <span className="mono" style={{ fontSize: '0.8em' }}>{r.role}</span>{' '}
      {r.kind === 'GRANT_ROLE' ? 'to' : 'from'} <strong style={{ fontWeight: 500 }}>{r.target}</strong>
    </>
  )
}

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

  if (AUTH_MODE !== 'mock') return <main className="container" style={{ paddingTop: '64px', color: 'var(--ink-2)' }}>In live mode, approvals happen in tide-console → QEA Approvals.</main>
  if (!ready) return <main className="container" style={{ paddingTop: '64px', color: 'var(--ink-2)' }}>Loading…</main>
  if (!authenticated) return <main className="container" style={{ paddingTop: '64px' }}><button type="button" className="btn btn-primary" onClick={login}>Sign in</button></main>

  const isSteward = state?.roles[username]?.includes(ROLE_ADMIN) ?? false
  const pending = state?.requests.filter((r) => r.status === 'PENDING') ?? []
  const closed = state?.requests.filter((r) => r.status !== 'PENDING') ?? []

  return (
    <main className="container rise-in" style={{ maxWidth: '920px', paddingBottom: '64px' }}>
      <header style={{ marginBottom: '36px' }}>
        <span className="eyebrow">Simulated approvals · stand-in for TideCloak QEA</span>
        <h1 style={{ margin: '10px 0 12px' }}>No one opens it alone.</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: '1.02rem', maxWidth: '60ch' }}>
          Every role change needs {state?.quorum ?? 2} of {state?.admins.length ?? 3} steward seals. You are signed in as{' '}
          <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{username}</strong>{isSteward ? ', a steward' : ''}.
        </p>
      </header>

      {error && (
        <div className="alert-banner alert-banner-denied" role="alert">
          <p>{error}</p>
        </div>
      )}

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px' }}>
          Waiting for seals <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-sans)', fontSize: '1rem' }}>({pending.length})</span>
        </h2>
        {pending.length === 0 && (
          <div className="vault-card" style={{ borderStyle: 'dashed', boxShadow: 'none', background: 'transparent' }}>
            <p style={{ color: 'var(--ink-3)', margin: 0 }}>Nothing waiting. A steward can file a change below.</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pending.map((r) => (
            <article key={r.id} className="vault-card" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--ink)' }}><ChangeLabel r={r} /></div>
                <div style={{ fontSize: '0.84rem', color: 'var(--ink-3)', marginTop: '4px' }}>
                  Filed by {r.proposedBy} · approvals {r.approvals.length}/{state?.quorum}
                  {r.denials.length > 0 && ` · denied by ${r.denials.join(', ')}`}
                </div>
              </div>
              <StewardSeals admins={state?.admins ?? []} approvals={r.approvals} denials={r.denials} quorum={state?.quorum ?? 2} />
              {isSteward && !r.approvals.includes(username) && !r.denials.includes(username) && (
                <div style={{ marginTop: '22px', display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-emerald" disabled={busy} onClick={() => act({ action: 'decide', id: r.id, approve: true })}>
                    Authorize
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => act({ action: 'decide', id: r.id, approve: false })}>
                    Deny
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {isSteward && (
        <section className="vault-card" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '16px' }}>File a change</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={fieldLabel}>Action</label>
              <select className="demo-select" value={kind} onChange={(e) => setKind(e.target.value as CR['kind'])}>
                <option value="GRANT_ROLE">Grant role</option>
                <option value="REMOVE_ROLE">Remove role</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={fieldLabel}>Role</label>
              <select className="demo-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value={ROLE_DECRYPT}>{ROLE_DECRYPT}</option>
                <option value={ROLE_ENCRYPT}>{ROLE_ENCRYPT}</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={fieldLabel}>Person</label>
              <select className="demo-select" value={target} onChange={(e) => setTarget(e.target.value)}>
                {CAST.map((c) => <option key={c.username} value={c.username}>{c.username}</option>)}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => act({ action: 'propose', kind, role, target })}
            >
              {busy ? 'Working…' : 'File change request'}
            </button>
          </div>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <section className="vault-card">
          <h3 style={{ marginBottom: '14px' }}>Who holds what</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
            {state && Object.entries(state.roles).map(([u, rs], i) => (
              <li key={u} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{u}</strong>
                <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-3)', textAlign: 'right' }}>
                  {rs.join(', ') || '—'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="vault-card">
          <h3 style={{ marginBottom: '14px' }}>Decided</h3>
          {closed.length === 0 && <p style={{ color: 'var(--ink-3)', margin: 0 }}>Nothing approved or denied yet.</p>}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
            {closed.map((r, i) => (
              <li key={r.id} style={{ padding: '10px 0', borderTop: i > 0 ? '1px solid var(--line)' : 'none', fontSize: '0.88rem', color: 'var(--ink-2)' }}>
                <span className="badge" style={{ color: r.status === 'COMMITTED' || r.status === 'APPROVED' ? 'var(--ok)' : 'var(--no)', marginRight: '8px' }}>{r.status}</span>
                <ChangeLabel r={r} />
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginTop: '2px' }}>
                  Sealed by {r.approvals.join(', ') || 'no one'}
                  {r.closedAt && <span suppressHydrationWarning>{` · ${new Date(r.closedAt).toLocaleTimeString()}`}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
