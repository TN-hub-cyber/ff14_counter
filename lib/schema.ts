import { z } from 'zod'
import { APP_ID, DEFAULT_KIRIBAN_GIL } from './constants'

// リソース枯渇（巨大ペイロード）を防ぐためのサイズ上限
const MAX_STREAMERS = 64
const MAX_PREDICTIONS = 2000
const MAX_COUNT = 1_000_000
const MAX_GIL = 1_000_000_000
const MAX_ID_LENGTH = 100
const MAX_NAME_LENGTH = 60

/** 配信者 1 件 */
export const streamerSchema = z.object({
  id: z.string().min(1).max(MAX_ID_LENGTH),
  name: z.string().min(1).max(MAX_NAME_LENGTH),
  englishCount: z.number().int().min(0).max(MAX_COUNT),
})

/** 予想 1 件（DB に永続化される。フォーム検証と同等の上限を課す） */
export const predictionSchema = z.object({
  id: z.string().min(1).max(MAX_ID_LENGTH),
  streamerId: z.string().min(1).max(MAX_ID_LENGTH),
  listenerName: z.string().min(1).max(MAX_NAME_LENGTH),
  predictedCount: z.number().int().min(0).max(MAX_COUNT),
})

/** アプリ全体の状態 */
export const appStateSchema = z.object({
  streamers: z.array(streamerSchema).max(MAX_STREAMERS),
  predictions: z.array(predictionSchema).max(MAX_PREDICTIONS),
  gilPerWord: z.number().int().min(0).max(MAX_GIL),
  // 旧バージョンの保存データ/ファイルにフィールドが無い場合は既定値で補う
  kiribanGil: z.number().int().min(0).max(MAX_GIL).default(DEFAULT_KIRIBAN_GIL),
})

/** エクスポートファイル（状態をメタ情報で包んだもの） */
export const exportFileSchema = z.object({
  app: z.literal(APP_ID),
  version: z.number().int(),
  exportedAt: z.string().optional(),
  state: appStateSchema,
})

/** 予想フォームの入力（未検証の生データ） */
export const predictionInputSchema = z.object({
  listenerName: z
    .string()
    .trim()
    .min(1, 'リスナー名を入力してください')
    .max(60, 'リスナー名は60文字以内で入力してください'),
  predictedCount: z
    .number({ invalid_type_error: '予想回数を数値で入力してください' })
    .int('予想回数は整数で入力してください')
    .min(0, '予想回数は0以上で入力してください')
    .max(1_000_000, '予想回数が大きすぎます'),
})

export type PredictionInput = z.infer<typeof predictionInputSchema>
