'use client'

import { useRef, useState } from 'react'

interface ToolbarProps {
  gilPerWord: number
  kiribanGil: number
  onGilPerWordChange: (value: number) => void
  onKiribanGilChange: (value: number) => void
  onRefresh: () => void
  onExport: () => void
  onImportFile: (file: File) => void
  onResetCounts: () => void
  onResetAll: () => void
}

export function Toolbar({
  gilPerWord,
  kiribanGil,
  onGilPerWordChange,
  onKiribanGilChange,
  onRefresh,
  onExport,
  onImportFile,
  onResetCounts,
  onResetAll,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [gilText, setGilText] = useState(String(gilPerWord))
  const [kiribanText, setKiribanText] = useState(String(kiribanGil))

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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onImportFile(file)
    // 同じファイルを連続選択できるようリセット
    event.target.value = ''
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-800/50 p-4 ring-1 ring-white/5">
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <span>1ワード=</span>
        <input
          type="number"
          min={0}
          step={1000}
          value={gilText}
          onChange={(event) => setGilText(event.target.value)}
          onBlur={commitGil}
          className="w-28 rounded-lg bg-slate-900 px-2 py-1 text-right text-white tabular-nums ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label="1ワードあたりの没収ギル"
        />
        <span>ギル</span>
      </label>

      <label className="flex items-center gap-2 text-sm text-fuchsia-200">
        <span>キリ番=</span>
        <input
          type="number"
          min={0}
          step={10000}
          value={kiribanText}
          onChange={(event) => setKiribanText(event.target.value)}
          onBlur={commitKiriban}
          className="w-32 rounded-lg bg-slate-900 px-2 py-1 text-right text-white tabular-nums ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          aria-label="キリ番（ゾロ目）到達時の没収ギル"
        />
        <span>ギル</span>
      </label>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-sky-200 transition-colors hover:bg-slate-600"
        >
          DBから再読込
        </button>
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600"
        >
          エクスポート
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600"
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
        <button
          type="button"
          onClick={onResetCounts}
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-amber-200 transition-colors hover:bg-slate-600"
        >
          回数リセット
        </button>
        <button
          type="button"
          onClick={onResetAll}
          className="rounded-lg bg-rose-900/60 px-3 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-800/60"
        >
          全消去
        </button>
      </div>
    </div>
  )
}
