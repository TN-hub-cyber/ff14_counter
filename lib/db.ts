import { neon } from '@neondatabase/serverless'
import { appStateSchema } from './schema'
import type { AppState } from './types'

/** 共有ボードは単一行で管理する */
const BOARD_ID = 'main'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL が設定されていません')
  }
  return neon(url)
}

let tableReady = false

async function ensureTable(sql: ReturnType<typeof getSql>): Promise<void> {
  if (tableReady) return
  await sql`
    CREATE TABLE IF NOT EXISTS board_state (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  tableReady = true
}

/** 保存済みのボード状態を取得する。未保存・不正データなら null */
export async function getBoardState(): Promise<AppState | null> {
  const sql = getSql()
  await ensureTable(sql)
  const rows = await sql`SELECT data FROM board_state WHERE id = ${BOARD_ID} LIMIT 1`
  if (rows.length === 0) return null
  const parsed = appStateSchema.safeParse(rows[0].data)
  return parsed.success ? parsed.data : null
}

/** ボード状態を保存（upsert）する */
export async function saveBoardState(state: AppState): Promise<void> {
  const sql = getSql()
  await ensureTable(sql)
  const data = JSON.stringify(state)
  await sql`
    INSERT INTO board_state (id, data, updated_at)
    VALUES (${BOARD_ID}, ${data}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `
}
