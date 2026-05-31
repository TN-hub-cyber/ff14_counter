import { describe, expect, it } from 'vitest'
import { createInitialState } from './constants'
import {
  addPrediction,
  adjustCount,
  overallLeader,
  rankStreamerPredictions,
  rankTotalListeners,
  removePrediction,
  resetCounts,
  setCount,
  setGilPerWord,
  setParticipantCount,
  setStreamerName,
  setUnit,
  totalCount,
  totalGil,
} from './state'
import type { AppState, Prediction } from './types'

function baseState(): AppState {
  return createInitialState()
}

const firstId = 's-0'
const secondId = 's-1'

describe('adjustCount', () => {
  it('increments without mutating the original state', () => {
    const before = baseState()
    const after = adjustCount(before, firstId, 1)

    expect(after.streamers[0].englishCount).toBe(1)
    expect(before.streamers[0].englishCount).toBe(0)
    expect(after).not.toBe(before)
    expect(after.streamers).not.toBe(before.streamers)
  })

  it('never goes below zero', () => {
    const after = adjustCount(baseState(), firstId, -5)
    expect(after.streamers[0].englishCount).toBe(0)
  })

  it('leaves other streamers untouched', () => {
    const after = adjustCount(baseState(), firstId, 3)
    expect(after.streamers[1].englishCount).toBe(0)
  })
})

describe('setCount', () => {
  it('clamps negatives and floors decimals', () => {
    expect(setCount(baseState(), firstId, -2).streamers[0].englishCount).toBe(0)
    expect(setCount(baseState(), firstId, 4.9).streamers[0].englishCount).toBe(4)
  })
})

describe('resetCounts', () => {
  it('zeroes all counts but keeps predictions', () => {
    let state = adjustCount(baseState(), firstId, 5)
    state = addPrediction(state, {
      id: 'p1',
      streamerId: firstId,
      listenerName: 'a',
      predictedCount: 10,
    })
    const reset = resetCounts(state)
    expect(totalCount(reset)).toBe(0)
    expect(reset.predictions).toHaveLength(1)
  })
})

describe('totals', () => {
  it('sums counts across streamers', () => {
    let state = adjustCount(baseState(), firstId, 3)
    state = adjustCount(state, secondId, 2)
    expect(totalCount(state)).toBe(5)
  })

  it('computes gil from total count and gilPerWord', () => {
    let state = setGilPerWord(baseState(), 10000)
    state = adjustCount(state, firstId, 4)
    expect(totalGil(state)).toBe(40000)
  })

  it('adds the kiriban bonus per streamer in the gil total', () => {
    // 1人を11回(キリ番) -> 110,000 + 1,000,000 = 1,110,000
    const state = setCount(baseState(), firstId, 11)
    expect(totalGil(state)).toBe(1_110_000)
  })

  it('sums kiriban-aware gil across multiple streamers', () => {
    // firstId=11 -> 1,110,000 / secondId=3 -> 30,000
    let state = setCount(baseState(), firstId, 11)
    state = setCount(state, secondId, 3)
    expect(totalGil(state)).toBe(1_140_000)
  })
})

describe('predictions (per streamer)', () => {
  const p = (
    id: string,
    streamerId: string,
    name: string,
    count: number,
  ): Prediction => ({ id, streamerId, listenerName: name, predictedCount: count })

  it('adds and removes immutably', () => {
    const added = addPrediction(baseState(), p('p1', firstId, 'taro', 20))
    expect(added.predictions).toHaveLength(1)
    const removed = removePrediction(added, 'p1')
    expect(removed.predictions).toHaveLength(0)
    expect(added.predictions).toHaveLength(1)
  })

  it('marks the closest prediction to that streamer actual count', () => {
    let state = adjustCount(baseState(), firstId, 10) // s-0 actual = 10
    state = addPrediction(state, p('p1', firstId, 'far', 30))
    state = addPrediction(state, p('p2', firstId, 'near', 12))
    state = addPrediction(state, p('p3', firstId, 'mid', 5))

    const ranked = rankStreamerPredictions(state, firstId, 'diff-asc')
    expect(ranked[0].id).toBe('p2')
    expect(ranked[0].isClosest).toBe(true)
    expect(ranked.find((r) => r.id === 'p1')?.isClosest).toBe(false)
  })

  it('only includes predictions for the requested streamer', () => {
    let state = addPrediction(baseState(), p('p1', firstId, 'a', 5))
    state = addPrediction(state, p('p2', secondId, 'b', 9))
    const ranked = rankStreamerPredictions(state, firstId, 'diff-asc')
    expect(ranked).toHaveLength(1)
    expect(ranked[0].id).toBe('p1')
  })

  it('sorts by predicted count ascending and descending', () => {
    let state = addPrediction(baseState(), p('p1', firstId, 'a', 30))
    state = addPrediction(state, p('p2', firstId, 'b', 10))
    state = addPrediction(state, p('p3', firstId, 'c', 20))

    expect(
      rankStreamerPredictions(state, firstId, 'count-asc').map((r) => r.predictedCount),
    ).toEqual([10, 20, 30])
    expect(
      rankStreamerPredictions(state, firstId, 'count-desc').map((r) => r.predictedCount),
    ).toEqual([30, 20, 10])
  })

  it('handles ties for closest', () => {
    let state = adjustCount(baseState(), firstId, 10)
    state = addPrediction(state, p('p1', firstId, 'a', 8)) // diff 2
    state = addPrediction(state, p('p2', firstId, 'b', 12)) // diff 2
    const ranked = rankStreamerPredictions(state, firstId, 'diff-asc')
    expect(ranked.filter((r) => r.isClosest)).toHaveLength(2)
  })
})

