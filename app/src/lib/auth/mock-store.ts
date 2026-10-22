// Server-side state for MOCK mode only: who holds which role, the simulated QEA change
// requests, and the simulation's encryption key. In live mode none of this is used -
// TideCloak holds roles and approvals, and no server ever holds a decryption key.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { CAST, ROLE_ADMIN, ROLE_ENCRYPT, quorum } from './config'

const DIR = path.join(process.cwd(), '.mock-data')
const STATE_FILE = path.join(DIR, 'governance.json')
const KEY_FILE = path.join(DIR, 'key.hex')

export type ChangeRequest = {
  id: string
  kind: 'GRANT_ROLE' | 'REMOVE_ROLE'
  role: string
  target: string
  proposedBy: string
  approvals: string[]
  denials: string[]
  status: 'PENDING' | 'COMMITTED' | 'DENIED'
  createdAt: string
  closedAt: string | null
}

export type GovernanceState = { roles: Record<string, string[]>; requests: ChangeRequest[] }

function initialState(): GovernanceState {
  const roles: Record<string, string[]> = {}
  for (const c of CAST) roles[c.username] = []
  for (const u of ['diglead', 'heritage', 'custodian']) roles[u].push(ROLE_ADMIN)
  roles.diglead.push(ROLE_ENCRYPT)
  return { roles, requests: [] }
}

function writeAtomic(file: string, data: string) {
  fs.mkdirSync(DIR, { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, data)
  fs.renameSync(tmp, file)
}

export function readState(): GovernanceState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as GovernanceState
  } catch {
    const s = initialState()
    writeAtomic(STATE_FILE, JSON.stringify(s, null, 2))
    return s
  }
}

function saveState(s: GovernanceState) {
  writeAtomic(STATE_FILE, JSON.stringify(s, null, 2))
}

export function rolesOf(username: string): string[] {
  return readState().roles[username] ?? []
}

const admins = (s: GovernanceState) => Object.keys(s.roles).filter((u) => s.roles[u].includes(ROLE_ADMIN))

function settle(s: GovernanceState, cr: ChangeRequest) {
  const a = admins(s)
  const need = quorum(a.length)
  if (cr.approvals.length >= need) {
    const current = new Set(s.roles[cr.target] ?? [])
    if (cr.kind === 'GRANT_ROLE') current.add(cr.role)
    else current.delete(cr.role)
    s.roles[cr.target] = [...current]
    cr.status = 'COMMITTED'
    cr.closedAt = new Date().toISOString()
  } else if (cr.denials.length > a.length - need) {
    cr.status = 'DENIED'
    cr.closedAt = new Date().toISOString()
  }
}

export class GovernanceError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// An admin files a change; filing counts as that admin's own authorization (one of the quorum).
export function propose(actor: string, kind: ChangeRequest['kind'], role: string, target: string): ChangeRequest {
  const s = readState()
  if (!s.roles[actor]?.includes(ROLE_ADMIN)) throw new GovernanceError(403, 'only stewards can propose changes')
  if (!(target in s.roles)) throw new GovernanceError(404, 'unknown user')
  const cr: ChangeRequest = {
    id: crypto.randomUUID(), kind, role, target, proposedBy: actor,
    approvals: [actor], denials: [], status: 'PENDING', createdAt: new Date().toISOString(), closedAt: null,
  }
  s.requests.unshift(cr)
  settle(s, cr)
  saveState(s)
  return cr
}

export function decide(actor: string, id: string, approve: boolean): ChangeRequest {
  const s = readState()
  if (!s.roles[actor]?.includes(ROLE_ADMIN)) throw new GovernanceError(403, 'only stewards can approve or deny')
  const cr = s.requests.find((r) => r.id === id)
  if (!cr) throw new GovernanceError(404, 'unknown change request')
  if (cr.status !== 'PENDING') throw new GovernanceError(409, `change request is ${cr.status}`)
  if (cr.approvals.includes(actor) || cr.denials.includes(actor)) throw new GovernanceError(409, 'you already decided')
  ;(approve ? cr.approvals : cr.denials).push(actor)
  settle(s, cr)
  saveState(s)
  return cr
}

export function resetState(): GovernanceState {
  const s = initialState()
  saveState(s)
  return s
}

function key(): Buffer {
  try {
    return Buffer.from(fs.readFileSync(KEY_FILE, 'utf8').trim(), 'hex')
  } catch {
    const k = crypto.randomBytes(32)
    writeAtomic(KEY_FILE, k.toString('hex'))
    return k
  }
}

// Simulation only: unlike Tide, this server could decrypt on its own. The UI banner says so.
export function mockEncrypt(plain: string): string {
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()])
  return 'mock1:' + Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64')
}

export function mockDecrypt(sealed: string): string {
  if (!sealed.startsWith('mock1:')) throw new GovernanceError(400, 'not a mock ciphertext')
  const raw = Buffer.from(sealed.slice(6), 'base64')
  const d = crypto.createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12))
  d.setAuthTag(raw.subarray(12, 28))
  return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8')
}
