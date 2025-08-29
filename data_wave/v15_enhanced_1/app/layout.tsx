/**
 * 🏗️ ROOT LAYOUT - ENTERPRISE DATA GOVERNANCE PLATFORM
 * ====================================================
 * 
 * Enhanced root layout integrating with the EnterpriseLayoutOrchestrator
 * to provide advanced layout management, theming, and global providers
 * for the Racine Main Manager SPA.
 */

import type React from "react"

import { cookies } from "next/headers"

import { cn } from "../components/racine-main-manager/utils/cn"
import { ThemeProvider } from "../components/theme-provider"
import { Toaster } from "../components/ui/toaster"
import { EnterpriseLayoutOrchestrator } from "../components/racine-main-manager/components/layout"
import { PerformanceProvider } from "../components/providers/PerformanceProvider"
import { TooltipProvider } from "../components/ui/tooltip"
import { Providers } from "../components/providers/Providers"
import { ClientErrorBoundary } from "../components/error-boundary/ClientErrorBoundary"

import "./globals.css"

// Use system fonts to avoid Google Fonts build issues
const fontClass = "font-sans"

export const metadata = {
  title: 'Enterprise Data Governance Platform',
  description: 'Next-generation data governance platform surpassing Databricks, Microsoft Purview, and Azure in intelligence, flexibility, and enterprise power',
  keywords: 'data governance, enterprise, AI, security, compliance, analytics, databricks, purview, azure, racine',
  authors: [{ name: 'Racine Data Governance Team' }],
  openGraph: {
    title: 'Enterprise Data Governance Platform - Racine Main Manager',
    description: 'Advanced data governance platform with AI-powered insights and enterprise security',
    type: 'website'
  },
  generator: "Racine v15 Enhanced",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  const layoutMode = cookieStore.get("layout:mode")?.value || "adaptive"
  const theme = cookieStore.get("theme")?.value || "system"
  const isAuthenticated = Boolean(
    cookieStore.get('racine_auth_token')?.value || cookieStore.get('racine_session')?.value
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global ResizeObserver error suppression
              (function() {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && 
                      (message.includes('ResizeObserver loop completed with undelivered notifications') ||
                       message.includes('ResizeObserver loop limit exceeded'))) {
                    return; // Suppress the error
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && 
                      message.includes('ResizeObserver loop limit exceeded')) {
                    return; // Suppress the warning
                  }
                  originalWarn.apply(console, args);
                };
                
                // Global error handler
                window.addEventListener('error', function(event) {
                  if (event.message && typeof event.message === 'string' && 
                      event.message.includes('ResizeObserver loop')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return false;
                  }
                  return true;
                }, { capture: true });
              })();
            `
          }}
        />
      </head>
              <body className={cn("min-h-screen bg-background font-sans antialiased", fontClass)}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme={theme} 
          enableSystem 
          disableTransitionOnChange
        >
          <Providers>
            <PerformanceProvider initialEnabled={true}>
              <TooltipProvider>
                <ClientErrorBoundary
                  enableAutoRecovery={true}
                  maxRecoveryAttempts={3}
                  recoveryDelay={5000}
                >
                  {/* Let individual routes decide orchestration. Avoid global wrap to prevent double-orchestration. */}
                  <div className="min-h-screen">
                    {children}
                  </div>
                </ClientErrorBoundary>
                <Toaster />
              </TooltipProvider>
            </PerformanceProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
