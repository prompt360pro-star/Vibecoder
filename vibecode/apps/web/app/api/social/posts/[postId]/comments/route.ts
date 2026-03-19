import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { createCommentSchema } from '@vibecode/shared'
import { sendPushNotification } from '../../../../../../lib/push-notifications'

export async function GET(
  _request: NextRequest,
  { params }: { params: { postId: string } },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      )
    }

    const comments = await db.postComment.findMany({
      where: { postId: params.postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: comments.map((comment) => ({
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user,
      })),
    })
  } catch (error) {
    console.error('[GET /api/social/posts/[postId]/comments]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } },
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, name: true, username: true, avatarUrl: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      )
    }

    const postId = params.postId
    const body = await request.json()
    const parsed = createCommentSchema.safeParse({ ...body, postId })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.issues[0]?.message || 'Invalid input' } },
        { status: 400 },
      )
    }

    const commenterName = user.name || user.username || 'Alguém'

    const result = await db.$transaction(async (tx) => {
      const post = await tx.socialPost.findUnique({
        where: { id: postId },
        select: { userId: true, content: true },
      })

      const comment = await tx.postComment.create({
        data: {
          userId: user.id,
          postId,
          content: parsed.data.content,
        },
      })

      await tx.socialPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      })

      return { comment, post }
    })

    if (result.post && result.post.userId !== user.id) {
      db.user.findUnique({
        where: { id: result.post.userId },
        select: { pushToken: true, notifySocial: true, name: true },
      }).then((author) => {
        if (author?.pushToken && author.notifySocial) {
          return sendPushNotification({
            to: author.pushToken,
            title: '💬 Novo comentário!',
            body: `${commenterName} comentou no teu post`,
            data: { type: 'social', postId },
          })
        }

        return false
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.comment.id,
        userId: result.comment.userId,
        content: result.comment.content,
        createdAt: result.comment.createdAt.toISOString(),
        user: {
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      },
    })
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string }

      if (prismaError.code === 'P2025' || prismaError.code === 'P2003') {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } },
          { status: 404 },
        )
      }
    }

    console.error('[POST /api/social/posts/[postId]/comments]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
