import type { AppState } from './types'

/** 参加配信者（表示順） */
export const STREAMER_NAMES = [
  '木天蓼のこな',
  'いっちゃん',
  'すなはまくじら',
  'ちゅん',
  'ときちょ',
  '七白リオン',
  '一片カナメ',
  '夜真月しるし',
] as const

/** 1 ワードにつき没収するギル（既定値） */
export const DEFAULT_GIL_PER_WORD = 10000

/** キリ番（ゾロ目）到達時の没収ギル（既定値） */
export const DEFAULT_KIRIBAN_GIL = 1_000_000

/** localStorage 保存キー（バージョン付き） */
export const STORAGE_KEY = 'ff14-english-counter:v1'

/** エクスポートファイルの識別子・バージョン */
export const APP_ID = 'ff14-english-counter' as const
export const APP_VERSION = 1

/**
 * 初期状態を生成する。
 * 配信者 id は決定的（s-0..s-7）にして SSR とクライアント初回描画を一致させる。
 */
export function createInitialState(): AppState {
  return {
    streamers: STREAMER_NAMES.map((name, index) => ({
      id: `s-${index}`,
      name,
      englishCount: 0,
    })),
    predictions: [],
    gilPerWord: DEFAULT_GIL_PER_WORD,
    kiribanGil: DEFAULT_KIRIBAN_GIL,
  }
}
