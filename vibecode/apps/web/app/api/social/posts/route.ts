import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { createPostSchema } from '@vibecode/shared'

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })
    }

    const body = await request.json()
    const parsed = createPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: parsed.error.issues[0]?.message || 'Invalid input' } }, { status: 400 })
    }

    const post = await db.socialPost.create({
      data: {
        userId: user.id,
        type: parsed.data.type,
        content: parsed.data.content,
        codeBlock: parsed.data.codeBlock,
        tags: parsed.data.tags || [],
      },
    })

    return NextResponse.json({
      success: true,
      data: post,
    })

  } catch (error) {
    console.error('[POST /api/social/posts]', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Internal server error' } }, { status: 500 })
  }
}
