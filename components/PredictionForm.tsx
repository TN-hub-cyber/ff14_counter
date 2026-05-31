'use client'

import { useState } from 'react'
import { predictionInputSchema } from '@/lib/schema'

interface PredictionFormProps {
  onAdd: (input: { listenerName: string; predictedCount: number }) => void
}

const inputClass =
  'ff-jp rounded-lg border border-[var(--border-gold)] bg-black/30 px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/70'

export function PredictionForm({ onAdd }: PredictionFormProps) {
  const [listenerName, setListenerName] = useState('')
  const [predictedCount, setPredictedCount] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = predictionInputSchema.safeParse({
      listenerName,
      predictedCount: predictedCount.trim() === '' ? NaN : Number(predictedCount),
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? '入力内容を確認してください')
      return
    }

    onAdd(result.data)
    setListenerName('')
    setPredictedCount('')
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={listenerName}
          onChange={(event) => setListenerName(event.target.value)}
          placeholder="リスナー名"
          maxLength={60}
          className={`flex-1 ${inputClass}`}
          aria-label="リスナー名"
        />
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={predictedCount}
          onChange={(event) => setPredictedCount(event.target.value)}
          placeholder="予想回数"
          className={`w-full sm:w-40 ${inputClass}`}
          aria-label="予想回数"
        />
        <button
          type="submit"
          className="ff-jp rounded-lg border border-[var(--border-gold-strong)] bg-gradient-to-b from-[#f6e3a1] to-[#bb942f] px-5 py-2 text-sm font-bold text-[#2a210a] transition hover:from-[#fcefc4] hover:to-[#d0a534] active:translate-y-px"
        >
          追加
        </button>
      </div>
      {error ? <p className="ff-jp text-sm text-[var(--rose)]">{error}</p> : null}
    </form>
  )
}
