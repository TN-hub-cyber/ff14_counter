import type { SyncStatus as SyncStatusValue } from '@/hooks/useAppState'

const STATUS_MAP: Record<
  SyncStatusValue,
  { label: string; dot: string; text: string }
> = {
  loading: { label: 'DB読み込み中…', dot: 'bg-slate-400', text: 'text-slate-300' },
  saving: { label: '保存中…', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-200' },
  saved: { label: 'DB同期済み', dot: 'bg-emerald-400', text: 'text-emerald-200' },
  offline: {
    label: 'オフライン（端末に保存）',
    dot: 'bg-rose-400',
    text: 'text-rose-200',
  },
}

export function SyncStatus({ status }: { status: SyncStatusValue }) {
  const { label, dot, text } = STATUS_MAP[status]
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-medium ${text}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  )
}
