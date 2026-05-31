import { formatGilMan, formatNumber } from '@/lib/format'

interface SummaryBarProps {
  totalCount: number
  totalGil: number
  predictionCount: number
  closest: { listenerName: string; predictedCount: number } | null
}

interface StatProps {
  label: string
  value: string
  accent?: string
  sub?: string
}

function Stat({ label, value, accent = 'text-white', sub }: StatProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-800/60 px-4 py-3 ring-1 ring-white/5">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className={`text-2xl font-bold tabular-nums sm:text-3xl ${accent}`}>
        {value}
      </span>
      {sub ? <span className="text-xs text-slate-400">{sub}</span> : null}
    </div>
  )
}

export function SummaryBar({
  totalCount,
  totalGil,
  predictionCount,
  closest,
}: SummaryBarProps) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat
        label="合計 英語回数"
        value={`${formatNumber(totalCount)} 回`}
        accent="text-amber-300"
      />
      <Stat
        label="没収額 合計"
        value={formatGilMan(totalGil)}
        accent="text-emerald-300"
      />
      <Stat label="予想 件数" value={`${formatNumber(predictionCount)} 件`} />
      <Stat
        label="現在の最有力予想"
        value={closest ? closest.listenerName : '—'}
        accent="text-sky-300"
        sub={closest ? `予想 ${formatNumber(closest.predictedCount)} 回` : '予想なし'}
      />
    </section>
  )
}
