import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'

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

    // Executar transacção para garantir atomicidade
    const result = await db.$transaction(async (tx) => {
      const existingLike = await tx.postLike.findUnique({
        where: { userId_postId: { userId: user.id, postId } }
      })

      if (existingLike) {
        // Remover like
        await tx.postLike.delete({ where: { id: existingLike.id } })
        const post = await tx.socialPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
          select: { likesCount: true }
        })
        return { liked: false, likesCount: post.likesCount }
      } else {
        // Adicionar like
        await tx.postLike.create({
          data: { userId: user.id, postId }
        })
        const post = await tx.socialPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
          select: { likesCount: true }
        })
        return { liked: true, likesCount: post.likesCount }
      }
    })

    return NextResponse.json({ success: true, data: result })

  } catch (error: any) {
    // Tratar RecordNotFound erro (quando postId não existe e update falha)
    if (error.code === 'P2025') {
        return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } }, { status: 404 })
    }
    console.error('[POST /api/social/posts/[postId]/like]', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Internal server error' } }, { status: 500 })
  }
}
