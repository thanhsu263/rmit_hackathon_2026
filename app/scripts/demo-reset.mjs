// Resets Custodian Vault to its starting state for a demo run or a rehearsal:
//   - data/*.json        <- scripts/seed/*.json (sites unsealed, no requests, empty audit log)
//   - .mock-data/        <- deleted (simulated roles, pending approvals and the simulation key)
// Safe to run while `npm run dev` is running: the server re-reads these files on every request.
// Usage: npm run demo:reset
import { copyFile, mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const seedDir = path.join(appDir, 'scripts', 'seed')
const dataDir = path.join(appDir, 'data')
const mockDir = path.join(appDir, '.mock-data')

await mkdir(dataDir, { recursive: true })
for (const name of ['sites.json', 'requests.json', 'audit.json']) {
  // copy to a temp file, then rename, so a running server never reads a half-written file
  const tmp = path.join(dataDir, `.${name}.reset.tmp`)
  await copyFile(path.join(seedDir, name), tmp)
  await rename(tmp, path.join(dataDir, name))
  console.log(`reset   data/${name}`)
}
await rm(mockDir, { recursive: true, force: true })
console.log('removed .mock-data/ (roles, approvals and simulation key start fresh)')
console.log('\nDemo state reset. Browser sessions keep the signed-in account; sign in again if you want a clean start.')
