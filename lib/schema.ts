import { z } from 'zod'
import { APP_ID, DEFAULT_KIRIBAN_GIL } from './constants'

/** 配信者 1 件 */
export const streamerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  englishCount: z.number().int().min(0),
})

/** 予想 1 件 */
export const predictionSchema = z.object({
  id: z.string().min(1),
  listenerName: z.string().min(1).max(60),
  predictedCount: z.number().int().min(0),
})

/** アプリ全体の状態 */
export const appStateSchema = z.object({
  streamers: z.array(streamerSchema),
  predictions: z.array(predictionSchema),
  gilPerWord: z.number().int().min(0),
  // 旧バージョンの保存データ/ファイルにフィールドが無い場合は既定値で補う
  kiribanGil: z.number().int().min(0).default(DEFAULT_KIRIBAN_GIL),
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
