import { defaultParticipantName, MAX_PARTICIPANTS } from './constants'
import { streamerGil } from './gil'
import { createId } from './id'
import type {
  AppState,
  Prediction,
  PredictionSortKey,
  RankedPrediction,
  Streamer,
  TotalListenerRank,
} from './types'

/** 単位ラベルの最大長（schema と揃える） */
const MAX_UNIT_LENGTH = 16

/** 安全な非負整数に丸める */
function toNonNegativeInt(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

/** 指定配信者のカウントを delta だけ増減する（0 未満にはしない） */
export function adjustCount(
  state: AppState,
  streamerId: string,
  delta: number,
): AppState {
  return {
    ...state,
    streamers: state.streamers.map((streamer) =>
      streamer.id === streamerId
        ? { ...streamer, englishCount: Math.max(0, streamer.englishCount + delta) }
        : streamer,
    ),
  }
}

/** 指定配信者のカウントを絶対値で設定する */
export function setCount(
  state: AppState,
  streamerId: string,
  value: number,
): AppState {
  const safe = toNonNegativeInt(value)
  return {
    ...state,
    streamers: state.streamers.map((streamer) =>
      streamer.id === streamerId ? { ...streamer, englishCount: safe } : streamer,
    ),
  }
}

/** 全配信者のカウントを 0 に戻す（予想は維持） */
export function resetCounts(state: AppState): AppState {
  return {
    ...state,
    streamers: state.streamers.map((streamer) => ({ ...streamer, englishCount: 0 })),
  }
}

/** 予想を追加する */
export function addPrediction(state: AppState, prediction: Prediction): AppState {
  return {
    ...state,
    predictions: [...state.predictions, prediction],
  }
}

/** 予想を削除する */
export function removePrediction(state: AppState, predictionId: string): AppState {
  return {
    ...state,
    predictions: state.predictions.filter((p) => p.id !== predictionId),
  }
}

/** 1 ワードあたりの没収額を設定する */
export function setGilPerWord(state: AppState, value: number): AppState {
  return { ...state, gilPerWord: toNonNegativeInt(value) }
}

/** キリ番（ゾロ目）到達時に加算する没収額を設定する */
export function setKiribanGil(state: AppState, value: number): AppState {
  return { ...state, kiribanGil: toNonNegativeInt(value) }
}

/** 没収額の単位ラベルを設定する（空欄は無視して既定維持のため呼び出し側で補正） */
export function setUnit(state: AppState, unit: string): AppState {
  const trimmed = unit.trim().slice(0, MAX_UNIT_LENGTH)
  if (trimmed === '') return state
  return { ...state, unit: trimmed }
}

/** 指定配信者の名前を変更する */
export function setStreamerName(
  state: AppState,
  streamerId: string,
  name: string,
): AppState {
  return {
    ...state,
    streamers: state.streamers.map((streamer) =>
      streamer.id === streamerId ? { ...streamer, name } : streamer,
    ),
  }
}

/**
 * 参加者（配信者）の人数を設定する（1〜MAX_PARTICIPANTS）。
 * - 増やす場合: 既定名の配信者を末尾に追加する
 * - 減らす場合: 末尾の配信者を削除し、その配信者あての予想も取り除く
 * 既存の配信者の名前・カウント・予想は維持する。
 */
export function setParticipantCount(state: AppState, count: number): AppState {
  const target = Math.min(
    MAX_PARTICIPANTS,
    Math.max(1, toNonNegativeInt(count)),
  )
  const current = state.streamers.length
  if (target === current) return state

  if (target > current) {
    const added: Streamer[] = Array.from(
      { length: target - current },
      (_, offset) => ({
        id: createId(),
        name: defaultParticipantName(current + offset),
        englishCount: 0,
      }),
    )
    return { ...state, streamers: [...state.streamers, ...added] }
  }

  const kept = state.streamers.slice(0, target)
  const keptIds = new Set(kept.map((streamer) => streamer.id))
  return {
    ...state,
    streamers: kept,
    predictions: state.predictions.filter((p) => keptIds.has(p.streamerId)),
  }
}

/** 全配信者の合計NGワード回数 */
export function totalCount(state: AppState): number {
  return state.streamers.reduce((sum, streamer) => sum + streamer.englishCount, 0)
}

/** 合計没収額（各配信者の額を合算。キリ番ルールを含む） */
export function totalGil(state: AppState): number {
  return state.streamers.reduce(
    (sum, streamer) =>
      sum + streamerGil(streamer.englishCount, state.gilPerWord, state.kiribanGil),
    0,
  )
}

function comparator(
  sortKey: PredictionSortKey,
): (a: RankedPrediction, b: RankedPrediction) => number {
  switch (sortKey) {
    case 'count-asc':
      return (a, b) => a.predictedCount - b.predictedCount
    case 'count-desc':
      return (a, b) => b.predictedCount - a.predictedCount
    case 'diff-asc':
      return (a, b) => a.diff - b.diff || a.predictedCount - b.predictedCount
    case 'name':
      return (a, b) => a.listenerName.localeCompare(b.listenerName, 'ja')
  }
}

/** 指定配信者の現在のNGワード回数を取得する */
export function streamerCount(state: AppState, streamerId: string): number {
  return state.streamers.find((s) => s.id === streamerId)?.englishCount ?? 0
}

/**
 * 指定配信者あての予想に「その配信者の実績との差」と「最近接フラグ」を付与し、
 * 指定キーでソートして返す。元の配列は変更しない。
 */
export function rankStreamerPredictions(
  state: AppState,
  streamerId: string,
  sortKey: PredictionSortKey,
): RankedPrediction[] {
  const actual = streamerCount(state, streamerId)
  const withDiff = state.predictions
    .filter((prediction) => prediction.streamerId === streamerId)
    .map((prediction) => ({
      ...prediction,
      diff: Math.abs(prediction.predictedCount - actual),
      isClosest: false,
    }))

  const minDiff =
    withDiff.length > 0 ? Math.min(...withDiff.map((p) => p.diff)) : -1

  const ranked: RankedPrediction[] = withDiff.map((prediction) => ({
    ...prediction,
    isClosest: prediction.diff === minDiff,
  }))

  return ranked.sort(comparator(sortKey))
}

/** 配信者ごとの予想件数 */
export function predictionCountByStreamer(
  state: AppState,
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const prediction of state.predictions) {
    counts[prediction.streamerId] = (counts[prediction.streamerId] ?? 0) + 1
  }
  return counts
}

