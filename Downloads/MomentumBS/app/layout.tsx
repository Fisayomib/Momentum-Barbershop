import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Momentum Barbershop & Spa',
  description:
    'Premium barbershop and spa services in Lagos. Book your appointment online — haircuts, facials, massage, teeth whitening, manicure & pedicure.',
  keywords: 'barbershop, spa, Lagos, haircut, facial, massage, booking',
  openGraph: {
    title: 'Momentum Barbershop & Spa',
    description: 'Premium grooming and spa services. Book online.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-dark text-white antialiased">{children}</body>
    </html>
  )
}
