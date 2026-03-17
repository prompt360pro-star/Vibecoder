import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VibeCode — Code the future. Ride the vibe.',
  description: 'Aprende a construir apps com IA. O Duolingo da programação com IA.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.JSX.Element {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
