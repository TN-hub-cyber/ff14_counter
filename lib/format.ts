const numberFormatter = new Intl.NumberFormat('ja-JP')

/** 数値を 3 桁区切りで整形する */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** ギル表記（例: 1,230,000 ギル） */
export function formatGil(value: number): string {
  return `${formatNumber(value)} ギル`
}

/**
 * ギルを「万」単位の読みやすい表記にする（例: 123 万ギル）。
 * 端数がある場合は通常表記にフォールバックする。
 */
export function formatGilMan(value: number): string {
  if (value !== 0 && value % 10000 === 0) {
    return `${formatNumber(value / 10000)} 万ギル`
  }
  return formatGil(value)
}
