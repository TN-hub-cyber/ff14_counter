/**
 * キリ番（ゾロ目）判定と没収額の計算。
 *
 * キリ番 = 11, 22, 33, ... 99, 111, 222, ... のように 2 桁以上で全桁が同じ数。
 * キリ番に到達した「その 1 回」は通常の 1 ワード分に加えてキリ番ボーナス（既定 100 万）を上乗せする。
 * 例) 1 ワード=10000、キリ番=1000000 のとき、キリ番到達回の没収額は 1010000。
 */

/** n がキリ番（ゾロ目・2桁以上）かどうか */
export function isKiriban(n: number): boolean {
  if (!Number.isInteger(n) || n < 11) return false
  const digits = String(n)
  return digits.split('').every((d) => d === digits[0])
}

/** 1 以上 n 以下に含まれるキリ番の個数 */
export function countKiribanUpTo(n: number): number {
  if (!Number.isInteger(n) || n < 11) return 0
  let count = 0
  const maxLength = String(n).length
  for (let length = 2; length <= maxLength; length += 1) {
    const repunit = Number('1'.repeat(length)) // 11, 111, 1111, ...
    for (let digit = 1; digit <= 9; digit += 1) {
      if (repunit * digit <= n) count += 1
    }
  }
  return count
}

/**
 * 配信者ひとりの没収額を計算する。
 * すべての回に gilPerWord を課し、キリ番に到達した回には kiribanGil を上乗せする。
 *
 * 合計 = count × gilPerWord + (キリ番到達数) × kiribanGil
 */
export function streamerGil(
  count: number,
  gilPerWord: number,
  kiribanGil: number,
): number {
  if (count <= 0) return 0
  const kiribanHits = countKiribanUpTo(count)
  return count * gilPerWord + kiribanHits * kiribanGil
}
