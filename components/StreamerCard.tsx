'use client'

import { formatGilMan, formatNumber } from '@/lib/format'
import { isKiriban, streamerGil } from '@/lib/gil'
import type { Streamer } from '@/lib/types'

interface StreamerCardProps {
  streamer: Streamer
  gilPerWord: number
  kiribanGil: number
  onAdjust: (streamerId: string, delta: number) => void
  onSetCount: (streamerId: string, value: number) => void
}

export function StreamerCard({
  streamer,
  gilPerWord,
  kiribanGil,
  onAdjust,
  onSetCount,
}: StreamerCardProps) {
  const gil = streamerGil(streamer.englishCount, gilPerWord, kiribanGil)
  const onKiriban = isKiriban(streamer.englishCount)

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl p-4 shadow-lg ring-1 ${
        onKiriban
          ? 'bg-fuchsia-900/40 ring-fuchsia-400/70'
          : 'bg-slate-800/70 ring-white/10'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="truncate text-lg font-bold text-white" title={streamer.name}>
          {streamer.name}
        </h3>
        <span className="shrink-0 text-xs font-medium text-emerald-300">
          {formatGilMan(gil)}
        </span>
      </div>

      <div className="text-center">
        <span
          className={`text-6xl font-black tabular-nums ${
            onKiriban ? 'text-fuchsia-300' : 'text-amber-300'
          }`}
        >
          {formatNumber(streamer.englishCount)}
        </span>
        <span className="ml-1 text-sm text-slate-400">回</span>
        {onKiriban ? (
          <p className="mt-1 text-xs font-bold text-fuchsia-300">
            キリ番！ {formatGilMan(kiribanGil)}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onAdjust(streamer.id, 1)}
        className="rounded-xl bg-amber-500 py-4 text-2xl font-black text-slate-900 transition-colors hover:bg-amber-400 active:bg-amber-600"
        aria-label={`${streamer.name} の英語回数を1増やす`}
      >
        ＋1
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAdjust(streamer.id, -1)}
          disabled={streamer.englishCount === 0}
          className="rounded-lg bg-slate-700 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`${streamer.name} の英語回数を1減らす`}
        >
          −1
        </button>
        <button
          type="button"
          onClick={() => onSetCount(streamer.id, 0)}
          disabled={streamer.englishCount === 0}
          className="rounded-lg bg-slate-700 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`${streamer.name} の英語回数を0に戻す`}
        >
          リセット
        </button>
      </div>
    </div>
  )
}
