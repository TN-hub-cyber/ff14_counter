'use client'

import { useState } from 'react'
import { predictionInputSchema } from '@/lib/schema'

interface PredictionFormProps {
  onAdd: (input: { listenerName: string; predictedCount: number }) => void
}

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
          className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white ring-1 ring-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
          aria-label="リスナー名"
        />
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={predictedCount}
          onChange={(event) => setPredictedCount(event.target.value)}
          placeholder="予想合計回数"
          className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white ring-1 ring-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 sm:w-40"
          aria-label="予想合計回数"
        />
        <button
          type="submit"
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-400 active:bg-sky-600"
        >
          追加
        </button>
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  )
}
