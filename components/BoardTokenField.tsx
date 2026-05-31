'use client'

import { useEffect, useState } from 'react'
import { getBoardToken, setBoardToken } from '@/lib/token'

/**
 * 編集トークンの入力欄（端末ローカル）。
 * サーバーが BOARD_WRITE_TOKEN を設定している場合のみ必要。
 * 未設定運用なら空のままで動作する。
 */
export function BoardTokenField() {
  const [token, setToken] = useState('')

  // localStorage は SSR で読めないためマウント後に反映する（外部ストア同期）
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setToken(getBoardToken())
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleChange(value: string) {
    setToken(value)
    setBoardToken(value)
  }

  return (
    <label className="ff-jp flex items-center gap-2 text-xs text-[var(--muted)]">
      <span className="shrink-0">編集トークン（任意）</span>
      <input
        type="password"
        value={token}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="サーバーで保護時のみ入力"
        autoComplete="off"
        className="w-48 rounded-lg border border-[var(--border-gold)] bg-black/30 px-2 py-1 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/70"
        aria-label="編集トークン（サーバーが要求する場合のみ）"
      />
    </label>
  )
}
