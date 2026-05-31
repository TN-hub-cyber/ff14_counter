'use client'

import { useMemo, useState } from 'react'
import { PredictionForm } from './PredictionForm'
import { PredictionList } from './PredictionList'
import { RulesNote } from './RulesNote'
import { StreamerGrid } from './StreamerGrid'
import { SummaryBar } from './SummaryBar'
import { SyncStatus } from './SyncStatus'
import { Toolbar } from './Toolbar'
import { useAppState } from '@/hooks/useAppState'
import { rankPredictions, totalCount, totalGil } from '@/lib/state'
import {
  buildExportFile,
  downloadJson,
  parseImportedState,
} from '@/lib/storage'
import type { PredictionSortKey } from '@/lib/types'

function buildExportFilename(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
  return `ff14-counter-${stamp}.json`
}

export function CounterApp() {
  const app = useAppState()
  const { state } = app
  const [sortKey, setSortKey] = useState<PredictionSortKey>('diff-asc')
  const [importError, setImportError] = useState<string | null>(null)

  const total = totalCount(state)
  const gil = totalGil(state)
  const ranked = useMemo(
    () => rankPredictions(state, sortKey),
    [state, sortKey],
  )

  const closest = useMemo(() => {
    if (state.predictions.length === 0) return null
    return state.predictions.reduce((best, current) => {
      const currentDiff = Math.abs(current.predictedCount - total)
      const bestDiff = Math.abs(best.predictedCount - total)
      return currentDiff < bestDiff ? current : best
    })
  }, [state.predictions, total])

  function handleExport() {
    const file = buildExportFile(state, new Date().toISOString())
    downloadJson(buildExportFilename(), file)
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const next = parseImportedState(text)
      app.replaceState(next)
      setImportError(null)
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'インポートに失敗しました。',
      )
    }
  }

  function handleResetCounts() {
    if (window.confirm('全員の英語回数を0に戻します。予想はそのままです。よろしいですか？')) {
      app.resetCounts()
    }
  }

  function handleResetAll() {
    if (window.confirm('回数も予想もすべて消去します。元に戻せません。よろしいですか？')) {
      app.resetAll()
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            英語禁止配信 カウンター
          </h1>
          <SyncStatus status={app.syncStatus} />
        </div>
        <p className="text-sm text-slate-400">
          配信者ごとの英語（カタカナ語）回数をカウント。リスナーは「全員の合計回数」を予想します。
        </p>
      </header>

      <SummaryBar
        totalCount={total}
        totalGil={gil}
        predictionCount={state.predictions.length}
        closest={closest}
      />

      <Toolbar
        gilPerWord={state.gilPerWord}
        kiribanGil={state.kiribanGil}
        onGilPerWordChange={app.setGilPerWord}
        onKiribanGilChange={app.setKiribanGil}
        onRefresh={app.refresh}
        onExport={handleExport}
        onImportFile={handleImportFile}
        onResetCounts={handleResetCounts}
        onResetAll={handleResetAll}
      />

      {importError ? (
        <p className="rounded-lg bg-rose-900/40 px-4 py-2 text-sm text-rose-200 ring-1 ring-rose-500/40">
          {importError}
        </p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-200">配信者カウント</h2>
        <StreamerGrid
          streamers={state.streamers}
          gilPerWord={state.gilPerWord}
          kiribanGil={state.kiribanGil}
          onAdjust={app.adjustCount}
          onSetCount={app.setCount}
        />
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-slate-800/40 p-4 ring-1 ring-white/5">
        <h2 className="text-lg font-bold text-slate-200">リスナー予想（合計回数）</h2>
        <PredictionForm onAdd={app.addPrediction} />
        <PredictionList
          ranked={ranked}
          actualTotal={total}
          sortKey={sortKey}
          onSortChange={setSortKey}
          onRemove={app.removePrediction}
        />
      </section>

      <RulesNote />

      <footer className="pb-4 text-center text-xs text-slate-600">
        データはデータベースに自動保存され、複数端末で共有されます（オフライン時は端末内に一時保存）。バックアップは「エクスポート」から。
      </footer>
    </div>
  )
}
