// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter, Dancing_Script, Playfair_Display } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { UserProvider } from '@/contexts/UserContext'

// ─── Fonts ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial', 'sans-serif'],
  adjustFontFallback: true,
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
  display: 'swap',
  preload: false, // loaded on demand — used only in logo/branding
  fallback: ['cursive'],
  adjustFontFallback: false,
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false, // loaded on demand — used only in headings
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: false,
})

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Removed maximumScale/userScalable — better accessibility (users can zoom freely)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0A2472' },
    { media: '(prefers-color-scheme: dark)', color: '#0A2472' },
  ],
  colorScheme: 'light',
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL('https://vincollinsschools.org'),

  title: {
    default: 'Vincollins Schools | Affordable Quality Education in Lagos',
    template: '%s | Vincollins Schools',
  },

  description:
    'Vincollins Schools in Surulere, Lagos offers Crèche, Nursery, Primary, and College education. Geared towards excellence since 2022.',

  applicationName: 'Vincollins Schools',
  authors: [{ name: 'Mrs. Joy Adaobi Nnoli' }],
  creator: 'Vincollins Schools',
  publisher: 'Vincollins Schools',
  generator: 'Next.js',

  // ✅ Keep telephone detection ON — parents need tap-to-call
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://vincollinsschools.org',
    siteName: 'Vincollins Schools',
    title: 'Vincollins Schools | Affordable Quality Education in Lagos',
    description:
      'Crèche, Nursery, Primary and College education in Surulere, Lagos. Building excellence, one child at a time.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vincollins Schools — Geared Towards Excellence',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Vincollins Schools | Lagos',
    description: 'Affordable, convenient, and excellent education in Surulere.',
    images: ['/images/twitter-image.jpg'],
    creator: '@vincollins',
    site: '@vincollins',
  },

  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any', type: 'image/png' },
      { url: '/images/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/icons/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.png'],
  },

  manifest: '/manifest.json',
  alternates: { canonical: 'https://vincollinsschools.org' },
  category: 'education',
  classification: 'Private Educational Institution',

  // Verification (add your codes when available)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  other: {
    'apple-mobile-web-app-capable':          'yes',
    'apple-mobile-web-app-title':            'Vincollins',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable':                'yes',
    'msapplication-TileColor':               '#0A2472',
    'msapplication-TileImage':               '/images/icons/icon-192.png',
    'msapplication-config':                  'none',
  },
}

// ─── Schema.org JSON-LD ───────────────────────────────────────────────────────

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': 'https://vincollinsschools.org/#organization',
  name: 'Vincollins Schools',
  alternateName: 'Vincollins',
  url: 'https://vincollinsschools.org',
  logo: {
    '@type': 'ImageObject',
    url: 'https://vincollinsschools.org/images/logo.png',
    width: 512,
    height: 512,
  },
  image: 'https://vincollinsschools.org/images/og-image.jpg',
  description:
    'Vincollins Schools offers affordable, convenient, and excellent educational background for children in Lagos.',
  slogan: 'Geared Towards Excellence',
  foundingDate: '2022', // ✅ Fixed to match footer
  founder: {
    '@type': 'Person',
    name: 'Mrs. Joy Adaobi Nnoli',
    jobTitle: 'Proprietress',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '7/9 Lawani Street, off Ishaga Road',
    addressLocality: 'Surulere',
    addressRegion: 'Lagos',
    addressCountry: 'NG',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+234-912-1155-554',
    contactType: 'Admissions',
    areaServed: 'NG',
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://facebook.com/vincollins',
    'https://twitter.com/vincollins',
    'https://instagram.com/vincollins',
    'https://linkedin.com/school/vincollins',
  ],
  knowsAbout: [
    'Early Years Education',
    'Primary Education',
    'Secondary Education',
    'Character Building',
    'ICT Education',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Academic Programmes',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'EducationalOccupationalProgram',
          name: 'Crèche & Playgroup',
          description: 'Early foundation care (0–2 yrs).',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'EducationalOccupationalProgram',
          name: 'Nursery',
          educationalCredentialAwarded: 'Early Years Foundation',
          description: 'Nursery education (2–5 yrs).',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'EducationalOccupationalProgram',
          name: 'Primary',
          educationalCredentialAwarded: 'Primary School Leaving Certificate',
          description: 'Primary education (5–11 yrs).',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'EducationalOccupationalProgram',
          name: 'College',
          educationalCredentialAwarded: 'Secondary School Certificate',
          description: 'Secondary education (11–17 yrs).',
        },
      },
    ],
  },
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cn(
        inter.variable,
        dancingScript.variable,
        playfair.variable,
        'font-sans',
      )}
      suppressHydrationWarning
    >
      <head>
        {/*
          ✅ Preconnect for critical origins — establishes TCP + TLS handshake early
          (Next.js auto-preconnects Google Fonts, but doing it again is harmless)
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://mvittkvxtasayycmzgha.supabase.co"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://mvittkvxtasayycmzgha.supabase.co" />

        {/* ✅ Schema.org JSON-LD for rich search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>

      <body
        className={cn(
          'antialiased bg-[#F9F7F4] text-[#0A2472]',
          'min-h-screen flex flex-col',
          'selection:bg-[#F5A623]/30 selection:text-[#0A2472]',
        )}
        suppressHydrationWarning
      >
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}