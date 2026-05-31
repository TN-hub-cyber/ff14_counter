'use client'

import { StreamerCard } from './StreamerCard'
import type { Streamer } from '@/lib/types'

interface StreamerGridProps {
  streamers: readonly Streamer[]
  gilPerWord: number
  kiribanGil: number
  unit: string
  topPayerId: string | null
  onAdjust: (streamerId: string, delta: number) => void
  onSetCount: (streamerId: string, value: number) => void
}

export function StreamerGrid({
  streamers,
  gilPerWord,
  kiribanGil,
  unit,
  topPayerId,
  onAdjust,
  onSetCount,
}: StreamerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {streamers.map((streamer, index) => (
        <StreamerCard
          key={streamer.id}
          streamer={streamer}
          gilPerWord={gilPerWord}
          kiribanGil={kiribanGil}
          unit={unit}
          isTopPayer={streamer.id === topPayerId}
          index={index}
          onAdjust={onAdjust}
          onSetCount={onSetCount}
        />
      ))}
    </div>
  )
}
