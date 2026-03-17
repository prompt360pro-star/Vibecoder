// Clerk middleware — protege todas as rotas /api/ exceto health e webhooks
import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  // Rotas públicas que NÃO requerem autenticação
  publicRoutes: [
    '/',
    '/api/health(.*)',
    '/api/webhooks(.*)',
  ],
  // Rotas ignoradas pelo middleware
  ignoredRoutes: [
    '/api/webhooks/clerk',
    '/api/webhooks/stripe',
  ],
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
