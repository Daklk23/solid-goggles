import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Školski Portal - EduHub',
  description: 'Raspored i evidencija za školu, testovi i projekti.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <body>
        <Navigation />
        <main className="fade-in">
          {children}
        </main>
      </body>
    </html>
  )
}
