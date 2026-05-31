import { formatGilMan, formatNumber } from '@/lib/format'

interface SummaryBarProps {
  totalCount: number
  totalGil: number
  predictionCount: number
  leader: { listenerName: string; wins: number } | null
}

export function SummaryBar({
  totalCount,
  totalGil,
  predictionCount,
  leader,
}: SummaryBarProps) {
  return (
    <section className="ff-panel ff-rise grid grid-cols-1 items-center gap-6 px-6 py-7 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
      {/* 左: 合計英語回数 */}
      <div className="flex flex-col items-center sm:items-start">
        <span className="ff-jp text-[11px] tracking-[0.35em] text-[var(--muted)]">
          合計 英語回数
        </span>
        <span className="ff-numeral mt-1 text-4xl font-bold text-[var(--crystal)] sm:text-5xl">
          {formatNumber(totalCount)}
          <span className="ff-jp ml-1 text-base text-[var(--muted)]">回</span>
        </span>
        <span className="ff-jp mt-1 text-xs text-[var(--muted)]">
          予想 {formatNumber(predictionCount)} 件
        </span>
      </div>

      {/* 中央: 総没収額（主役） */}
      <div className="flex flex-col items-center px-2 text-center">
        <span className="ff-jp text-xs tracking-[0.5em] text-[var(--gold)]/85">
          総 没 収 額
        </span>
        <span className="ff-numeral ff-gold-text ff-hero-glow mt-1 text-6xl font-black leading-none sm:text-7xl">
          {formatGilMan(totalGil)}
        </span>
        <div className="ff-rule-diamond mt-3 w-40" />
      </div>

      {/* 右: 予想 総合首位（最も多くの配信者で最有力） */}
      <div className="flex flex-col items-center sm:items-end">
        <span className="ff-jp text-[11px] tracking-[0.35em] text-[var(--muted)]">
          予想 総合首位
        </span>
        <span className="ff-jp mt-1 max-w-full truncate text-3xl font-bold text-[var(--ink)] sm:text-4xl">
          {leader ? leader.listenerName : '—'}
        </span>
        <span className="ff-jp mt-1 text-xs text-[var(--muted)]">
          {leader ? `${formatNumber(leader.wins)} 名の配信者で最有力` : '予想なし'}
        </span>
      </div>
    </section>
  )
}