/**
 * 総合首位: 最も多くの配信者で「最有力（実績に最も近い）」になっているリスナー。
 * 各配信者ごとに最小差のリスナー全員を勝者として数える。予想が無ければ null。
 */
export function overallLeader(
  state: AppState,
): { listenerName: string; wins: number } | null {
  const wins = new Map<string, number>()

  for (const streamer of state.streamers) {
    const list = state.predictions.filter((p) => p.streamerId === streamer.id)
    if (list.length === 0) continue
    const diffs = list.map((p) => ({
      name: p.listenerName,
      diff: Math.abs(p.predictedCount - streamer.englishCount),
    }))
    const minDiff = Math.min(...diffs.map((d) => d.diff))
    const leaders = new Set(
      diffs.filter((d) => d.diff === minDiff).map((d) => d.name),
    )
    for (const name of leaders) {
      wins.set(name, (wins.get(name) ?? 0) + 1)
    }
  }

  let best: { listenerName: string; wins: number } | null = null
  for (const [listenerName, count] of wins) {
    if (!best || count > best.wins) {
      best = { listenerName, wins: count }
    }
  }
  return best
}

/**
 * 全体予想ランキング（元の仕様）。
 * リスナー名ごとに各配信者への予想回数を合算し、全配信者の実績合計に最も近い順に並べる。
 * 同じリスナー名は同一人物とみなして合算する。差が最小のリスナーに isClosest を立てる。
 */
export function rankTotalListeners(state: AppState): TotalListenerRank[] {
  const totals = new Map<string, number>()
  for (const prediction of state.predictions) {
    totals.set(
      prediction.listenerName,
      (totals.get(prediction.listenerName) ?? 0) + prediction.predictedCount,
    )
  }
  if (totals.size === 0) return []

  const actual = totalCount(state)
  const withDiff = Array.from(totals, ([listenerName, predictedTotal]) => ({
    listenerName,
    predictedTotal,
    diff: Math.abs(predictedTotal - actual),
    isClosest: false,
  }))

  const minDiff = Math.min(...withDiff.map((entry) => entry.diff))

  return withDiff
    .map((entry) => ({ ...entry, isClosest: entry.diff === minDiff }))
    .sort(
      (a, b) =>
        a.diff - b.diff ||
        a.predictedTotal - b.predictedTotal ||
        a.listenerName.localeCompare(b.listenerName, 'ja'),
    )
}
