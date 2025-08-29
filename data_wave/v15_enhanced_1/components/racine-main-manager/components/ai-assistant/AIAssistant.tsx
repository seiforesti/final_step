"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Mic,
  Paperclip,
  MoreHorizontal,
  Brain,
  Zap,
  Database,
  Shield,
  FileText,
  GitBranch,
  Activity,
  Settings,
  RefreshCw,
} from "lucide-react"

import { cn } from "../../utils/cn"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback } from "../ui/avatar"

interface AIMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
  suggestions?: string[]
}

interface AIAssistantProps {
  isOpen?: boolean
  onClose?: () => void
  mode?: "floating" | "docked" | "fullscreen"
  isFullscreen?: boolean
  currentView?: string
  contextData?: any
}

const mockMessages: AIMessage[] = [
  {
    id: "1",
    type: "assistant",
    content: "Hello! I'm your Racine AI Assistant. I can help you with data governance, compliance monitoring, workflow optimization, and more. What would you like to know?",
    timestamp: "2024-01-20T14:30:00Z",
    suggestions: [
      "Show me data quality issues",
      "Optimize my workflows", 
      "Compliance status overview",
      "Recommend data classifications"
    ]
  }
]

export const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen = true,
  onClose,
  mode = "docked",
  isFullscreen = false,
  currentView = "dashboard",
  contextData
}) => {
  const [messages, setMessages] = useState<AIMessage[]>(mockMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I understand you're asking about "${inputValue}". Based on your current ${currentView} view, I can help you with that. Here are some insights and recommendations...`,
        timestamp: new Date().toISOString(),
        context: currentView,
        suggestions: [
          "Tell me more",
          "Show related metrics",
          "Create a workflow",
          "Generate report"
        ]
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 2000)
  }, [inputValue, currentView])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion)
    handleSendMessage()
  }, [handleSendMessage])

  // Render message
  const renderMessage = useCallback((message: AIMessage) => {
    const isUser = message.type === 'user'
    
    return (
      <div key={message.id} className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>
            {isUser ? "U" : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn("flex-1 max-w-[80%]", isUser && "text-right")}>
          <div className={cn(
            "p-3 rounded-lg text-sm",
            isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
          )}>
            {message.content}
          </div>
          
          {message.context && (
            <Badge variant="outline" className="mt-1 text-xs">
              Context: {message.context}
            </Badge>
          )}
          
          {message.suggestions && !isUser && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    )
  }, [handleSuggestionClick])

  // Render content
  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Racine AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Intelligent data governance help</p>
            </div>
          </div>
          
          <div className="flex gap-1">
            {!isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions */}
          <div className="p-4 border-b border-border">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Data Quality
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Compliance
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <GitBranch className="h-3 w-3 mr-1" />
                Workflows
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Analytics
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(renderMessage)}
              
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Ask me anything about your data governance..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Paperclip className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Mic className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button size="sm" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        {renderContent()}
      </div>
    )
  }

  if (mode === "floating") {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 w-80 h-96 bg-background border border-border rounded-lg shadow-lg z-40"
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Docked mode
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          className={cn(
            "fixed right-0 top-0 h-full bg-background border-l border-border z-40",
            isMinimized ? "w-80" : "w-96"
          )}
        >
          {renderContent()}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AIAssistant