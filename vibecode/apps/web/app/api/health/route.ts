import { NextResponse } from 'next/server'

// Endpoint de health check — usado para verificar que a API está funcional
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      service: 'vibecode-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    },
  })
}
