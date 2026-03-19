import { NextResponse } from 'next/server'
import { db } from '@vibecode/db'

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.0.1',
  }

  try {
    // Validando que o Prisma consegue ligar e fazer queries à BD
    await db.$queryRaw`SELECT 1`
    checks.database = true
  } catch {}

  const healthy = checks.database
  return NextResponse.json(
    { success: healthy, data: checks },
    { status: healthy ? 200 : 503 }
  )
}
