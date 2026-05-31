import { appStateSchema } from './schema'
import { getBoardToken } from './token'
import type { AppState } from './types'

const ENDPOINT = '/api/state'

/** 書き込み権限がない（トークン未設定/不一致）ことを示すエラー */
export class UnauthorizedError extends Error {
  constructor() {
    super('書き込み権限がありません')
    this.name = 'UnauthorizedError'
  }
}

/** サーバー（DB）から現在のボード状態を取得する。未保存なら null */
export async function fetchRemoteState(signal?: AbortSignal): Promise<AppState | null> {
  const response = await fetch(ENDPOINT, { cache: 'no-store', signal })
  if (!response.ok) {
    throw new Error(`GET ${ENDPOINT} が ${response.status} を返しました`)
  }
  const json: unknown = await response.json()
  const state = (json as { state?: unknown }).state
  if (state == null) return null
  const parsed = appStateSchema.safeParse(state)
  return parsed.success ? parsed.data : null
}

/** サーバー（DB）へボード状態を保存する */
export async function saveRemoteState(state: AppState): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getBoardToken()
  if (token) headers['x-board-token'] = token

  const response = await fetch(ENDPOINT, {
    method: 'PUT',
    headers,
    body: JSON.stringify(state),
  })
  if (response.status === 401) {
    throw new UnauthorizedError()
  }
  if (!response.ok) {
    throw new Error(`PUT ${ENDPOINT} が ${response.status} を返しました`)
  }
}
