'use client'

import { useState } from 'react'
import { defaultParticipantName, MAX_PARTICIPANTS } from '@/lib/constants'
import type { Streamer } from '@/lib/types'

interface ParticipantSettingsProps {
  streamers: readonly Streamer[]
  onNameChange: (streamerId: string, name: string) => void
  onCountChange: (count: number) => void
}

const inputClass =
  'ff-jp w-full rounded-lg border border-[var(--border-gold)] bg-black/30 px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/70'

const stepperButtonClass =
  'ff-jp h-9 w-9 rounded-lg border border-[var(--border-gold)] bg-white/5 text-lg font-bold text-[var(--ink)] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35'

/**
 * 1 件分の名前入力。空欄で確定したら既定名に補正する。
 * 外部（インポート・再読込）で名前が変わったときは、親側で `key` に名前を含めて
 * 再マウントすることで初期値を更新する（effect での同期は避ける）。
 */
function NameInput({
  streamer,
  index,
  onCommit,
}: {
  streamer: Streamer
  index: number
  onCommit: (name: string) => void
}) {
  const [text, setText] = useState(streamer.name)

  function commit() {
    const next = text.trim() === '' ? defaultParticipantName(index) : text.trim()
    setText(next)
    if (next !== streamer.name) onCommit(next)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="ff-numeral w-6 shrink-0 text-right text-xs text-[var(--muted)]">
        {index + 1}
      </span>
      <input
        type="text"
        value={text}
        maxLength={60}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
        className={inputClass}
        aria-label={`参加者 ${index + 1} の名前`}
      />
    </div>
  )
}

export function ParticipantSettings({
  streamers,
  onNameChange,
  onCountChange,
}: ParticipantSettingsProps) {
  const count = streamers.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="ff-jp text-sm font-semibold text-[var(--gold)]">
          参加者
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCountChange(count - 1)}
            disabled={count <= 1}
            className={stepperButtonClass}
            aria-label="参加者を1人減らす"
          >
            −
          </button>
          <span className="ff-numeral w-10 text-center text-lg font-bold text-[var(--ink)]">
            {count}
          </span>
          <button
            type="button"
            onClick={() => onCountChange(count + 1)}
            disabled={count >= MAX_PARTICIPANTS}
            className={stepperButtonClass}
            aria-label="参加者を1人増やす"
          >
            ＋
          </button>
        </div>
        <span className="ff-jp text-xs text-[var(--muted)]">
          人（最大 {MAX_PARTICIPANTS} 名）
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {streamers.map((streamer, index) => (
          <NameInput
            key={`${streamer.id}:${streamer.name}`}
            streamer={streamer}
            index={index}
            onCommit={(name) => onNameChange(streamer.id, name)}
          />
        ))}
      </div>
    </div>
  )
}
