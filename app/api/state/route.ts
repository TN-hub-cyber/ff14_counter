import { NextResponse } from 'next/server'
import { getBoardState, saveBoardState } from '@/lib/db'
import { appStateSchema } from '@/lib/schema'

// 常に最新を返す（キャッシュさせない）
export const dynamic = 'force-dynamic'

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
    const body: unknown = await request.json()
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
