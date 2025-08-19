/**
 * 🏗️ ROOT LAYOUT - ENTERPRISE DATA GOVERNANCE PLATFORM
 * =====================================================
 * 
 * Enhanced root layout integrating with the MasterLayoutOrchestrator
 * to provide advanced layout management, theming, and global providers
 * for the Racine Main Manager SPA.
 */

import type React from "react"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { FixResizeObserver } from "@/components/fix-resize-observer"
import { MasterLayoutOrchestrator } from "@/components/racine-main-manager/components/layout"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  const layoutMode = cookieStore.get("layout:mode")?.value || "adaptive"
  const theme = cookieStore.get("theme")?.value || "system"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme={theme} 
          enableSystem 
          disableTransitionOnChange
        >
          <FixResizeObserver />
          <MasterLayoutOrchestrator
            currentView={null}
            layoutMode={layoutMode as any}
            spaContext={null}
            userPreferences={{
              sidebarOpen: defaultOpen,
              theme: theme as any,
              layout: layoutMode as any
            }}
            enableResponsive={true}
            enableAnalytics={true}
            enableAccessibility={true}
            enablePerformanceOptimization={true}
            theme={theme as any}
            className="min-h-screen"
          >
            {children}
          </MasterLayoutOrchestrator>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
