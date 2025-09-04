import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageCircle, Lightbulb, HelpCircle, Sparkles, Brain, Search, Filter, Settings, RefreshCw, Play, Pause, Square, Clock, Send, Mic, MicOff, ThumbsUp, ThumbsDown, Star, Heart, BookOpen, FileText, Code, Activity, Target, TrendingUp, BarChart3, PieChart, Plus, Edit, Trash2, Download, Upload, Save, Copy, MoreHorizontal, ExternalLink, Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle, Info, Minimize2, Maximize2, Volume2, VolumeX, History, Bookmark, Share, Tag, Users, User, Calendar, Layers, Network, Database, Cpu, HardDrive, Gauge, Zap } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// API Services
import { intelligenceAPI } from '../../services/intelligence-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';

// Types
import type { 
  ContextualHelp,
  AssistantMessage,
  AssistantQuery,
  AssistantResponse,
  HelpContext,
  UserGuidance,
  IntelligentSuggestion,
  ContextualTip,
  AssistantMetrics,
  ConversationHistory,
  UserFeedback,
  AssistantCapability,
  KnowledgeBase,
  SmartRecommendation,
  ContextualInsight,
  AdaptiveHelp,
  PersonalizedAssistance,
  LearningPattern,
  UserPreference,
  HelpCategory,
  AssistantPersonality,
  ContextualAction,
  SmartGuide
} from '../../types/intelligence.types';

import type { 
  ScanRule,
  RuleSet,
  RulePattern
} from '../../types/scan-rules.types';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { performanceCalculator } from '../../utils/performance-calculator';

interface ContextualAssistantProps {
  className?: string;
  onMessageSent?: (message: AssistantMessage) => void;
  onSuggestionSelected?: (suggestion: IntelligentSuggestion) => void;
  onFeedbackProvided?: (feedback: UserFeedback) => void;
}

