/**
 * Advanced AI Conversations Manager Component
 * Comprehensive AI conversation management interface
 */

import React, { useState, useMemo } from 'react'
import { AIConversation } from '../../types/classification'

interface AIConversationsManagerProps {
  conversations: AIConversation[]
  selectedConversation: AIConversation | null
  onSelectConversation: (conversation: AIConversation | null) => void
  onCreateConversation: (conversation: Partial<AIConversation>) => Promise<void>
  onSendMessage: (conversationId: number, message: any) => Promise<void>
  isLoading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function AIConversationsManager({
  conversations,
  selectedConversation,
  onSelectConversation,
  onCreateConversation,
  onSendMessage,
  isLoading,
  error,
  searchQuery,
  onSearchChange
}: AIConversationsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedConversationForMessage, setSelectedConversationForMessage] = useState<AIConversation | null>(null)
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'status'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filtered and sorted conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter(conversation =>
      conversation.conversation_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.conversation_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.context_type?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'title':
          aValue = (a.conversation_id || '').toLowerCase()
          bValue = (b.conversation_id || '').toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.started_at).getTime()
          bValue = new Date(b.started_at).getTime()
          break
        case 'status':
          aValue = a.conversation_status
          bValue = b.conversation_status
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [conversations, searchQuery, sortBy, sortOrder])

  const handleCreateConversation = async (conversationData: Partial<AIConversation>) => {
    try {
      await onCreateConversation(conversationData)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create AI conversation:', error)
    }
  }

  const handleSendMessage = async (messageData: any) => {
    if (!selectedConversationForMessage) return
    
    try {
      await onSendMessage(selectedConversationForMessage.id, messageData)
      setShowMessageModal(false)
      setSelectedConversationForMessage(null)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'completed': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return '🏷️'
      case 'analysis': return '📊'
      case 'generation': return '✨'
      case 'extraction': return '🔍'
      default: return '💬'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-200">AI Conversations</h2>
          <p className="text-sm text-zinc-400">Manage AI conversations and interactions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-9 px-4 text-sm rounded border border-green-600 bg-green-600/20 text-green-300 hover:bg-green-600/30"
        >
          New Conversation
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder-zinc-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
        >
          <option value="title">Sort by Title</option>
          <option value="created_at">Sort by Date</option>
          <option value="status">Sort by Status</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="h-9 px-3 text-sm rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded border border-red-600 bg-red-600/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Conversations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-400">Loading conversations...</div>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No Conversations Found</h3>
          <p className="text-zinc-400 mb-4">Start a new conversation to begin AI interactions</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 text-sm rounded border border-green-600 bg-green-600/20 text-green-300"
          >
            New Conversation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 rounded border cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id
                  ? 'border-green-600 bg-green-600/20'
                  : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getConversationTypeIcon(conversation.conversation_type || 'general')}</span>
                  <div>
                    <h3 className="font-medium text-zinc-200">
                      {conversation.conversation_id || `Conversation ${conversation.id}`}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {conversation.conversation_type || 'General'} • {conversation.context_type || 'No context'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${getStatusColor(conversation.conversation_status)}`}>
                    {conversation.conversation_status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedConversationForMessage(conversation)
                      setShowMessageModal(true)
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Send Message
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">AI Model:</span>
                  <span className="text-zinc-300">Model ID {conversation.ai_model_id}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Started:</span>
                  <span className="text-zinc-300">
                    {new Date(conversation.started_at).toLocaleDateString()}
                  </span>
                </div>
                {conversation.last_activity && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Last Activity:</span>
                    <span className="text-zinc-300">
                      {new Date(conversation.last_activity).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Conversation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Create AI Conversation
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                  <input
                    id="conversation-title"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter conversation title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">AI Model ID</label>
                  <input
                    id="conversation-model-id"
                    type="number"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter AI model ID"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Conversation Type</label>
                  <select
                    id="conversation-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="classification">Classification</option>
                    <option value="analysis">Analysis</option>
                    <option value="generation">Generation</option>
                    <option value="extraction">Extraction</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Context Type</label>
                  <input
                    id="conversation-context-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="e.g., data_source, table, column"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Context Data</label>
                <textarea
                  id="conversation-context-data"
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  placeholder="Enter context data (JSON format)"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const formData = {
                    title: (document.getElementById('conversation-title') as HTMLInputElement)?.value,
                    ai_model_id: parseInt((document.getElementById('conversation-model-id') as HTMLInputElement)?.value || '0'),
                    conversation_type: (document.getElementById('conversation-type') as HTMLSelectElement)?.value,
                    context_type: (document.getElementById('conversation-context-type') as HTMLInputElement)?.value,
                    context_data: (document.getElementById('conversation-context-data') as HTMLTextAreaElement)?.value,
                    status: 'active'
                  }
                  handleCreateConversation(formData)
                }}
                className="h-8 px-3 text-xs rounded border border-green-600 bg-green-600/20 text-green-300"
              >
                Create Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && selectedConversationForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Send Message to {selectedConversationForMessage.conversation_id || `Conversation ${selectedConversationForMessage.id}`}
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Message Content</label>
                <textarea
                  id="message-content"
                  className="w-full h-32 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  placeholder="Enter your message..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Message Type</label>
                  <select
                    id="message-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="user">User Message</option>
                    <option value="system">System Message</option>
                    <option value="assistant">Assistant Message</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                  <select
                    id="message-priority"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setSelectedConversationForMessage(null)
                }}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const formData = {
                    content: (document.getElementById('message-content') as HTMLTextAreaElement)?.value,
                    message_type: (document.getElementById('message-type') as HTMLSelectElement)?.value,
                    priority: (document.getElementById('message-priority') as HTMLSelectElement)?.value
                  }
                  handleSendMessage(formData)
                }}
                className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