describe('overallLeader', () => {
  const p = (
    id: string,
    streamerId: string,
    name: string,
    count: number,
  ): Prediction => ({ id, streamerId, listenerName: name, predictedCount: count })

  it('returns null when there are no predictions', () => {
    expect(overallLeader(baseState())).toBeNull()
  })

  it('picks the listener leading the most streamers', () => {
    let state = adjustCount(baseState(), firstId, 10) // s-0 actual 10
    state = adjustCount(state, secondId, 4) // s-1 actual 4
    // taro: closest on s-0 (10) and s-1 (4) -> 2 wins
    state = addPrediction(state, p('p1', firstId, 'taro', 10))
    state = addPrediction(state, p('p2', firstId, 'jiro', 30))
    state = addPrediction(state, p('p3', secondId, 'taro', 4))
    state = addPrediction(state, p('p4', secondId, 'jiro', 20))

    const leader = overallLeader(state)
    expect(leader?.listenerName).toBe('taro')
    expect(leader?.wins).toBe(2)
  })
})

describe('setUnit', () => {
  it('updates the unit label immutably', () => {
    const before = baseState()
    const after = setUnit(before, '円')
    expect(after.unit).toBe('円')
    expect(before.unit).toBe('ギル')
    expect(after).not.toBe(before)
  })

  it('trims and ignores empty input (keeps current unit)', () => {
    expect(setUnit(baseState(), '  pt  ').unit).toBe('pt')
    expect(setUnit(baseState(), '   ').unit).toBe('ギル')
  })
})

describe('setStreamerName', () => {
  it('renames a single streamer without touching others', () => {
    const after = setStreamerName(baseState(), firstId, '新しい名前')
    expect(after.streamers[0].name).toBe('新しい名前')
    expect(after.streamers[1].name).toBe(baseState().streamers[1].name)
    expect(after.streamers[0].id).toBe(firstId)
  })
})

describe('setParticipantCount', () => {
  it('reduces participants and drops their predictions', () => {
    let state = adjustCount(baseState(), secondId, 5)
    state = addPrediction(state, {
      id: 'p1',
      streamerId: firstId,
      listenerName: 'a',
      predictedCount: 1,
    })
    state = addPrediction(state, {
      id: 'p2',
      streamerId: secondId,
      listenerName: 'b',
      predictedCount: 1,
    })

    const reduced = setParticipantCount(state, 1)
    expect(reduced.streamers).toHaveLength(1)
    expect(reduced.streamers[0].id).toBe(firstId)
    // s-1 の予想は削除され、s-0 の予想だけ残る
    expect(reduced.predictions).toHaveLength(1)
    expect(reduced.predictions[0].id).toBe('p1')
  })

  it('adds new streamers with default names when increasing', () => {
    const reduced = setParticipantCount(baseState(), 2)
    const grown = setParticipantCount(reduced, 4)
    expect(grown.streamers).toHaveLength(4)
    expect(grown.streamers[0].id).toBe(firstId)
    expect(grown.streamers[2].englishCount).toBe(0)
    expect(grown.streamers[2].name).toBe('配信者3')
  })

  it('clamps to 1..8 and is a no-op when the count is unchanged', () => {
    expect(setParticipantCount(baseState(), 0).streamers).toHaveLength(1)
    expect(setParticipantCount(baseState(), 99).streamers).toHaveLength(8)
    // 既定は 8 人。8 のまま設定したら同一参照を返す（変更なし）
    const state = baseState()
    expect(setParticipantCount(state, 8)).toBe(state)
  })
})

describe('rankTotalListeners', () => {
  const p = (
    id: string,
    streamerId: string,
    name: string,
    count: number,
  ): Prediction => ({ id, streamerId, listenerName: name, predictedCount: count })

  it('returns an empty list with no predictions', () => {
    expect(rankTotalListeners(baseState())).toEqual([])
  })

  it('sums each listener across streamers and marks the closest to the actual total', () => {
    // 実績合計: s-0=7, s-1=5 -> 12
    let state = adjustCount(baseState(), firstId, 7)
    state = adjustCount(state, secondId, 5)
    // taro: 6 + 5 = 11 (差1) / jiro: 2 + 2 = 4 (差8)
    state = addPrediction(state, p('p1', firstId, 'taro', 6))
    state = addPrediction(state, p('p2', secondId, 'taro', 5))
    state = addPrediction(state, p('p3', firstId, 'jiro', 2))
    state = addPrediction(state, p('p4', secondId, 'jiro', 2))

    const ranked = rankTotalListeners(state)
    expect(ranked).toHaveLength(2)
    expect(ranked[0].listenerName).toBe('taro')
    expect(ranked[0].predictedTotal).toBe(11)
    expect(ranked[0].diff).toBe(1)
    expect(ranked[0].isClosest).toBe(true)
    expect(ranked[1].listenerName).toBe('jiro')
    expect(ranked[1].isClosest).toBe(false)
  })

  it('flags ties for the closest total', () => {
    let state = adjustCount(baseState(), firstId, 10) // total 10
    state = addPrediction(state, p('p1', firstId, 'a', 8)) // 差2
    state = addPrediction(state, p('p2', firstId, 'b', 12)) // 差2
    const ranked = rankTotalListeners(state)
    expect(ranked.filter((r) => r.isClosest)).toHaveLength(2)
  })
})
