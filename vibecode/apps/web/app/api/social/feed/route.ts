import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { paginationSchema } from '@vibecode/shared'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get('page') || '1'
    const perPageParam = searchParams.get('perPage') || '20'
    const typeParam = searchParams.get('type') || undefined

    const paginationResult = paginationSchema.safeParse({ page: pageParam, perPage: perPageParam })
    if (!paginationResult.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: paginationResult.error.message } }, { status: 400 })
    }

    const { page, perPage } = paginationResult.data
    const skip = (page - 1) * perPage

    // Validate type if provided
    let typeFilter = undefined
    if (typeParam) {
       const typeEnum = z.enum(['ACHIEVEMENT', 'PROJECT', 'PROMPT', 'HELP', 'GENERAL']).safeParse(typeParam)
       if (typeEnum.success) {
         typeFilter = typeEnum.data
       }
    }

    const whereClause = typeFilter ? { type: typeFilter } : {}

    const [total, posts] = await Promise.all([
      db.socialPost.count({ where: whereClause }),
      db.socialPost.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        include: {
          user: { select: { id: true, name: true, username: true, avatarUrl: true, currentLevel: true } },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: user.id }, select: { id: true } }, // To check if current user liked
        },
      }),
    ])

    const formattedPosts = posts.map(post => ({
      id: post.id,
      userId: post.userId,
      type: post.type,
      content: post.content,
      codeBlock: post.codeBlock,
      attachment: post.attachment,
      tags: post.tags,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      user: post.user,
      isLikedByMe: post.likes.length > 0,
    }))

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      meta: { page, perPage, total },
    })

  } catch (error) {
    console.error('[GET /api/social/feed]', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Internal server error' } }, { status: 500 })
  }
}
