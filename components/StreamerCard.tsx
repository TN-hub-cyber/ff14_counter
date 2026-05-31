'use client'

import { useEffect, useRef, useState } from 'react'
import { formatAmountMan, formatNumber } from '@/lib/format'
import { isKiriban, streamerGil } from '@/lib/gil'
import type { Streamer } from '@/lib/types'

interface StreamerCardProps {
  streamer: Streamer
  gilPerWord: number
  kiribanGil: number
  unit: string
  isTopPayer: boolean
  index: number
  onAdjust: (streamerId: string, delta: number) => void
  onSetCount: (streamerId: string, value: number) => void
}

export function StreamerCard({
  streamer,
  gilPerWord,
  kiribanGil,
  unit,
  isTopPayer,
  index,
  onAdjust,
  onSetCount,
}: StreamerCardProps) {
  const gil = streamerGil(streamer.englishCount, gilPerWord, kiribanGil)
  const onKiriban = isKiriban(streamer.englishCount)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function startEditing() {
    setDraft(String(streamer.englishCount))
    setEditing(true)
  }

  function commitEditing() {
    const value = draft.trim() === '' ? 0 : Number(draft)
    if (Number.isFinite(value) && value >= 0) {
      onSetCount(streamer.id, Math.floor(value))
    }
    setEditing(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitEditing()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setEditing(false)
    }
  }

  return (
    <div
      className={`ff-panel ff-rise relative flex flex-col gap-3 p-4 ${onKiriban ? 'ff-kiriban' : ''}`}
      style={{ animationDelay: `${0.05 * index + 0.1}s` }}
    >
      {isTopPayer ? (
        <span className="ff-jp absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[var(--border-gold-strong)] bg-[var(--bg-1)] px-3 py-0.5 text-[10px] font-bold text-[var(--gold-bright)] shadow-[0_0_16px_rgba(212,175,55,0.4)]">
          ♛ 最多没収
        </span>
      ) : null}

      <div className="flex items-baseline justify-between gap-2">
        <h3
          className="ff-jp truncate text-lg font-bold text-[var(--ink)]"
          title={streamer.name}
        >
          {streamer.name}
        </h3>
        <span className="ff-numeral ff-gold-text shrink-0 text-xs font-bold">
          {formatAmountMan(gil, unit)}
        </span>
      </div>

      <div className="flex items-end justify-center gap-1 py-1">
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            min={0}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitEditing}
            onKeyDown={handleKeyDown}
            className="ff-numeral w-32 rounded-lg border border-[var(--border-gold-strong)] bg-black/40 px-2 py-1 text-center text-4xl font-black text-[var(--gold-bright)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/70"
            aria-label={`${streamer.name} の回数を直接入力`}
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className={`ff-numeral cursor-text text-6xl font-black leading-none transition hover:opacity-80 ${
              onKiriban ? 'text-[#e6b3ff]' : 'ff-gold-text'
            }`}
            title="クリックして回数を直接入力"
            aria-label={`${streamer.name} の回数 ${streamer.englishCount}。クリックで直接入力`}
          >
            {formatNumber(streamer.englishCount)}
          </button>
        )}
        <span className="ff-jp mb-1 text-sm text-[var(--muted)]">回</span>
      </div>

      {onKiriban ? (
        <p className="ff-jp text-center text-[11px] font-bold tracking-widest text-[#e6b3ff]">
          ✦ キリ番 +{formatAmountMan(kiribanGil, unit)} ✦
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => onAdjust(streamer.id, 1)}
        className="ff-jp rounded-xl border border-[var(--border-gold-strong)] bg-gradient-to-b from-[#f6e3a1] to-[#bb942f] py-3.5 text-2xl font-black text-[#2a210a] shadow-[0_6px_18px_rgba(212,175,55,0.28)] transition hover:from-[#fcefc4] hover:to-[#d0a534] active:translate-y-px"
        aria-label={`${streamer.name} のNGワード回数を1増やす`}
      >
        ＋1
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAdjust(streamer.id, -1)}
          disabled={streamer.englishCount === 0}
          className="ff-jp rounded-lg border border-[var(--border-gold)] bg-white/5 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`${streamer.name} のNGワード回数を1減らす`}
        >
          −1
        </button>
        <button
          type="button"
          onClick={() => onSetCount(streamer.id, 0)}
          disabled={streamer.englishCount === 0}
          className="ff-jp rounded-lg border border-[var(--border-gold)] bg-white/5 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`${streamer.name} のNGワード回数を0に戻す`}
        >
          0に戻す
        </button>
      </div>
    </div>
  )
}
