/**
 * 編集トークンの端末ローカル保存。
 * サーバーが BOARD_WRITE_TOKEN を要求する場合に、PUT へ添付するトークンを保持する。
 * トークンは AppState（DB保存対象）には含めず、端末（localStorage）にのみ保存する。
 */
const TOKEN_KEY = 'ff14-english-counter:token'

export function getBoardToken(): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setBoardToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token)
    } else {
      window.localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // ストレージ無効時は無視する
  }
}
