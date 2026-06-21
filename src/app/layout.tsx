import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const siteUrl = 'https://MuhamadHanjla01.github.io/tempmail-app';

export const metadata: Metadata = {
  title: {
    default: 'Temp Mail - Free Disposable Temporary Email',
    template: '%s | Temp Mail'
  },
  description: 'Keep your real inbox clean and secure. Use our free, fast, and secure disposable temporary email service to avoid spam, advertising mailings, and phishing.',
  keywords: [
    'temp mail', 'temporary email', 'disposable email', 'fake email', 
    'throwaway email', '10 minute mail', 'anonymous email', 'temp-mail', 
    'free email', 'secure email', 'trash mail'
  ],
  authors: [{ name: 'Muhamad Hanjla' }],
  creator: 'Muhamad Hanjla',
  publisher: 'Muhamad Hanjla',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Temp Mail - Free Disposable Temporary Email',
    description: 'Keep your real inbox clean. Use our free disposable temporary email service to avoid spam and phishing.',
    siteName: 'Temp Mail',
    images: [
      {
        url: `${siteUrl}/og-image.png`, // Placeholder for OG image
        width: 1200,
        height: 630,
        alt: 'Temp Mail - Free Disposable Temporary Email',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temp Mail - Free Disposable Temporary Email',
    description: 'Keep your real inbox clean. Use our free disposable temporary email service to avoid spam and phishing.',
    creator: '@MuhamadHanjla01',
    images: [`${siteUrl}/og-image.png`],
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
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider storageKey="tempmail-theme" defaultTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
