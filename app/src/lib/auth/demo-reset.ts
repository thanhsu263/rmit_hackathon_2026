// Server-side demo reset, used by POST /api/mock/reset (mock mode only).
// Same effect as `npm run demo:reset`: data/*.json back to scripts/seed/*.json, and simulated governance cleared.
import fs from 'node:fs/promises'
import path from 'node:path'
import { resetState } from './mock-store'

const FILES = ['sites.json', 'requests.json', 'audit.json'] as const

export async function resetDemo(): Promise<void> {
  const seedDir = path.join(process.cwd(), 'scripts', 'seed')
  const dataDir = path.join(process.cwd(), 'data')
  await fs.mkdir(dataDir, { recursive: true })
  for (const name of FILES) {
    const tmp = path.join(dataDir, `.${name}.reset.tmp`)
    await fs.copyFile(path.join(seedDir, name), tmp)
    await fs.rename(tmp, path.join(dataDir, name))
  }
  resetState() // simulated roles and pending approvals; the encryption key is kept so a running server stays consistent
}
