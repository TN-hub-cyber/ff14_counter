import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getBoardState, saveBoardState } from '@/lib/db'
import { appStateSchema } from '@/lib/schema'

// 常に最新を返す（キャッシュさせない）／Node ランタイムで実行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// リクエストボディの上限（巨大ペイロードによる DoS 対策）
const MAX_BODY_BYTES = 1_000_000

/**
 * 書き込み権限の確認。
 * BOARD_WRITE_TOKEN が未設定なら誰でも書き込める（後方互換）。
 * 設定されている場合は x-board-token ヘッダーと定数時間比較で一致を要求する。
 */
function isWriteAuthorized(request: Request): boolean {
  const expected = process.env.BOARD_WRITE_TOKEN
  if (!expected) return true
  const provided = request.headers.get('x-board-token') ?? ''
  const expectedBuf = Buffer.from(expected, 'utf8')
  const providedBuf = Buffer.from(provided, 'utf8')
  if (expectedBuf.length !== providedBuf.length) return false
  return timingSafeEqual(expectedBuf, providedBuf)
}

export async function GET() {
  try {
    const state = await getBoardState()
    return NextResponse.json({ state })
  } catch (error) {
    console.error('GET /api/state failed:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    if (!isWriteAuthorized(request)) {
      return NextResponse.json(
        { error: '書き込み権限がありません' },
        { status: 401 },
      )
    }

    const text = await request.text()
    if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'データが大きすぎます' },
        { status: 413 },
      )
    }

    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: 'JSON を解析できませんでした' },
        { status: 400 },
      )
    }

    const parsed = appStateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '状態データの形式が不正です' },
        { status: 400 },
      )
    }

    await saveBoardState(parsed.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PUT /api/state failed:', error)
    return NextResponse.json(
      { error: 'データの保存に失敗しました' },
      { status: 500 },
    )
  }
}
