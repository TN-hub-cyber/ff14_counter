'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createInitialState } from '@/lib/constants'
import { createId } from '@/lib/id'
import { fetchRemoteState, saveRemoteState } from '@/lib/remote'
import {
  addPrediction,
  adjustCount,
  removePrediction,
  resetCounts,
  setCount,
  setGilPerWord,
  setKiribanGil,
} from '@/lib/state'
import { loadPersistedState, persistState } from '@/lib/storage'
import type { AppState, Prediction } from '@/lib/types'

/** DB 同期の状態 */
export type SyncStatus = 'loading' | 'saving' | 'saved' | 'offline'

/** 変更を DB へ保存するまでの待ち時間（連打をまとめる） */
const SAVE_DEBOUNCE_MS = 600

export interface AppActions {
  adjustCount: (streamerId: string, delta: number) => void
  setCount: (streamerId: string, value: number) => void
  resetCounts: () => void
  addPrediction: (input: { listenerName: string; predictedCount: number }) => void
  removePrediction: (predictionId: string) => void
  setGilPerWord: (value: number) => void
  setKiribanGil: (value: number) => void
  replaceState: (next: AppState) => void
  resetAll: () => void
}

export interface UseAppStateResult extends AppActions {
  state: AppState
  /** 初回読み込み完了後に true */
  hydrated: boolean
  /** DB 同期の状態 */
  syncStatus: SyncStatus
  /** DB から最新を取得して上書きする（手動更新） */
  refresh: () => Promise<void>
}

/**
 * アプリ状態を管理するフック。
 * - 初回は決定的な初期状態で描画（SSR と一致）
 * - マウント後に DB（/api/state）から復元。失敗時は localStorage キャッシュにフォールバック
 * - 変更は localStorage（即時キャッシュ）＋ DB（デバウンス保存）へ反映
 */
export function useAppState(): UseAppStateResult {
  const [state, setState] = useState<AppState>(createInitialState)
  const [hydrated, setHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 直近で DB に保存済み（または読み込み済み）の内容。冗長な再保存を防ぐ
  const lastSyncedRef = useRef<string | null>(null)

  // マウント時に DB から復元する。非同期処理内の setState は意図的（外部ストア同期）。
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const remote = await fetchRemoteState()
        if (cancelled) return

        if (remote) {
          setState(remote)
          persistState(remote)
          lastSyncedRef.current = JSON.stringify(remote)
          setSyncStatus('saved')
        } else {
          // DB が空ならローカルキャッシュ（無ければ初期状態）で初期化し、DB へ播種する
          const seed = loadPersistedState() ?? createInitialState()
          setState(seed)
          try {
            await saveRemoteState(seed)
            if (cancelled) return
            lastSyncedRef.current = JSON.stringify(seed)
            setSyncStatus('saved')
          } catch {
            if (!cancelled) setSyncStatus('offline')
          }
        }
      } catch {
        // DB に到達できない場合はローカルキャッシュで継続
        const local = loadPersistedState()
        if (cancelled) return
        if (local) setState(local)
        setSyncStatus('offline')
      } finally {
        if (!cancelled) setHydrated(true)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  // 変更を localStorage へ即時保存し、DB へはデバウンスして保存する
  useEffect(() => {
    if (!hydrated) return
    persistState(state)

    const json = JSON.stringify(state)
    if (json === lastSyncedRef.current) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setSyncStatus('saving')
      saveRemoteState(state)
        .then(() => {
          lastSyncedRef.current = json
          setSyncStatus('saved')
        })
        .catch(() => setSyncStatus('offline'))
    }, SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state, hydrated])

  const refresh = useCallback(async () => {
    setSyncStatus('loading')
    try {
      const remote = await fetchRemoteState()
      if (remote) {
        setState(remote)
        persistState(remote)
        lastSyncedRef.current = JSON.stringify(remote)
      }
      setSyncStatus('saved')
    } catch {
      setSyncStatus('offline')
    }
  }, [])

  const actions = useMemo<AppActions>(
    () => ({
      adjustCount: (streamerId, delta) =>
        setState((current) => adjustCount(current, streamerId, delta)),
      setCount: (streamerId, value) =>
        setState((current) => setCount(current, streamerId, value)),
      resetCounts: () => setState((current) => resetCounts(current)),
      addPrediction: (input) => {
        const prediction: Prediction = {
          id: createId(),
          listenerName: input.listenerName.trim(),
          predictedCount: input.predictedCount,
        }
        setState((current) => addPrediction(current, prediction))
      },
      removePrediction: (predictionId) =>
        setState((current) => removePrediction(current, predictionId)),
      setGilPerWord: (value) =>
        setState((current) => setGilPerWord(current, value)),
      setKiribanGil: (value) =>
        setState((current) => setKiribanGil(current, value)),
      replaceState: (next) => setState(next),
      resetAll: () => setState(createInitialState()),
    }),
    [],
  )

  return { state, hydrated, syncStatus, refresh, ...actions }
}
