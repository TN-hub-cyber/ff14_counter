import { describe, expect, it } from 'vitest'
import { countKiribanUpTo, isKiriban, streamerGil } from './gil'

describe('isKiriban', () => {
  it('detects two-or-more digit repdigits', () => {
    for (const n of [11, 22, 33, 44, 55, 66, 77, 88, 99, 111, 222, 999, 1111]) {
      expect(isKiriban(n)).toBe(true)
    }
  })

  it('rejects non-repdigits and single digits', () => {
    for (const n of [0, 1, 5, 9, 10, 12, 21, 100, 101, 110, 121, 123]) {
      expect(isKiriban(n)).toBe(false)
    }
  })

  it('rejects negatives and non-integers', () => {
    expect(isKiriban(-11)).toBe(false)
    expect(isKiriban(11.5)).toBe(false)
  })
})

describe('countKiribanUpTo', () => {
  it('counts repdigits up to n', () => {
    expect(countKiribanUpTo(10)).toBe(0)
    expect(countKiribanUpTo(11)).toBe(1)
    expect(countKiribanUpTo(22)).toBe(2)
    expect(countKiribanUpTo(99)).toBe(9)
    expect(countKiribanUpTo(110)).toBe(9)
    expect(countKiribanUpTo(111)).toBe(10)
  })
})

describe('streamerGil', () => {
  const gilPerWord = 10_000
  const kiribanGil = 1_000_000

  it('uses plain per-word gil below the first kiriban', () => {
    expect(streamerGil(0, gilPerWord, kiribanGil)).toBe(0)
    expect(streamerGil(10, gilPerWord, kiribanGil)).toBe(100_000)
  })

  it('adds the kiriban bonus on top of the per-word gil (11 -> 1,110,000)', () => {
    // 1..11 = 11 * 10,000 = 110,000 ; 11回目にキリ番 +1,000,000 => 1,110,000
    expect(streamerGil(11, gilPerWord, kiribanGil)).toBe(1_110_000)
  })

  it('accumulates multiple kiriban bonuses (22 -> 2,220,000)', () => {
    // kiriban at 11 and 22 -> 22 * 10,000 + 2 * 1,000,000
    expect(streamerGil(22, gilPerWord, kiribanGil)).toBe(2_220_000)
  })

  it('drops back to per-word gil after passing a kiriban (12 -> 1,120,000)', () => {
    // 12 * 10,000 + 1 kiriban (11) * 1,000,000 => 1,120,000
    expect(streamerGil(12, gilPerWord, kiribanGil)).toBe(1_120_000)
  })

  it('equals the brute-force sum for a range of counts', () => {
    for (let count = 0; count <= 130; count += 1) {
      let expected = 0
      for (let k = 1; k <= count; k += 1) {
        expected += isKiriban(k) ? gilPerWord + kiribanGil : gilPerWord
      }
      expect(streamerGil(count, gilPerWord, kiribanGil)).toBe(expected)
    }
  })
})
