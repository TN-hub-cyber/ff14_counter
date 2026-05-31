'use client'

import { StreamerCard } from './StreamerCard'
import type { Streamer } from '@/lib/types'

interface StreamerGridProps {
  streamers: readonly Streamer[]
  gilPerWord: number
  kiribanGil: number
  topPayerId: string | null
  onAdjust: (streamerId: string, delta: number) => void
  onSetCount: (streamerId: string, value: number) => void
}

export function StreamerGrid({
  streamers,
  gilPerWord,
  kiribanGil,
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
          isTopPayer={streamer.id === topPayerId}
          index={index}
          onAdjust={onAdjust}
          onSetCount={onSetCount}
        />
      ))}
    </div>
  )
}
