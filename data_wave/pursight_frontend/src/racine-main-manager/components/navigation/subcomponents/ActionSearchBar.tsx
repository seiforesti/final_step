'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Command, Filter, History, Star } from 'lucide-react'
import { cn } from '@/lib copie/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SearchSuggestion {
  id: string
  text: string
  type: 'action' | 'category' | 'recent' | 'popular'
  icon?: React.ComponentType<any>
  description?: string
}

interface ActionSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  suggestions?: SearchSuggestion[]
  showSuggestions?: boolean
}

export const ActionSearchBar: React.FC<ActionSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search actions...",
  className,
  onSuggestionSelect,
  suggestions = [],
  showSuggestions = true
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
        break
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSuggestionSelect?.(suggestions[selectedIndex])
          setShowDropdown(false)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [suggestions, selectedIndex, onSuggestionSelect, showSuggestions])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    onSuggestionSelect?.(suggestion)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }, [onSuggestionSelect])

  // Clear search
  const handleClear = useCallback(() => {
    onChange('')
    setShowDropdown(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [onChange])

  // Show dropdown when focused and has suggestions
  useEffect(() => {
    if (isFocused && suggestions.length > 0 && showSuggestions) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [isFocused, suggestions.length, showSuggestions])

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding dropdown to allow click events
            setTimeout(() => setIsFocused(false), 200)
          }}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleClear}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon
              const isSelected = index === selectedIndex

              return (
                <div
                  key={suggestion.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
                    "hover:bg-muted/50",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex-shrink-0">
                    {suggestion.type === 'recent' && <History className="w-4 h-4 text-muted-foreground" />}
                    {suggestion.type === 'popular' && <Star className="w-4 h-4 text-muted-foreground" />}
                    {suggestion.type === 'category' && <Filter className="w-4 h-4 text-muted-foreground" />}
                    {suggestion.type === 'action' && Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{suggestion.text}</p>
                    {suggestion.description && (
                      <p className="text-xs text-muted-foreground truncate">{suggestion.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type}
                  </Badge>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ActionSearchBar
