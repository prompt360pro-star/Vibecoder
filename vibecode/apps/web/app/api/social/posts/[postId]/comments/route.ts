import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { createCommentSchema } from '@vibecode/shared'

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } })
    if (!user) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })

    const postId = params.postId
    const body = await request.json()
    // Inject postId to validate
    const parsed = createCommentSchema.safeParse({ ...body, postId })
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: parsed.error.issues[0]?.message || 'Invalid input' } }, { status: 400 })
    }

    const { content } = parsed.data

    const result = await db.$transaction(async (tx) => {
      const comment = await tx.postComment.create({
        data: {
          userId: user.id,
          postId: postId,
          content: content,
        }
      })
      
      await tx.socialPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      })

      return comment
    })

    return NextResponse.json({ success: true, data: result })

  } catch (error: any) {
    if (error.code === 'P2025' || error.code === 'P2003') {
        return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } }, { status: 404 })
    }
    console.error('[POST /api/social/posts/[postId]/comments]', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Internal server error' } }, { status: 500 })
  }
}