interface AssistantState {
  messages: AssistantMessage[];
  suggestions: IntelligentSuggestion[];
  tips: ContextualTip[];
  guides: SmartGuide[];
  metrics: AssistantMetrics;
  history: ConversationHistory[];
  feedback: UserFeedback[];
  preferences: UserPreference;
  knowledgeBase: KnowledgeBase[];
  capabilities: AssistantCapability[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalConversations: number;
  activeConversations: number;
  satisfactionRate: number;
  responseTime: number;
  accuracyRate: number;
  helpfulnessScore: number;
  usageCount: number;
  contextualHits: number;
  feedbackCount: number;
  improvementSuggestions: number;
}

interface AssistantViewState {
  currentView: 'chat' | 'suggestions' | 'guides' | 'knowledge' | 'history' | 'settings';
  selectedConversation?: ConversationHistory;
  selectedGuide?: SmartGuide;
  selectedContext?: HelpContext;
  chatMode: 'text' | 'voice' | 'visual';
  assistantPersonality: AssistantPersonality;
  helpCategory: string;
  assistantEnabled: boolean;
  contextAware: boolean;
  adaptiveLearning: boolean;
  proactiveHelp: boolean;
  voiceEnabled: boolean;
  visualAssistance: boolean;
  showSuggestions: boolean;
  showTips: boolean;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTimeRange: 'day' | 'week' | 'month' | 'year';
  filterCategory: string;
  currentMessage: string;
  isTyping: boolean;
  isListening: boolean;
}

const DEFAULT_VIEW_STATE: AssistantViewState = {
  currentView: 'chat',
  chatMode: 'text',
  assistantPersonality: 'professional',
  helpCategory: 'all',
  assistantEnabled: true,
  contextAware: true,
  adaptiveLearning: true,
  proactiveHelp: true,
  voiceEnabled: false,
  visualAssistance: true,
  showSuggestions: true,
  showTips: true,
  searchQuery: '',
  sortBy: 'relevance',
  sortOrder: 'desc',
  selectedTimeRange: 'week',
  filterCategory: 'all',
  currentMessage: '',
  isTyping: false,
  isListening: false
};

const ASSISTANT_PERSONALITIES = [
  { value: 'professional', label: 'Professional', description: 'Formal and precise assistance' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable guidance' },
  { value: 'expert', label: 'Expert', description: 'Technical and detailed explanations' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'mentor', label: 'Mentor', description: 'Educational and encouraging' }
];

const HELP_CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: HelpCircle },
  { value: 'rules', label: 'Scan Rules', icon: Target },
  { value: 'patterns', label: 'Pattern Matching', icon: Search },
  { value: 'performance', label: 'Performance', icon: Gauge },
  { value: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
  { value: 'configuration', label: 'Configuration', icon: Settings },
  { value: 'best_practices', label: 'Best Practices', icon: Lightbulb },
  { value: 'tutorials', label: 'Tutorials', icon: BookOpen }
];

const QUICK_ACTIONS = [
  { id: 'explain_rule', label: 'Explain this rule', icon: FileText },
  { id: 'optimize_performance', label: 'Optimize performance', icon: Gauge },
  { id: 'troubleshoot_issue', label: 'Troubleshoot issue', icon: AlertTriangle },
  { id: 'suggest_improvements', label: 'Suggest improvements', icon: Lightbulb },
  { id: 'show_examples', label: 'Show examples', icon: Code },
  { id: 'check_best_practices', label: 'Check best practices', icon: CheckCircle2 }
];

const SAMPLE_SUGGESTIONS = [
  {
    id: '1',
    title: 'Optimize Rule Performance',
    description: 'Consider adding indexing to improve scan rule execution time',
    category: 'performance',
    confidence: 0.92,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Pattern Matching Enhancement',
    description: 'Use regex patterns instead of wildcard matching for better accuracy',
    category: 'patterns',
    confidence: 0.87,
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Error Handling Improvement',
    description: 'Add exception handling for edge cases in data processing',
    category: 'best_practices',
    confidence: 0.89,
    priority: 'high'
  }
];

export const ContextualAssistant: React.FC<ContextualAssistantProps> = ({
  className,
  onMessageSent,
  onSuggestionSelected,
  onFeedbackProvided
}) => {
  // State Management
  const [viewState, setViewState] = useState<AssistantViewState>(DEFAULT_VIEW_STATE);
  const [assistantState, setAssistantState] = useState<AssistantState>({
    messages: [],
    suggestions: SAMPLE_SUGGESTIONS,
    tips: [],
    guides: [],
    metrics: {} as AssistantMetrics,
    history: [],
    feedback: [],
    preferences: {} as UserPreference,
    knowledgeBase: [],
    capabilities: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalConversations: 0,
    activeConversations: 0,
    satisfactionRate: 0,
    responseTime: 0,
    accuracyRate: 0,
    helpfulnessScore: 0,
    usageCount: 0,
    contextualHits: 0,
    feedbackCount: 0,
    improvementSuggestions: 0
  });

  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  // Form States
  const [feedbackForm, setFeedbackForm] = useState({
    messageId: '',
    rating: 5,
    helpful: true,
    category: 'general',
    comment: '',
    suggestions: ''
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<any>(null);

  // Custom Hooks
  const {
    getInsights,
    analyzePerformance,
    generatePredictions,
    loading: intelligenceLoading
  } = useIntelligence();

  const {
    scanRules,
    ruleSets,
    getRules,
    loading: rulesLoading
  } = useScanRules();

  const {
    generateReport,
    getAnalytics,
    loading: reportingLoading
  } = useReporting();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.assistantEnabled) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/contextual-assistant`);
      
      wsRef.current.onopen = () => {
        console.log('Contextual Assistant WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Contextual Assistant WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Contextual Assistant WebSocket disconnected');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewState.assistantEnabled]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'assistant_response':
        setAssistantState(prev => ({
          ...prev,
          messages: [...prev.messages, data.message],
          totalConversations: prev.totalConversations + 1
        }));
        setViewState(prev => ({ ...prev, isTyping: false }));
        break;
      case 'suggestion_generated':
        setAssistantState(prev => ({
          ...prev,
          suggestions: [...prev.suggestions, data.suggestion],
          contextualHits: prev.contextualHits + 1
        }));
        break;
      case 'tip_generated':
        setAssistantState(prev => ({
          ...prev,
          tips: [...prev.tips, data.tip]
        }));
        break;
      case 'metrics_updated':
        setAssistantState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (viewState.voiceEnabled && 'webkitSpeechRecognition' in window) {
      speechRecognitionRef.current = new (window as any).webkitSpeechRecognition();
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.interimResults = false;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setViewState(prev => ({ ...prev, currentMessage: transcript, isListening: false }));
      };

      speechRecognitionRef.current.onerror = () => {
        setViewState(prev => ({ ...prev, isListening: false }));
      };
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [viewState.voiceEnabled]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantState.messages]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setAssistantState(prev => ({ ...prev, loading: true, error: null }));

      const [historyData, metricsData, knowledgeData] = await Promise.all([
        intelligenceAPI.getConversationHistory({ timeRange: viewState.selectedTimeRange }),
        intelligenceAPI.getAssistantMetrics(),
        intelligenceAPI.getKnowledgeBase({ category: viewState.filterCategory })
      ]);

      setAssistantState(prev => ({
        ...prev,
        history: historyData.conversations,
        metrics: metricsData,
        knowledgeBase: knowledgeData.articles,
        totalConversations: historyData.total,
        activeConversations: historyData.active,
        satisfactionRate: metricsData.satisfactionRate || 0,
        responseTime: metricsData.averageResponseTime || 0,
        accuracyRate: metricsData.accuracyRate || 0,
        helpfulnessScore: metricsData.helpfulnessScore || 0,
        loading: false,
        lastUpdated: new Date()
      }));

    } catch (error) {
      console.error('Failed to refresh assistant data:', error);
      setAssistantState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.selectedTimeRange, viewState.filterCategory]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Assistant Functions
  const sendMessage = useCallback(async (message: string, context?: HelpContext) => {
    if (!message.trim()) return;

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date(),
      context: context
    };

    setAssistantState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    setViewState(prev => ({ ...prev, currentMessage: '', isTyping: true }));

    if (onMessageSent) onMessageSent(userMessage);

    try {
      const response = await intelligenceAPI.processAssistantQuery({
        message: message,
        context: context,
        personality: viewState.assistantPersonality,
        conversationHistory: assistantState.messages.slice(-10) // Last 10 messages for context
      });

      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        type: 'assistant',
        timestamp: new Date(),
        suggestions: response.suggestions,
        actions: response.actions
      };

      setAssistantState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        usageCount: prev.usageCount + 1
      }));

      // Text-to-speech if enabled
      if (viewState.voiceEnabled && speechSynthesisRef.current) {
        const utterance = new SpeechSynthesisUtterance(response.content);
        speechSynthesisRef.current.speak(utterance);
      }

    } catch (error) {
      console.error('Failed to get assistant response:', error);
      const errorMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        type: 'assistant',
        timestamp: new Date(),
        error: true
      };

      setAssistantState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setViewState(prev => ({ ...prev, isTyping: false }));
    }
  }, [viewState.assistantPersonality, viewState.voiceEnabled, assistantState.messages, onMessageSent]);

  const handleQuickAction = useCallback((actionId: string) => {
    const action = QUICK_ACTIONS.find(a => a.id === actionId);
    if (action) {
      sendMessage(`Help me ${action.label.toLowerCase()}`, { type: 'quick_action', actionId });
    }
  }, [sendMessage]);

  const selectSuggestion = useCallback((suggestion: IntelligentSuggestion) => {
    if (onSuggestionSelected) onSuggestionSelected(suggestion);
    
    setAssistantState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestion.id)
    }));

    sendMessage(`Tell me more about: ${suggestion.title}`, { 
      type: 'suggestion', 
      suggestionId: suggestion.id 
    });
  }, [onSuggestionSelected, sendMessage]);

  const provideFeedback = useCallback(async (messageId: string, helpful: boolean, rating?: number) => {
    try {
      const feedback: UserFeedback = {
        messageId: messageId,
        helpful: helpful,
        rating: rating || (helpful ? 5 : 2),
        timestamp: new Date(),
        category: feedbackForm.category,
        comment: feedbackForm.comment
      };

      await intelligenceAPI.submitAssistantFeedback(feedback);

      setAssistantState(prev => ({
        ...prev,
        feedback: [...prev.feedback, feedback],
        feedbackCount: prev.feedbackCount + 1,
        satisfactionRate: helpful 
          ? Math.min(prev.satisfactionRate + 0.1, 1)
          : Math.max(prev.satisfactionRate - 0.1, 0)
      }));

      if (onFeedbackProvided) onFeedbackProvided(feedback);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }, [feedbackForm, onFeedbackProvided]);

  const startVoiceInput = useCallback(() => {
    if (speechRecognitionRef.current && !viewState.isListening) {
      setViewState(prev => ({ ...prev, isListening: true }));
      speechRecognitionRef.current.start();
    }
  }, [viewState.isListening]);

  const stopVoiceInput = useCallback(() => {
    if (speechRecognitionRef.current && viewState.isListening) {
      setViewState(prev => ({ ...prev, isListening: false }));
      speechRecognitionRef.current.stop();
    }
  }, [viewState.isListening]);

  // Utility Functions
  const formatTimestamp = useCallback((timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  }, []);

  const getSuggestionPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    const cat = HELP_CATEGORIES.find(c => c.value === category);
    if (cat) {
      const IconComponent = cat.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <HelpCircle className="h-4 w-4" />;
  }, []);

  // Filter Functions
  const filteredSuggestions = useMemo(() => {
    let filtered = assistantState.suggestions;

    if (viewState.searchQuery) {
      filtered = filtered.filter(suggestion => 
        suggestion.title.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.filterCategory !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.category === viewState.filterCategory);
    }

    return filtered.sort((a, b) => {
      if (viewState.sortBy === 'confidence') {
        return viewState.sortOrder === 'desc' ? b.confidence - a.confidence : a.confidence - b.confidence;
      }
      return 0;
    });
  }, [assistantState.suggestions, viewState.searchQuery, viewState.filterCategory, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderChatInterface = () => (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {assistantState.messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your AI Assistant</h3>
                <p className="text-gray-500 mb-4">Ask me anything about scan rules, patterns, or performance optimization.</p>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  {QUICK_ACTIONS.slice(0, 4).map(action => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.id)}
                      className="justify-start"
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {assistantState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.error
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {message.type === 'assistant' && (
                      <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <div className="text-xs opacity-70 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Message Actions */}
                  {message.type === 'assistant' && !message.error && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => provideFeedback(message.id, true)}
                        className="h-6 w-6 p-0"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => provideFeedback(message.id, false)}
                        className="h-6 w-6 p-0"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFeedbackDialogOpen(true)}
                        className="h-6 w-6 p-0"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => sendMessage(suggestion)}
                          className="w-full text-left justify-start text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {viewState.isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-1">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={viewState.currentMessage}
              onChange={(e) => setViewState(prev => ({ ...prev, currentMessage: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(viewState.currentMessage);
                }
              }}
              placeholder="Ask me anything..."
              className="pr-10"
            />
            {viewState.voiceEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={viewState.isListening ? stopVoiceInput : startVoiceInput}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 ${
                  viewState.isListening ? 'text-red-600' : 'text-gray-400'
                }`}
              >
                {viewState.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <Button
            onClick={() => sendMessage(viewState.currentMessage)}
            disabled={!viewState.currentMessage.trim() || viewState.isTyping}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Smart Suggestions</h3>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {filteredSuggestions.map(suggestion => (
          <Card key={suggestion.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(suggestion.category)}
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <Badge className={getSuggestionPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500">
                      Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                    </div>
                    <Progress value={suggestion.confidence * 100} className="w-20 h-2" />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Assistant Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistantState.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              {assistantState.activeConversations} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(assistantState.satisfactionRate * 100).toFixed(1)}%
            </div>
            <Progress value={assistantState.satisfactionRate * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistantState.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              average response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Helpfulness Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {assistantState.helpfulnessScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              out of 5.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map(action => (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleQuickAction(action.id)}
                className="justify-start h-auto p-3"
              >
                <action.icon className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">{action.label}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assistantState.history.slice(0, 5).map((conversation, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border-l-2 border-l-blue-300">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {conversation.summary || 'General conversation'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(conversation.startTime).toLocaleString()}
                  </div>
                </div>
                <Badge variant="secondary">
                  {conversation.messageCount} messages
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Contextual Assistant</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  viewState.assistantEnabled ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {viewState.assistantEnabled ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.assistantPersonality}
                onValueChange={(value) => setViewState(prev => ({ ...prev, assistantPersonality: value as AssistantPersonality }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSISTANT_PERSONALITIES.map(personality => (
                    <SelectItem key={personality.value} value={personality.value}>
                      {personality.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Switch
                checked={viewState.assistantEnabled}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, assistantEnabled: checked }))}
              />
              <span className="text-sm text-gray-600">Enable Assistant</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="guides" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Guides
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Knowledge
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="h-[calc(100vh-12rem)]">
              <TabsContent value="chat" className="h-full mt-0 p-0">
                <div className="h-full">
                  {renderChatInterface()}
                </div>
              </TabsContent>
              <TabsContent value="suggestions" className="h-full mt-0 p-6">
                {renderSuggestions()}
              </TabsContent>
              <TabsContent value="guides" className="h-full mt-0 p-6">
                <div>Smart Guides (To be implemented)</div>
              </TabsContent>
              <TabsContent value="knowledge" className="h-full mt-0 p-6">
                <div>Knowledge Base (To be implemented)</div>
              </TabsContent>
              <TabsContent value="history" className="h-full mt-0 p-6">
                <div>Conversation History (To be implemented)</div>
              </TabsContent>
              <TabsContent value="settings" className="h-full mt-0 p-6">
                <div>Assistant Settings (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Provide Feedback</DialogTitle>
              <DialogDescription>
                Help us improve the assistant experience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Slider
                  value={[feedbackForm.rating]}
                  onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, rating: value[0] }))}
                  max={5}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div>
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Tell us about your experience..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  provideFeedback(feedbackForm.messageId, feedbackForm.helpful, feedbackForm.rating);
                  setFeedbackDialogOpen(false);
                }}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ContextualAssistant;