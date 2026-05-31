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
        <span className="text-xs font-medium text-slate-400">並び替え:</span>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSortChange(option.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              sortKey === option.key
                ? 'bg-sky-500 text-white'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
            aria-pressed={sortKey === option.key}
          >
            {option.label}
          </button>
        ))}
      </div>

      {ranked.length === 0 ? (
        <p className="rounded-lg bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-400">
          まだ予想がありません。リスナーの予想を追加してください。
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ranked.map((prediction) => (
            <li
              key={prediction.id}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 ${
                prediction.isClosest
                  ? 'bg-sky-500/15 ring-sky-400/60'
                  : 'bg-slate-900/60 ring-white/5'
              }`}
            >
              {prediction.isClosest ? (
                <span className="shrink-0 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  最有力
                </span>
              ) : null}
              <span className="min-w-0 flex-1 truncate font-semibold text-white">
                {prediction.listenerName}
              </span>
              <span className="shrink-0 text-right tabular-nums">
                <span className="text-lg font-bold text-amber-300">
                  {formatNumber(prediction.predictedCount)}
                </span>
                <span className="text-xs text-slate-400"> 回</span>
              </span>
              <span className="hidden w-20 shrink-0 text-right text-xs text-slate-400 tabular-nums sm:block">
                差 {formatNumber(prediction.diff)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(prediction.id)}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
                aria-label={`${prediction.listenerName} の予想を削除`}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-slate-500">
        現在の合計実績: {formatNumber(actualTotal)} 回 ／ 「最有力」は終了時の合計に最も近い予想です。
      </p>
    </div>
  )
}
