// End-to-end check of the demo flow against a RUNNING app in mock mode (npm run dev, or build + start).
//   npm run test:flow                       -> http://localhost:3000
//   BASE_URL=http://localhost:3100 npm run test:flow
// It resets the demo first and again at the end, so it also leaves the app ready to record.
// Exit code 0 = every check passed; 1 = at least one failed.
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const SECRET = '-31.4321,141.9876' // fictional coordinates; must never appear in stored data or API responses except after decrypt

let passed = 0
const failures = []

async function call(user, method, route, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (user) headers.Authorization = `Bearer mock:${user}`
  const res = await fetch(BASE + route, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* not JSON */ }
  return { status: res.status, json, text }
}

function check(name, ok, detail = '') {
  if (ok) { passed++; console.log(`  PASS  ${name}`) }
  else { failures.push(name); console.log(`  FAIL  ${name}${detail ? `  -> ${detail}` : ''}`) }
}

const grant = (role, target, kind = 'GRANT_ROLE') => ({ action: 'propose', kind, role, target })
const DECRYPT = '_tide_sitecoords.selfdecrypt'

// ---- preflight -------------------------------------------------------------------------------
let r
try { r = await call('diglead', 'POST', '/api/mock/reset') } catch (e) {
  console.error(`Cannot reach ${BASE}. Start the app first (cd app && npm run dev).\n${e.message}`); process.exit(1)
}
if (r.status === 404) { console.error('The mock API is disabled: the app is running in live mode. This test needs NEXT_PUBLIC_AUTH_MODE unset or "mock".'); process.exit(1) }
if (r.status !== 200) { console.error(`Reset failed (${r.status}): ${r.text}`); process.exit(1) }
console.log(`Testing ${BASE} (demo reset)\n`)

// ---- 1. authentication ------------------------------------------------------------------------
console.log('1. Authentication')
check('no token -> 401', (await call(null, 'GET', '/api/sites')).status === 401)
check('unknown user token -> 401', (await call('nobody', 'GET', '/api/sites')).status === 401)

// ---- 2. seal ---------------------------------------------------------------------------------
console.log('2. Sealing (dig lead only)')
const sites = (await call('researcher', 'GET', '/api/sites')).json ?? []
const site = sites.find((s) => !s.sealedExact)
check('researcher sees unsealed sites', !!site, `got ${sites.length} sites`)
const sid = site?.id
check('researcher cannot encrypt (403)', (await call('researcher', 'POST', '/api/mock/crypto', { op: 'encrypt', data: SECRET })).status === 403)
const enc = await call('diglead', 'POST', '/api/mock/crypto', { op: 'encrypt', data: SECRET })
check('dig lead can encrypt', enc.status === 200 && typeof enc.json?.result === 'string' && !enc.text.includes(SECRET))
const sealedExact = enc.json?.result
const body = { sealedExact, blurred: { lat: -31.5, lng: 142, radiusKm: 50 } }
check('researcher cannot seal (403)', (await call('researcher', 'POST', `/api/sites/${sid}/seal`, body)).status === 403)
const sealed = await call('diglead', 'POST', `/api/sites/${sid}/seal`, body)
check('dig lead can seal', sealed.status === 200 && sealed.json?.sealedBy === 'diglead', `status ${sealed.status}`)
check('seal rejects a bad body (400)', (await call('diglead', 'POST', `/api/sites/${sid}/seal`, { sealedExact: '' })).status === 400)

// ---- 3. researcher view, request, denied ------------------------------------------------------
console.log('3. Researcher is locked out')
const list = await call('researcher', 'GET', '/api/sites')
check('API never returns plaintext coordinates', !list.text.includes('-31.4321') && !list.text.includes('141.9876'))
check('site is sealed and shows only a blur', list.json?.find((s) => s.id === sid)?.sealedExact === sealedExact && list.json?.find((s) => s.id === sid)?.blurred?.radiusKm === 50)
check('researcher cannot decrypt before approval (403)', (await call('researcher', 'POST', '/api/mock/crypto', { op: 'decrypt', data: sealedExact })).status === 403)
const rq = await call('researcher', 'POST', '/api/requests', { siteId: sid, reason: 'Ground-penetrating radar survey', requester: 'diglead' })
check('researcher can file a request', rq.status === 200 && rq.json?.siteId === sid)
check('requester comes from the token, not the body', rq.json?.requester === 'researcher', `got ${rq.json?.requester}`)

