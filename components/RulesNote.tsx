const STREAMER_RULES = [
  'カタカナ（外来語全般＆FF専門用語）禁止',
  '1ワードにつき1万ギル没収',
  'キリ番（例: カタカナワード/11回目 100万）',
  '足の引っ張り合いOK',
  '10分以上無言禁止！',
  'ギルが足りない方はしるし財務大臣へ相談',
]

const LISTENER_RULES = [
  '配信開始40分までに予想金額（回数）をコメント',
  '予想コメント枠は1枠のみ',
  '13:30終了時点の総額に一番近かった人に総金額の物をプレゼント！',
  '参加枠のカウントの協力をお願いします',
  '誰が一番払うのかも予想してみてね／参加者をわざと誘導してみよう！',
]

export function RulesNote() {
  return (
    <details className="rounded-2xl bg-slate-800/40 p-4 ring-1 ring-white/5">
      <summary className="cursor-pointer text-sm font-bold text-slate-300">
        配信ルール（メモ）
      </summary>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-xs font-bold text-amber-300">★ 配信者ルール</h3>
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-400">
            {STREAMER_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-bold text-sky-300">★ リスナールール</h3>
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-400">
            {LISTENER_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
