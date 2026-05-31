import { APP_ID, APP_VERSION, STORAGE_KEY } from './constants'
import { appStateSchema, exportFileSchema } from './schema'
import type { AppState, ExportFile } from './types'

/** localStorage から状態を読み込む。無い・壊れている場合は null */
export function loadPersistedState(): AppState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = appStateSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    // JSON 破損やアクセス不可は致命的でないため握りつぶす
    return null
  }
}

/** localStorage へ状態を保存する。容量超過・無効時は無視する */
export function persistState(state: AppState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ストレージ無効/満杯でもライブ操作は継続できるようにする
  }
}

/** エクスポート用のファイルオブジェクトを生成する（純粋関数） */
export function buildExportFile(state: AppState, exportedAt: string): ExportFile {
  return {
    app: APP_ID,
    version: APP_VERSION,
    exportedAt,
    state,
  }
}

/**
 * 取り込んだ JSON 文字列を検証して AppState を返す。
 * 包んだ形式（exportFileSchema）と素の AppState の両方を受理する。
 * 不正な場合はユーザー向けメッセージ付きで例外を投げる。
 */
export function parseImportedState(text: string): AppState {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('ファイルを JSON として読み取れませんでした。')
  }

  const wrapped = exportFileSchema.safeParse(json)
  if (wrapped.success) return wrapped.data.state

  const bare = appStateSchema.safeParse(json)
  if (bare.success) return bare.data

  throw new Error(
    'ファイル内容がこのアプリの形式と一致しません。エクスポートした設定ファイルを選んでください。',
  )
}

/** オブジェクトを JSON ファイルとしてダウンロードさせる（ブラウザ専用） */
export function downloadJson(filename: string, data: unknown): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}
