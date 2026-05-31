const numberFormatter = new Intl.NumberFormat('ja-JP')

/** 数値を 3 桁区切りで整形する */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** 単位つきの金額表記（例: 1,230,000 ギル） */
export function formatAmount(value: number, unit: string): string {
  return `${formatNumber(value)} ${unit}`
}

/**
 * 金額を「万」単位の読みやすい表記にする（例: 123 万ギル）。
 * 端数がある場合は通常表記にフォールバックする。
 */
export function formatAmountMan(value: number, unit: string): string {
  if (value !== 0 && value % 10000 === 0) {
    return `${formatNumber(value / 10000)} 万${unit}`
  }
  return formatAmount(value, unit)
}
