'use client'

import { formatNumber } from '@/lib/format'
import type { PredictionSortKey, RankedPrediction } from '@/lib/types'

interface PredictionListProps {
  ranked: readonly RankedPrediction[]
  actualTotal: number
  sortKey: PredictionSortKey
  onSortChange: (sortKey: PredictionSortKey) => void
  onRemove: (predictionId: string) => void
}

const SORT_OPTIONS: { key: PredictionSortKey; label: string }[] = [
  { key: 'diff-asc', label: '実績に近い順' },
  { key: 'count-asc', label: '予想 少→多' },
  { key: 'count-desc', label: '予想 多→少' },
  { key: 'name', label: '名前順' },
]

export function PredictionList({
  ranked,
  actualTotal,
  sortKey,
  onSortChange,
  onRemove,
}: PredictionListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="ff-jp text-xs text-[var(--muted)]">並び替え</span>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSortChange(option.key)}
            className={`ff-jp rounded-full px-3 py-1 text-xs font-semibold transition ${
              sortKey === option.key
                ? 'border border-[var(--border-gold-strong)] bg-[var(--gold)]/15 text-[var(--gold-bright)]'
                : 'border border-[var(--border-gold)] bg-white/5 text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
            aria-pressed={sortKey === option.key}
          >
            {option.label}
          </button>
        ))}
      </div>

      {ranked.length === 0 ? (
        <p className="ff-jp rounded-lg border border-[var(--border-gold)]/60 bg-black/20 px-4 py-6 text-center text-sm text-[var(--muted)]">
          まだ予想がありません。リスナーの予想を追加してください。
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ranked.map((prediction) => (
            <li
              key={prediction.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                prediction.isClosest
                  ? 'border-[var(--border-gold-strong)] bg-[var(--gold)]/12 shadow-[0_0_18px_rgba(212,175,55,0.18)]'
                  : 'border-white/5 bg-black/20'
              }`}
            >
              {prediction.isClosest ? (
                <span className="ff-jp shrink-0 rounded-full border border-[var(--border-gold-strong)] bg-[var(--bg-1)] px-2 py-0.5 text-[10px] font-bold text-[var(--gold-bright)]">
                  ♛ 最有力
                </span>
              ) : null}
              <span className="ff-jp min-w-0 flex-1 truncate font-bold text-[var(--ink)]">
                {prediction.listenerName}
              </span>
              <span className="shrink-0 text-right">
                <span className="ff-numeral ff-gold-text text-lg font-bold">
                  {formatNumber(prediction.predictedCount)}
                </span>
                <span className="ff-jp text-xs text-[var(--muted)]"> 回</span>
              </span>
              <span className="ff-numeral hidden w-20 shrink-0 text-right text-xs text-[var(--muted)] sm:block">
                差 {formatNumber(prediction.diff)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(prediction.id)}
                className="ff-jp shrink-0 rounded-md px-2 py-1 text-xs font-medium text-[var(--rose)] transition hover:bg-rose-500/15"
                aria-label={`${prediction.listenerName} の予想を削除`}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="ff-jp text-xs text-[var(--muted)]/80">
        現在の合計実績: {formatNumber(actualTotal)} 回 ／ 「最有力」は終了時の合計に最も近い予想です。
      </p>
    </div>
  )
}
