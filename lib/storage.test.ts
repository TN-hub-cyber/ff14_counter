import { describe, expect, it } from 'vitest'
import { createInitialState } from './constants'
import { buildExportFile, parseImportedState } from './storage'

describe('buildExportFile', () => {
  it('wraps state with app metadata', () => {
    const state = createInitialState()
    const file = buildExportFile(state, '2026-05-31T00:00:00.000Z')
    expect(file.app).toBe('ff14-english-counter')
    expect(file.version).toBe(1)
    expect(file.exportedAt).toBe('2026-05-31T00:00:00.000Z')
    expect(file.state).toEqual(state)
  })
})

describe('parseImportedState', () => {
  it('round-trips an exported file', () => {
    const state = createInitialState()
    const json = JSON.stringify(buildExportFile(state, '2026-05-31T00:00:00.000Z'))
    expect(parseImportedState(json)).toEqual(state)
  })

  it('accepts a bare AppState object', () => {
    const state = createInitialState()
    expect(parseImportedState(JSON.stringify(state))).toEqual(state)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseImportedState('{ not json')).toThrow()
  })

  it('throws on a structurally invalid object', () => {
    expect(() => parseImportedState(JSON.stringify({ hello: 'world' }))).toThrow()
  })

  it('rejects negative counts', () => {
    const bad = {
      streamers: [{ id: 's-0', name: 'x', englishCount: -1 }],
      predictions: [],
      gilPerWord: 10000,
    }
    expect(() => parseImportedState(JSON.stringify(bad))).toThrow()
  })

  it('rejects oversized counts (DoS guard)', () => {
    const bad = {
      streamers: [{ id: 's-0', name: 'x', englishCount: 9_999_999 }],
      predictions: [],
      gilPerWord: 10000,
    }
    expect(() => parseImportedState(JSON.stringify(bad))).toThrow()
  })

  it('rejects too many predictions (DoS guard)', () => {
    const predictions = Array.from({ length: 2001 }, (_, i) => ({
      id: `p-${i}`,
      listenerName: `name-${i}`,
      predictedCount: 1,
    }))
    const bad = { streamers: [], predictions, gilPerWord: 10000 }
    expect(() => parseImportedState(JSON.stringify(bad))).toThrow()
  })

  it('rejects an over-long listener name', () => {
    const bad = {
      streamers: [],
      predictions: [{ id: 'p1', listenerName: 'a'.repeat(61), predictedCount: 1 }],
      gilPerWord: 10000,
    }
    expect(() => parseImportedState(JSON.stringify(bad))).toThrow()
  })
})
