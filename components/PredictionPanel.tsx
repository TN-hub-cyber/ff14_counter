'use client'

import { useMemo, useState } from 'react'
import { PredictionForm } from './PredictionForm'
import { PredictionList } from './PredictionList'
import { formatNumber } from '@/lib/format'
import {
  predictionCountByStreamer,
  rankStreamerPredictions,
  streamerCount,
} from '@/lib/state'
import type { AppState, PredictionSortKey } from '@/lib/types'

interface PredictionPanelProps {
  state: AppState
  onAdd: (input: {
    streamerId: string
    listenerName: string
    predictedCount: number
  }) => void
  onRemove: (predictionId: string) => void
}

export function PredictionPanel({ state, onAdd, onRemove }: PredictionPanelProps) {
  const [selectedId, setSelectedId] = useState(state.streamers[0]?.id ?? '')
  const [sortKey, setSortKey] = useState<PredictionSortKey>('diff-asc')

  const counts = useMemo(() => predictionCountByStreamer(state), [state])
  const ranked = useMemo(
    () => rankStreamerPredictions(state, selectedId, sortKey),
    [state, selectedId, sortKey],
  )
  const actual = streamerCount(state, selectedId)
  const selectedName =
    state.streamers.find((s) => s.id === selectedId)?.name ?? ''
  const closest = ranked.find((r) => r.isClosest) ?? null

  return (
    <div className="flex flex-col gap-4">
      {/* 配信者セレクタ */}
      <div className="flex flex-wrap gap-2">
        {state.streamers.map((streamer) => {
          const count = counts[streamer.id] ?? 0
          const active = streamer.id === selectedId
          return (
            <button
              key={streamer.id}
              type="button"
              onClick={() => setSelectedId(streamer.id)}
              className={`ff-jp rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                active
                  ? 'border-[var(--border-gold-strong)] bg-[var(--gold)]/15 text-[var(--gold-bright)]'
                  : 'border-[var(--border-gold)] bg-white/5 text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
              aria-pressed={active}
            >
              {streamer.name}
              {count > 0 ? (
                <span className="ff-numeral ml-1 text-xs opacity-80">({count})</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* 選択中の配信者の状況 */}
      <div className="ff-jp flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
        <span className="font-bold text-[var(--gold)]">{selectedName}</span>
        <span className="text-[var(--muted)]">
          現在の実績 {formatNumber(actual)} 回
        </span>
        <span className="text-[var(--muted)]">
          最有力: {closest ? closest.listenerName : '—'}
        </span>
      </div>

      <PredictionForm
        onAdd={(input) => onAdd({ ...input, streamerId: selectedId })}
      />
      <PredictionList
        ranked={ranked}
        actual={actual}
        sortKey={sortKey}
        onSortChange={setSortKey}
        onRemove={onRemove}
      />
    </div>
  )
}
