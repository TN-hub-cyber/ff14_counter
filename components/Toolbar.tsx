'use client'

import { useRef, useState } from 'react'

interface ToolbarProps {
  gilPerWord: number
  kiribanGil: number
  unit: string
  onGilPerWordChange: (value: number) => void
  onKiribanGilChange: (value: number) => void
  onUnitChange: (unit: string) => void
  onRefresh: () => void
  onExport: () => void
  onImportFile: (file: File) => void
  onResetCounts: () => void
  onResetAll: () => void
}

export function Toolbar({
  gilPerWord,
  kiribanGil,
  unit,
  onGilPerWordChange,
  onKiribanGilChange,
  onUnitChange,
  onRefresh,
  onExport,
  onImportFile,
  onResetCounts,
  onResetAll,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [gilText, setGilText] = useState(String(gilPerWord))
  const [kiribanText, setKiribanText] = useState(String(kiribanGil))
  const [unitText, setUnitText] = useState(unit)

  function commitGil() {
    const value = gilText.trim() === '' ? 0 : Number(gilText)
    if (Number.isFinite(value) && value >= 0) {
      onGilPerWordChange(Math.floor(value))
    } else {
      setGilText(String(gilPerWord))
    }
  }

  function commitKiriban() {
    const value = kiribanText.trim() === '' ? 0 : Number(kiribanText)
    if (Number.isFinite(value) && value >= 0) {
      onKiribanGilChange(Math.floor(value))
    } else {
      setKiribanText(String(kiribanGil))
    }
  }

  function commitUnit() {
    const next = unitText.trim()
    if (next === '') {
      setUnitText(unit)
      return
    }
    onUnitChange(next)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onImportFile(file)
    // 同じファイルを連続選択できるようリセット
    event.target.value = ''
  }

  const numberInputClass =
    'ff-numeral w-32 rounded-lg border border-[var(--border-gold)] bg-black/30 px-2 py-1 text-right text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/70'
  const buttonClass =
    'ff-jp rounded-lg border border-[var(--border-gold)] bg-white/5 px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/10'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="ff-jp flex items-center gap-2 text-sm text-[var(--muted)]">
        <span>1ワード=</span>
        <input
          type="number"
          min={0}
          step={1000}
          value={gilText}
          onChange={(event) => setGilText(event.target.value)}
          onBlur={commitGil}
          className={numberInputClass}
          aria-label="1ワードあたりの没収額"
        />
        <span>{unit}</span>
      </label>

      <label className="ff-jp flex items-center gap-2 text-sm text-[#d9b6ff]">
        <span>キリ番+</span>
        <input
          type="number"
          min={0}
          step={10000}
          value={kiribanText}
          onChange={(event) => setKiribanText(event.target.value)}
          onBlur={commitKiriban}
          className={`${numberInputClass} focus:ring-[#c89bff]/70`}
          aria-label="キリ番（ゾロ目）到達時に加算する没収額"
        />
        <span>{unit}</span>
      </label>

      <label className="ff-jp flex items-center gap-2 text-sm text-[var(--muted)]">
        <span>単位=</span>
        <input
          type="text"
          maxLength={16}
          value={unitText}
          onChange={(event) => setUnitText(event.target.value)}
          onBlur={commitUnit}
          className={`${numberInputClass} text-left`}
          aria-label="没収額の単位（例: ギル、円、ポイント）"
        />
      </label>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button type="button" onClick={onRefresh} className={`${buttonClass} text-[var(--crystal)]`}>
          DBから再読込
        </button>
        <button type="button" onClick={onExport} className={buttonClass}>
          エクスポート
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={buttonClass}
        >
          インポート
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button type="button" onClick={onResetCounts} className={`${buttonClass} text-[var(--gold-bright)]`}>
          回数リセット
        </button>
        <button
          type="button"
          onClick={onResetAll}
          className="ff-jp rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm font-semibold text-[var(--rose)] transition hover:bg-rose-900/50"
        >
          全消去
        </button>
      </div>
    </div>
  )
}
