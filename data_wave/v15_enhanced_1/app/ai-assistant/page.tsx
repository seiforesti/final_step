/**
 * 🤖 AI ASSISTANT PAGE
 * ====================
 * 
 * Next.js App Router page for the AI Assistant
 * Integrates with the AIAssistantInterface to provide
 * context-aware AI interface with SPA intelligence.
 */

import React from 'react';
import { Metadata } from 'next';
import { AIAssistantInterface } from '@/components/racine-main-manager/components/ai-assistant';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'AI Assistant | Enterprise Data Governance Platform',
  description: 'Intelligent AI assistant for data governance with natural language queries and automated recommendations.',
  keywords: 'AI, assistant, natural language, automation, recommendations, intelligence',
  openGraph: {
    title: 'AI Assistant',
    description: 'Context-aware AI interface with SPA intelligence',
    type: 'website'
  }
};

// ============================================================================
// MAIN AI ASSISTANT PAGE
// ============================================================================

export default function AIAssistantPage() {
  return (
    <AIAssistantInterface 
      mode="full-interface"
      enableNaturalLanguageQueries={true}
      enableContextAwareness={true}
      enableProactiveGuidance={true}
      enableWorkflowAutomation={true}
      enableAnomalyDetection={true}
      enablePredictiveAnalytics={true}
      enableCrossGroupInsights={true}
      enableSmartRecommendations={true}
      enableConversationHistory={true}
      enableNotifications={true}
      showSystemContext={true}
      showRecommendations={true}
      showInsights={true}
      showQuickActions={true}
      showConversationHistory={true}
    />
  );
}