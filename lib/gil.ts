/**
 * キリ番（ゾロ目）判定と没収ギルの計算。
 *
 * キリ番 = 11, 22, 33, ... 99, 111, 222, ... のように 2 桁以上で全桁が同じ数。
 * キリ番に到達した「その 1 回」は通常の 1 ワードギルではなくキリ番ギル（既定 100 万）で計算する。
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
 * 配信者ひとりの没収ギルを計算する。
 * 通常ワードは gilPerWord、キリ番に到達した回はそれを kiribanGil に置き換える。
 *
 * 合計 = count × gilPerWord + (キリ番到達数) × (kiribanGil − gilPerWord)
 */
export function streamerGil(
  count: number,
  gilPerWord: number,
  kiribanGil: number,
): number {
  if (count <= 0) return 0
  const kiribanHits = countKiribanUpTo(count)
  return count * gilPerWord + kiribanHits * (kiribanGil - gilPerWord)
}
