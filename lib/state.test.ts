import { describe, expect, it } from 'vitest'
import { createInitialState } from './constants'
import {
  addPrediction,
  adjustCount,
  rankPredictions,
  removePrediction,
  resetCounts,
  setCount,
  setGilPerWord,
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

  it('applies the kiriban penalty per streamer in the gil total', () => {
    // 1人を11回(キリ番) -> 100,000 + 1,000,000 = 1,100,000
    const state = setCount(baseState(), firstId, 11)
    expect(totalGil(state)).toBe(1_100_000)
  })

  it('sums kiriban-aware gil across multiple streamers', () => {
    // firstId=11 -> 1,100,000 / secondId=3 -> 30,000
    let state = setCount(baseState(), firstId, 11)
    state = setCount(state, secondId, 3)
    expect(totalGil(state)).toBe(1_130_000)
  })
})

describe('predictions', () => {
  const p = (id: string, name: string, count: number): Prediction => ({
    id,
    listenerName: name,
    predictedCount: count,
  })

  it('adds and removes immutably', () => {
    const added = addPrediction(baseState(), p('p1', 'taro', 20))
    expect(added.predictions).toHaveLength(1)
    const removed = removePrediction(added, 'p1')
    expect(removed.predictions).toHaveLength(0)
    expect(added.predictions).toHaveLength(1)
  })

  it('marks the closest prediction to the actual total', () => {
    let state = adjustCount(baseState(), firstId, 10) // total = 10
    state = addPrediction(state, p('p1', 'far', 30))
    state = addPrediction(state, p('p2', 'near', 12))
    state = addPrediction(state, p('p3', 'mid', 5))

    const ranked = rankPredictions(state, 'diff-asc')
    expect(ranked[0].id).toBe('p2')
    expect(ranked[0].isClosest).toBe(true)
    expect(ranked.find((r) => r.id === 'p1')?.isClosest).toBe(false)
  })

  it('sorts by predicted count ascending and descending', () => {
    let state = addPrediction(baseState(), p('p1', 'a', 30))
    state = addPrediction(state, p('p2', 'b', 10))
    state = addPrediction(state, p('p3', 'c', 20))

    expect(rankPredictions(state, 'count-asc').map((r) => r.predictedCount)).toEqual([
      10, 20, 30,
    ])
    expect(rankPredictions(state, 'count-desc').map((r) => r.predictedCount)).toEqual([
      30, 20, 10,
    ])
  })

  it('handles ties for closest', () => {
    let state = adjustCount(baseState(), firstId, 10) // total = 10
    state = addPrediction(state, p('p1', 'a', 8)) // diff 2
    state = addPrediction(state, p('p2', 'b', 12)) // diff 2
    const ranked = rankPredictions(state, 'diff-asc')
    expect(ranked.filter((r) => r.isClosest)).toHaveLength(2)
  })
})
