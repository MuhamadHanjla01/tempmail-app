import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const siteUrl = 'https://muhamadhanjla01.github.io/tempmail-app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Temp Mail - Free Disposable Temporary Email Address',
    template: '%s | Temp Mail - Disposable Email'
  },
  description: 'Get a free, instant, disposable temporary email address. No registration required. Protect your privacy, avoid spam, phishing, and advertising mailings with TempMail.',
  keywords: [
    'temp mail', 'temporary email', 'disposable email', 'fake email',
    'throwaway email', '10 minute mail', 'anonymous email', 'temp-mail',
    'free email', 'secure email', 'trash mail', 'temporary email address',
    'disposable email address', 'burner email', 'one time email',
    'private email', 'anti spam email', 'temp inbox', 'tempmail free',
    'instant email', 'no signup email', 'anonymous inbox'
  ],
  authors: [{ name: 'Muhamad Hanjla', url: siteUrl }],
  creator: 'Muhamad Hanjla',
  publisher: 'Muhamad Hanjla',
  category: 'Technology',
  applicationName: 'TempMail',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Temp Mail - Free Disposable Temporary Email Address',
    description: 'Get a free, instant, disposable temporary email address. No registration required. Protect your privacy and avoid spam with TempMail.',
    siteName: 'TempMail',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TempMail - Free Disposable Temporary Email Address',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temp Mail - Free Disposable Temporary Email',
    description: 'Get a free, instant, disposable temporary email address. No registration. Protect your privacy and avoid spam.',
    creator: '@MuhamadHanjla01',
    images: ['/og-image.png'],
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
  verification: {
    google: 'YiWSYTrc8xwGDhiH7ItMz0x7u9guHFEdYD5_r-Dovco',
  },
  manifest: '/tempmail-app/manifest.json',
  other: {
    'msapplication-TileColor': '#8b5cf6',
    'apple-mobile-web-app-title': 'TempMail',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'TempMail',
  alternateName: 'Temp Mail',
  url: siteUrl,
  description: 'Free disposable temporary email address service. No registration required. Protect your privacy and avoid spam, phishing, and advertising mailings.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Person',
    name: 'Muhamad Hanjla',
  },
  featureList: [
    'Instant disposable email generation',
    'No registration required',
    'Auto-refresh inbox',
    'Privacy protection',
    'Spam prevention',
    'PWA support',
  ],
  screenshot: `${siteUrl}/og-image.png`,
  browserRequirements: 'Requires JavaScript',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="dns-prefetch" href="https://api.mail.tm" />
        <link rel="preconnect" href="https://api.mail.tm" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider storageKey="tempmail-theme" defaultTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
