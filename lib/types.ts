/**
 * ドメインモデル。
 * すべて readonly で定義し、状態更新は新しいオブジェクトの生成で行う（不変性）。
 */

/** 配信者ひとり分の状態 */
export interface Streamer {
  readonly id: string
  readonly name: string
  /** 英語（カタカナ語）を使った回数。0 以上の整数 */
  readonly englishCount: number
}

/** リスナーが申告した「全配信者の合計英語回数」の予想 */
export interface Prediction {
  readonly id: string
  readonly listenerName: string
  /** 合計回数の予想値。0 以上の整数 */
  readonly predictedCount: number
}

/** アプリ全体の状態（保存・エクスポートの単位） */
export interface AppState {
  readonly streamers: readonly Streamer[]
  readonly predictions: readonly Prediction[]
  /** 1 ワードあたりの没収ギル（既定 10000） */
  readonly gilPerWord: number
  /** キリ番（ゾロ目）到達時に適用する没収ギル（既定 1000000） */
  readonly kiribanGil: number
}

/** エクスポートファイル（状態をメタ情報で包んだもの。生成側の型） */
export interface ExportFile {
  readonly app: string
  readonly version: number
  readonly exportedAt: string
  readonly state: AppState
}

/** 予想の表示用ソートキー */
export type PredictionSortKey =
  | 'count-asc'
  | 'count-desc'
  | 'diff-asc'
  | 'name'

/** 実績との差・最近接フラグを付与した予想（表示用） */
export interface RankedPrediction extends Prediction {
  /** 現在の合計回数との差の絶対値 */
  readonly diff: number
  /** 現時点で実績に最も近い予想か */
  readonly isClosest: boolean
}
