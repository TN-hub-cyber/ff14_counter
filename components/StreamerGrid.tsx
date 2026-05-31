'use client'

import { StreamerCard } from './StreamerCard'
import type { Streamer } from '@/lib/types'

interface StreamerGridProps {
  streamers: readonly Streamer[]
  gilPerWord: number
  kiribanGil: number
  onAdjust: (streamerId: string, delta: number) => void
  onSetCount: (streamerId: string, value: number) => void
}

export function StreamerGrid({
  streamers,
  gilPerWord,
  kiribanGil,
  onAdjust,
  onSetCount,
}: StreamerGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {streamers.map((streamer) => (
        <StreamerCard
          key={streamer.id}
          streamer={streamer}
          gilPerWord={gilPerWord}
          kiribanGil={kiribanGil}
          onAdjust={onAdjust}
          onSetCount={onSetCount}
        />
      ))}
    </div>
  )
}
