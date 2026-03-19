import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { sendPushNotification } from '../../../../../../lib/push-notifications'

export async function POST(
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
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      )
    }

    const postId = params.postId

    const result = await db.$transaction(async (tx) => {
      const existingLike = await tx.postLike.findUnique({
        where: { userId_postId: { userId: user.id, postId } },
      })

      if (existingLike) {
        await tx.postLike.delete({ where: { id: existingLike.id } })

        const post = await tx.socialPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
          select: { likesCount: true, userId: true },
        })

        if (post.likesCount < 0) {
          await tx.socialPost.update({
            where: { id: postId },
            data: { likesCount: 0 },
          })

          return { liked: false, likesCount: 0, userId: post.userId }
        }

        return { liked: false, likesCount: post.likesCount, userId: post.userId }
      }

      await tx.postLike.create({
        data: { userId: user.id, postId },
      })

      const post = await tx.socialPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true, userId: true },
      })

      return { liked: true, likesCount: post.likesCount, userId: post.userId }
    })

    if (result.liked && result.userId !== user.id) {
      db.user.findUnique({
        where: { id: result.userId },
        select: { pushToken: true, notifySocial: true },
      }).then((author) => {
        if (author?.pushToken && author.notifySocial) {
          return sendPushNotification({
            to: author.pushToken,
            title: '👏 Novo like!',
            body: 'Alguém aplaudiu o teu post',
            data: { type: 'social', postId },
          })
        }

        return false
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string }

      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } },
          { status: 404 },
        )
      }
    }

    console.error('[POST /api/social/posts/[postId]/like]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
