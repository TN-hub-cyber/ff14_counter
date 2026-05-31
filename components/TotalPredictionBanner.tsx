'use client'

import { formatNumber } from '@/lib/format'
import type { TotalListenerRank } from '@/lib/types'

interface TotalPredictionBannerProps {
  ranked: readonly TotalListenerRank[]
  actual: number
  /** 一覧に表示する最大件数 */
  limit?: number
}

export function TotalPredictionBanner({
  ranked,
  actual,
  limit = 5,
}: TotalPredictionBannerProps) {
  const leaders = ranked.filter((entry) => entry.isClosest)
  const shown = ranked.slice(0, limit)

  return (
    <div className="ff-panel flex flex-col gap-3 rounded-xl border border-[var(--border-gold)] bg-black/20 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="ff-jp text-sm font-bold text-[var(--gold)]">
          🏆 合計回数 最有力（全体）
        </span>
        <span className="ff-jp text-xs text-[var(--muted)]">
          実績合計 {formatNumber(actual)} 回
        </span>
      </div>

      {ranked.length === 0 ? (
        <p className="ff-jp text-sm text-[var(--muted)]">
          まだ予想がありません。配信者ごとに予想を追加すると、合計が実績に最も近いリスナーがここに表示されます。
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="ff-jp text-2xl font-bold text-[var(--gold-bright)] sm:text-3xl">
              {leaders.map((entry) => entry.listenerName).join('・')}
            </span>
            <span className="ff-jp text-xs text-[var(--muted)]">
              予想合計 {formatNumber(leaders[0]?.predictedTotal ?? 0)} 回 ／ 差{' '}
              {formatNumber(leaders[0]?.diff ?? 0)}
            </span>
          </div>

          <ol className="flex flex-col gap-1.5">
            {shown.map((entry, index) => (
              <li
                key={entry.listenerName}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                  entry.isClosest
                    ? 'border-[var(--border-gold-strong)] bg-[var(--gold)]/12'
                    : 'border-white/5 bg-black/20'
                }`}
              >
                <span className="ff-numeral w-5 shrink-0 text-right text-xs text-[var(--muted)]">
                  {index + 1}
                </span>
                <span className="ff-jp min-w-0 flex-1 truncate font-semibold text-[var(--ink)]">
                  {entry.listenerName}
                  {entry.isClosest ? (
                    <span className="ff-jp ml-2 text-[10px] font-bold text-[var(--gold-bright)]">
                      ♛ 最有力
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-right">
                  <span className="ff-numeral ff-gold-text text-base font-bold">
                    {formatNumber(entry.predictedTotal)}
                  </span>
                  <span className="ff-jp text-xs text-[var(--muted)]"> 回</span>
                </span>
                <span className="ff-numeral hidden w-16 shrink-0 text-right text-xs text-[var(--muted)] sm:block">
                  差 {formatNumber(entry.diff)}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
