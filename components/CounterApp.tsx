'use client'

import { useMemo, useState } from 'react'
import { BoardTokenField } from './BoardTokenField'
import { ParticipantSettings } from './ParticipantSettings'
import { PredictionPanel } from './PredictionPanel'
import { RulesNote } from './RulesNote'
import { StreamerGrid } from './StreamerGrid'
import { SummaryBar } from './SummaryBar'
import { SyncStatus } from './SyncStatus'
import { Toolbar } from './Toolbar'
import { TotalPredictionBanner } from './TotalPredictionBanner'
import { useAppState } from '@/hooks/useAppState'
import { streamerGil } from '@/lib/gil'
import {
  overallLeader,
  rankTotalListeners,
  totalCount,
  totalGil,
} from '@/lib/state'
import {
  buildExportFile,
  downloadJson,
  parseImportedState,
} from '@/lib/storage'

function buildExportFilename(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
  return `ff14-counter-${stamp}.json`
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="ff-jp shrink-0 text-sm font-bold tracking-[0.3em] text-[var(--gold)]">
        {children}
      </span>
      <div className="ff-rule" />
    </div>
  )
}

export function CounterApp() {
  const app = useAppState()
  const { state } = app
  const [importError, setImportError] = useState<string | null>(null)

  const total = totalCount(state)
  const gil = totalGil(state)
  const leader = useMemo(() => overallLeader(state), [state])
  const totalRanked = useMemo(() => rankTotalListeners(state), [state])

  const topPayerId = useMemo(() => {
    let bestId: string | null = null
    let bestGil = 0
    for (const streamer of state.streamers) {
      const value = streamerGil(streamer.englishCount, state.gilPerWord, state.kiribanGil)
      if (value > bestGil) {
        bestGil = value
        bestId = streamer.id
      }
    }
    return bestId
  }, [state.streamers, state.gilPerWord, state.kiribanGil])

  function handleExport() {
    const file = buildExportFile(state, new Date().toISOString())
    downloadJson(buildExportFilename(), file)
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const next = parseImportedState(text)
      // インポートは全端末で共有されるボード状態を上書きし、DB にも保存される破壊的操作
      if (
        !window.confirm(
          '読み込んだ内容で全員分のボード状態を上書きし、データベースにも保存します。よろしいですか？',
        )
      ) {
        return
      }
      app.replaceState(next)
      setImportError(null)
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'インポートに失敗しました。',
      )
    }
  }

  function handleResetCounts() {
    if (window.confirm('全員のNGワード回数を0に戻します。予想はそのままです。よろしいですか？')) {
      app.resetCounts()
    }
  }

  function handleParticipantCountChange(count: number) {
    // 人数を減らす場合は末尾の配信者とその予想が消えるため確認する
    if (
      count < state.streamers.length &&
      !window.confirm(
        `参加者を ${count} 人に減らします。末尾の配信者の回数とその配信者あての予想は削除されます。よろしいですか？`,
      )
    ) {
      return
    }
    app.setParticipantCount(count)
  }

  function handleResetAll() {
    if (window.confirm('回数も予想もすべて消去します。元に戻せません。よろしいですか？')) {
      app.resetAll()
    }
  }

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-6 sm:px-6 lg:py-10">
      <header className="ff-rise relative flex flex-col items-center gap-3 pt-1 text-center">
        <div className="absolute right-0 top-0">
          <SyncStatus status={app.syncStatus} />
        </div>
        <p className="ff-display text-[10px] tracking-[0.5em] text-[var(--gold)]/70 sm:text-xs">
          NG WORD CHALLENGE
        </p>
        <h1 className="ff-display ff-gold-text text-4xl font-black leading-tight sm:text-6xl">
          NGワード配信カウンター
        </h1>
        <p className="ff-jp text-xs text-[var(--muted)] sm:text-sm">
          配信者のNGワードをカウント／リスナーは配信者ごとにNGワード回数を予想
        </p>
        <div className="ff-rule-diamond mt-1 w-full max-w-2xl" />
      </header>

      <SummaryBar
        totalCount={total}
        totalGil={gil}
        unit={state.unit}
        predictionCount={state.predictions.length}
        leader={leader}
      />

      <section className="flex flex-col gap-4">
        <SectionTitle>❖ 配信者カウント</SectionTitle>
        <StreamerGrid
          streamers={state.streamers}
          gilPerWord={state.gilPerWord}
          kiribanGil={state.kiribanGil}
          unit={state.unit}
          topPayerId={topPayerId}
          onAdjust={app.adjustCount}
          onSetCount={app.setCount}
        />
      </section>

      <section className="ff-panel flex flex-col gap-5 p-5 sm:p-6">
        <SectionTitle>❖ リスナー予想</SectionTitle>
        <TotalPredictionBanner ranked={totalRanked} actual={total} />
        <div className="flex flex-col gap-4">
          <span className="ff-jp text-xs font-bold tracking-[0.3em] text-[var(--gold)]/80">
            配信者ごとの予想
          </span>
          <PredictionPanel
            state={state}
            onAdd={app.addPrediction}
            onRemove={app.removePrediction}
          />
        </div>
      </section>

      <details className="ff-panel group px-5 py-4">
        <summary className="ff-jp flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[var(--gold)]">
          <span>⚙ 設定・データ管理</span>
          <span className="text-xs font-normal text-[var(--muted)]">開閉</span>
        </summary>
        <div className="mt-5 flex flex-col gap-5">
          <ParticipantSettings
            streamers={state.streamers}
            onNameChange={app.setStreamerName}
            onCountChange={handleParticipantCountChange}
          />
          <div className="ff-rule" />
          <Toolbar
            gilPerWord={state.gilPerWord}
            kiribanGil={state.kiribanGil}
            unit={state.unit}
            onGilPerWordChange={app.setGilPerWord}
            onKiribanGilChange={app.setKiribanGil}
            onUnitChange={app.setUnit}
            onRefresh={app.refresh}
            onExport={handleExport}
            onImportFile={handleImportFile}
            onResetCounts={handleResetCounts}
            onResetAll={handleResetAll}
          />
          <div className="flex justify-end">
            <BoardTokenField />
          </div>
          {importError ? (
            <p className="ff-jp rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-sm text-[var(--rose)]">
              {importError}
            </p>
          ) : null}
        </div>
      </details>

      <RulesNote />

      <footer className="ff-jp pb-4 text-center text-xs text-[var(--muted)]/70">
        データはデータベースに自動保存され、複数端末で共有されます（オフライン時は端末内に一時保存）。
      </footer>
    </div>
  )
}
