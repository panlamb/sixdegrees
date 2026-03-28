import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Six° — How far are you from anyone?',
  description: 'Build a chain of connections. Verify each link. Discover your degrees of separation.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}<Analytics /></body>
    </html>
  )
}
