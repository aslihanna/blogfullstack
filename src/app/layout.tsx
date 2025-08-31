import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

export const metadata: Metadata = {
  title: {
    default: 'Blog Uygulaması - Modern Blog Platformu',
    template: '%s | Blog Uygulaması'
  },
  description: 'Modern ve kullanıcı dostu blog platformu. Yazılarınızı paylaşın, okuyucularınızla etkileşime geçin.',
  keywords: ['blog', 'yazı', 'platform', 'içerik', 'paylaşım', 'okuma'],
  authors: [{ name: 'Blog Uygulaması' }],
  creator: 'Blog Uygulaması',
  publisher: 'Blog Uygulaması',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://blogapp.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://blogapp.com',
    siteName: 'Blog Uygulaması',
    title: 'Blog Uygulaması - Modern Blog Platformu',
    description: 'Modern ve kullanıcı dostu blog platformu. Yazılarınızı paylaşın, okuyucularınızla etkileşime geçin.',
    images: [
      {
        url: 'https://blogapp.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog Uygulaması',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Uygulaması - Modern Blog Platformu',
    description: 'Modern ve kullanıcı dostu blog platformu. Yazılarınızı paylaşın, okuyucularınızla etkileşime geçin.',
    images: ['https://blogapp.com/og-image.jpg'],
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
             <body className="font-sans" suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Providers>
      </body>
    </html>
  )
}
