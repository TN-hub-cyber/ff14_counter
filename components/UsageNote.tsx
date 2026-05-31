/** 使い方ガイドの1セクション分（見出し色は Tailwind の任意値クラスで指定） */
interface UsageSection {
  readonly title: string
  /** 見出しの文字色クラス（例: 'text-[var(--gold-bright)]'） */
  readonly accentClass: string
  readonly items: readonly string[]
}

const USAGE_SECTIONS: readonly UsageSection[] = [
  {
    title: '① カウントする',
    accentClass: 'text-[var(--gold-bright)]',
    items: [
      '配信者カードの「＋1」を押すと、その人の回数が1増えます',
      '数字を直接押すと、好きな回数をまとめて入力できます',
      '「−1」で1減らす／「0に戻す」でその人だけリセット',
    ],
  },
  {
    title: '② 金額の見かた',
    accentClass: 'text-[var(--gold-bright)]',
    items: [
      '1回ごとに、決めた金額が加算されていきます',
      '11・22などのゾロ目（キリ番）に届くと、ボーナス金額が上乗せ',
      '一番上の「総没収額」が全員の合計です',
    ],
  },
  {
    title: '③ リスナー予想',
    accentClass: 'text-[var(--crystal)]',
    items: [
      '配信者を選び、リスナー名と予想回数を入れて「追加」',
      '「🏆 合計回数 最有力」＝全員ぶんの予想を足して、合計に一番近い人',
      '各配信者の「♛ 最有力」＝その人の回数に一番近い予想',
    ],
  },
  {
    title: '④ 設定（⚙ 設定・データ管理）',
    accentClass: 'text-[var(--crystal)]',
    items: [
      '参加者の人数（最大8人）と名前を変更できます',
      '1回ぶん／キリ番ぶんの金額、単位（ギル・円など）も変更できます',
      'エクスポート＝保存／インポート＝読み込み／リセットも可能',
    ],
  },
]

export function UsageNote() {
  return (
    <details className="ff-panel px-5 py-4">
      <summary className="ff-jp cursor-pointer list-none text-sm font-bold text-[var(--gold)]">
        ❖ このサイトの使い方
      </summary>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {USAGE_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3
              className={`ff-jp mb-2 text-xs font-bold tracking-widest ${section.accentClass}`}
            >
              {section.title}
            </h3>
            <ul className="ff-jp list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  )
}
