import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } })
    if (!user) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // week | month | alltime

    let rankings: any[] = []
    let myPosition = -1

    if (period === 'alltime') {
      const topUsers = await db.user.findMany({
        orderBy: { totalXp: 'desc' },
        take: 50,
        select: { id: true, name: true, username: true, avatarUrl: true, totalXp: true }
      })

      rankings = topUsers.map((u, i) => ({
        position: i + 1,
        id: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        xp: u.totalXp
      }))

      const myIndex = rankings.findIndex(r => r.id === user.id)
      myPosition = myIndex !== -1 ? myIndex + 1 : -1

      if (myPosition === -1) {
        // Find actual position if not in top 50 (simplification for MVP: just get rank count)
        const myActualRank = await db.user.count({
          where: {
            totalXp: { gt: (await db.user.findUnique({ where: { id: user.id }, select: { totalXp: true } }))?.totalXp || 0 }
          }
        })
        myPosition = myActualRank + 1
      }
    } else {
      // week or month
      const days = period === 'week' ? 7 : 30
      const startDate = new Date()
      startDate.setUTCDate(startDate.getUTCDate() - days)
      startDate.setUTCHours(0, 0, 0, 0)

      const recentStreaks = await db.streakDay.findMany({
        where: { date: { gte: startDate } },
        select: { userId: true, xpEarned: true }
      })

      // Aggregate XP per user
      const xpMap = new Map<string, number>()
      for (const streak of recentStreaks) {
        xpMap.set(streak.userId, (xpMap.get(streak.userId) || 0) + streak.xpEarned)
      }

      // Sort users by aggregated XP
      const sortedUserIds = Array.from(xpMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)

      // Fetch user details in bulk
      const userIdsToFetch = sortedUserIds.map(tuple => tuple[0])
      const userDetails = await db.user.findMany({
        where: { id: { in: userIdsToFetch } },
        select: { id: true, name: true, username: true, avatarUrl: true }
      })

      const detailsMap = new Map(userDetails.map(u => [u.id, u]))

      rankings = sortedUserIds.map(([uId, xp], index) => {
        const d = detailsMap.get(uId)
        return {
          position: index + 1,
          id: uId,
          name: d?.name,
          username: d?.username,
          avatarUrl: d?.avatarUrl,
          xp
        }
      })

      const myIndex = rankings.findIndex(r => r.id === user.id)
      myPosition = myIndex !== -1 ? myIndex + 1 : -1
      
      // Se não está no top 50 mas tem XP no map
      if (myPosition === -1 && xpMap.has(user.id)) {
        const myXp = xpMap.get(user.id)!
        const allSorted = Array.from(xpMap.entries()).sort((a, b) => b[1] - a[1])
        myPosition = allSorted.findIndex(a => a[0] === user.id) + 1
      }
    }

    return NextResponse.json({
      success: true,
      data: { rankings, myPosition }
    })

  } catch (error) {
    console.error('[GET /api/social/ranking]', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL', message: 'Internal server error' } }, { status: 500 })
  }
}
