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
    <details className="ff-panel px-5 py-4">
      <summary className="ff-jp cursor-pointer list-none text-sm font-bold text-[var(--gold)]">
        ❖ 配信ルール（メモ）
      </summary>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="ff-jp mb-2 text-xs font-bold tracking-widest text-[var(--gold-bright)]">
            ★ 配信者ルール
          </h3>
          <ul className="ff-jp list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
            {STREAMER_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="ff-jp mb-2 text-xs font-bold tracking-widest text-[var(--crystal)]">
            ★ リスナールール
          </h3>
          <ul className="ff-jp list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
            {LISTENER_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
