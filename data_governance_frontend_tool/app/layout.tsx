import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | PurSight Data Governance',
    default: 'PurSight - Enterprise Data Governance Platform',
  },
  description: 'Advanced Enterprise Data Governance Platform with AI/ML Intelligence, Real-time Orchestration, and Comprehensive Integration across all data governance groups.',
  keywords: [
    'data governance',
    'data catalog',
    'compliance',
    'data classification',
    'scan rules',
    'RBAC',
    'enterprise',
    'AI/ML',
    'real-time',
    'orchestration'
  ],
  authors: [{ name: 'PurSight Team' }],
  creator: 'PurSight',
  publisher: 'PurSight',
  robots: {
    index: false, // Set to true in production
    follow: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        
        {/* DNS prefetch for API calls */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background font-sans`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--accent))',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'white',
                },
              },
            }}
          />
        </Providers>
        
        {/* Development tools */}
        {process.env.NODE_ENV === 'development' && (
          <div id="development-tools" className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity">
            <div className="bg-black text-white text-xs px-2 py-1 rounded">
              DEV MODE
            </div>
          </div>
        )}
      </body>
    </html>
  );
}