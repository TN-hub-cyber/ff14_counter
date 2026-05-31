import { appStateSchema } from './schema'
import type { AppState } from './types'

const ENDPOINT = '/api/state'

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
  const response = await fetch(ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!response.ok) {
    throw new Error(`PUT ${ENDPOINT} が ${response.status} を返しました`)
  }
}
