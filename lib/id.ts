/**
 * クライアント側で一意な id を生成する。
 * crypto.randomUUID が使えない環境では時刻＋カウンタでフォールバックする。
 */
let fallbackCounter = 0

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  fallbackCounter += 1
  return `id-${Date.now().toString(36)}-${fallbackCounter}`
}
