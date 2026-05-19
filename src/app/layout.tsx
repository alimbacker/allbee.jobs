import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import './globals.css'

const displayFont = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'AllBee Jobs – Your Local Career Partner',
    template: '%s | AllBee Jobs',
  },
  description: 'Find local jobs near you in Tamil Nadu. AllBee Jobs connects local businesses with nearby job seekers. Search jobs in Coimbatore, Chennai, Madurai and across Tamil Nadu.',
  keywords: ['jobs in Coimbatore', 'local jobs Tamil Nadu', 'job portal', 'fresher jobs', 'part time jobs near me', 'full time jobs', 'வேலை வாய்ப்பு'],
  authors: [{ name: 'AllBee Solutions' }],
  creator: 'AllBee Solutions',
  openGraph: {
    title: 'AllBee Jobs – Your Local Career Partner',
    description: 'Find local jobs near you across Tamil Nadu',
    url: 'https://allbee.jobs',
    siteName: 'AllBee Jobs',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AllBee Jobs – Your Local Career Partner',
    description: 'Find local jobs near you across Tamil Nadu',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://allbee.jobs'),
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5C518' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <LanguageProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-body)',
                  },
                  success: { iconTheme: { primary: '#F5C518', secondary: '#0A0A0A' } },
                }}
              />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