// ---- 4. one steward is not enough --------------------------------------------------------------
console.log('4. One steward is not enough (2 of 3)')
check('researcher cannot file a role change (403)', (await call('researcher', 'POST', '/api/mock/governance', grant(DECRYPT, 'researcher'))).status === 403)
const cr = await call('custodian', 'POST', '/api/mock/governance', grant(DECRYPT, 'researcher'))
check('custodian files the grant: PENDING with 1 approval', cr.json?.status === 'PENDING' && cr.json?.approvals?.length === 1, JSON.stringify(cr.json?.status))
check('researcher still cannot decrypt (403)', (await call('researcher', 'POST', '/api/mock/crypto', { op: 'decrypt', data: sealedExact })).status === 403)
check('same steward cannot approve twice (409)', (await call('custodian', 'POST', '/api/mock/governance', { action: 'decide', id: cr.json?.id, approve: true })).status === 409)

// ---- 5. second steward -> access --------------------------------------------------------------
console.log('5. Second steward opens it')
const ok2 = await call('heritage', 'POST', '/api/mock/governance', { action: 'decide', id: cr.json?.id, approve: true })
check('heritage approves: COMMITTED', ok2.json?.status === 'COMMITTED', JSON.stringify(ok2.json?.status))
const dec = await call('researcher', 'POST', '/api/mock/crypto', { op: 'decrypt', data: sealedExact })
check('researcher decrypts the exact coordinates', dec.status === 200 && dec.json?.result === SECRET, `status ${dec.status}`)
check('stored data still has no plaintext', !(await call('researcher', 'GET', '/api/sites')).text.includes('141.9876'))

// ---- 6. revoke -----------------------------------------------------------------------------------
console.log('6. Revocation (also 2 of 3)')
const rv = await call('heritage', 'POST', '/api/mock/governance', grant(DECRYPT, 'researcher', 'REMOVE_ROLE'))
check('heritage files the revocation: PENDING', rv.json?.status === 'PENDING')
check('researcher can still decrypt while it is pending', (await call('researcher', 'POST', '/api/mock/crypto', { op: 'decrypt', data: sealedExact })).status === 200)
const rv2 = await call('diglead', 'POST', '/api/mock/governance', { action: 'decide', id: rv.json?.id, approve: true })
check('dig lead approves: COMMITTED', rv2.json?.status === 'COMMITTED')
check('researcher is locked out again (403)', (await call('researcher', 'POST', '/api/mock/crypto', { op: 'decrypt', data: sealedExact })).status === 403)

// ---- 7. audit trail ----------------------------------------------------------------------------
console.log('7. Audit trail')
check('client cannot forge SITE_SEALED (400)', (await call('researcher', 'POST', '/api/audit', { siteId: sid, action: 'SITE_SEALED' })).status === 400)
check('researcher records DECRYPT_DENIED', (await call('researcher', 'POST', '/api/audit', { siteId: sid, action: 'DECRYPT_DENIED' })).status === 200)
const audit = (await call('custodian', 'GET', '/api/audit')).json ?? []
const has = (action, actor) => audit.some((e) => e.siteId === sid && e.action === action && e.actor === actor)
check('audit has SITE_SEALED by diglead', has('SITE_SEALED', 'diglead'))
check('audit has ACCESS_REQUESTED by researcher', has('ACCESS_REQUESTED', 'researcher'))
check('audit is newest first', audit.every((e, i) => i === 0 || new Date(audit[i - 1].at) >= new Date(e.at)))

// ---- 8. clean up -----------------------------------------------------------------------------------
await call('diglead', 'POST', '/api/mock/reset')
const final = (await call('researcher', 'GET', '/api/sites')).json ?? []
console.log('8. Clean up')
check('demo reset leaves every site unsealed', final.length > 0 && final.every((s) => !s.sealedExact))

console.log(`\n${failures.length === 0 ? 'ALL PASSED' : 'FAILED'}: ${passed} passed, ${failures.length} failed`)
if (failures.length) { console.log('Failed checks:\n - ' + failures.join('\n - ')); process.exit(1) }
