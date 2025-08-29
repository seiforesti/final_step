'use client'

/**
 * Formatting Utility Functions
 * Provides comprehensive formatting utilities for various data types used throughout the application
 */

/**
 * Format timestamp to human-readable string
 */
export const formatTimestamp = (
  timestamp: number | string | Date,
  options: {
    includeTime?: boolean
    includeSeconds?: boolean
    relative?: boolean
    format?: 'short' | 'medium' | 'long' | 'full'
    timezone?: string
  } = {}
): string => {
  try {
    const {
      includeTime = true,
      includeSeconds = false,
      relative = false,
      format = 'medium',
      timezone
    } = options

    const date = new Date(timestamp)
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    // Return relative time if requested
    if (relative) {
      return formatRelativeTime(date)
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone
    }

    switch (format) {
      case 'short':
        formatOptions.dateStyle = 'short'
        if (includeTime) {
          formatOptions.timeStyle = includeSeconds ? 'medium' : 'short'
        }
        break
      case 'medium':
        formatOptions.dateStyle = 'medium'
        if (includeTime) {
          formatOptions.timeStyle = includeSeconds ? 'medium' : 'short'
        }
        break
      case 'long':
        formatOptions.dateStyle = 'long'
        if (includeTime) {
          formatOptions.timeStyle = includeSeconds ? 'medium' : 'short'
        }
        break
      case 'full':
        formatOptions.dateStyle = 'full'
        if (includeTime) {
          formatOptions.timeStyle = includeSeconds ? 'long' : 'medium'
        }
        break
    }

    return new Intl.DateTimeFormat('en-US', formatOptions).format(date)
  } catch (error) {
    console.error('Error formatting timestamp:', error)
    return 'Invalid date'
  }
}

/**
 * Format date to human-readable string (alias for formatTimestamp)
 */
export const formatDate = (
  date: number | string | Date,
  options: {
    includeTime?: boolean
    includeSeconds?: boolean
    relative?: boolean
    format?: 'short' | 'medium' | 'long' | 'full'
    timezone?: string
  } = {}
): string => {
  return formatTimestamp(date, options)
}

/**
 * Format relative time (e.g., "2 minutes ago", "in 3 hours")
 */
export const formatRelativeTime = (date: Date | number | string): string => {
  try {
    const targetDate = new Date(date)
    const now = new Date()
    const diffMs = targetDate.getTime() - now.getTime()
    const diffAbs = Math.abs(diffMs)
    const ispast = diffMs < 0

    const seconds = Math.floor(diffAbs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    let value: number
    let unit: Intl.RelativeTimeFormatUnit

    if (years > 0) {
      value = years
      unit = 'year'
    } else if (months > 0) {
      value = months
      unit = 'month'
    } else if (weeks > 0) {
      value = weeks
      unit = 'week'
    } else if (days > 0) {
      value = days
      unit = 'day'
    } else if (hours > 0) {
      value = hours
      unit = 'hour'
    } else if (minutes > 0) {
      value = minutes
      unit = 'minute'
    } else {
      value = seconds
      unit = 'second'
    }

    // Adjust value for past/future
    const adjustedValue = ispast ? -value : value

    const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
    return rtf.format(adjustedValue, unit)
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return 'Unknown time'
  }
}

/**
 * Format duration in milliseconds to human-readable string
 */
export const formatDuration = (
  durationMs: number,
  options: {
    precision?: 'seconds' | 'milliseconds'
    compact?: boolean
    maxUnits?: number
  } = {}
): string => {
  try {
    const { precision = 'seconds', compact = false, maxUnits = 3 } = options

    if (durationMs < 0) {
      return '0ms'
    }

    const units = [
      { name: compact ? 'y' : 'year', ms: 365 * 24 * 60 * 60 * 1000 },
      { name: compact ? 'd' : 'day', ms: 24 * 60 * 60 * 1000 },
      { name: compact ? 'h' : 'hour', ms: 60 * 60 * 1000 },
      { name: compact ? 'm' : 'minute', ms: 60 * 1000 },
      { name: compact ? 's' : 'second', ms: 1000 },
      { name: compact ? 'ms' : 'millisecond', ms: 1 }
    ]

    // Filter units based on precision
    const filteredUnits = precision === 'seconds' 
      ? units.filter(unit => unit.ms >= 1000)
      : units

    const parts: string[] = []
    let remaining = durationMs

    for (const unit of filteredUnits) {
      if (parts.length >= maxUnits) break
      
      const count = Math.floor(remaining / unit.ms)
      if (count > 0) {
        const unitName = compact ? unit.name : 
          count === 1 ? unit.name : `${unit.name}s`
        parts.push(compact ? `${count}${unitName}` : `${count} ${unitName}`)
        remaining -= count * unit.ms
      }
    }

    if (parts.length === 0) {
      return precision === 'milliseconds' ? '0ms' : '0s'
    }

    return compact ? parts.join('') : parts.join(', ')
  } catch (error) {
    console.error('Error formatting duration:', error)
    return '0ms'
  }
}

/**
 * Format file size in bytes to human-readable string
 */
export const formatFileSize = (
  bytes: number,
  options: {
    precision?: number
    binary?: boolean
    compact?: boolean
  } = {}
): string => {
  try {
    const { precision = 2, binary = false, compact = false } = options

    if (bytes === 0) return '0 B'
    if (bytes < 0) return 'Invalid size'

    const k = binary ? 1024 : 1000
    const sizes = binary
      ? compact 
        ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
        : ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
      : compact
        ? ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
        : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const size = bytes / Math.pow(k, i)

    // Format number with appropriate precision
    const formattedSize = i === 0 
      ? size.toString() // Don't show decimals for bytes
      : size.toFixed(precision)

    return `${formattedSize} ${sizes[i]}`
  } catch (error) {
    console.error('Error formatting file size:', error)
    return 'Invalid size'
  }
}

// Backwards-compatible aliases expected by callers
export const formatBytes = (
  bytes: number,
  options?: {
    precision?: number
    binary?: boolean
    compact?: boolean
  }
): string => formatFileSize(bytes, options)

export const formatDateTime = (
  timestamp: number | string | Date,
  options?: {
    includeTime?: boolean
    includeSeconds?: boolean
    relative?: boolean
    format?: 'short' | 'medium' | 'long' | 'full'
    timezone?: string
  }
): string => formatTimestamp(timestamp, options)

/**
 * Format latency/response time
 */
export const formatLatency = (
  latencyMs: number,
  options: {
    precision?: number
    showUnit?: boolean
    colorCode?: boolean
  } = {}
): string => {
  try {
    const { precision = 0, showUnit = true, colorCode = false } = options

    if (latencyMs < 0) return 'Invalid'

    let value: number
    let unit: string
    let color: string = ''

    if (latencyMs < 1000) {
      value = latencyMs
      unit = showUnit ? 'ms' : ''
      color = colorCode ? (latencyMs < 100 ? 'text-green-600' : latencyMs < 500 ? 'text-yellow-600' : 'text-red-600') : ''
    } else {
      value = latencyMs / 1000
      unit = showUnit ? 's' : ''
      color = colorCode ? 'text-red-600' : ''
    }

    const formatted = precision > 0 
      ? value.toFixed(precision)
      : Math.round(value).toString()

    const result = `${formatted}${unit}`
    return colorCode ? `<span class="${color}">${result}</span>` : result
  } catch (error) {
    console.error('Error formatting latency:', error)
    return 'Invalid'
  }
}

/**
 * Format throughput (operations per second, requests per minute, etc.)
 */
export const formatThroughput = (
  value: number,
  options: {
    unit?: 'ops' | 'req' | 'queries' | 'records'
    timeUnit?: 'second' | 'minute' | 'hour'
    precision?: number
    compact?: boolean
  } = {}
): string => {
  try {
    const { 
      unit = 'ops', 
      timeUnit = 'second', 
      precision = 2,
      compact = false 
    } = options

    if (value < 0) return 'Invalid'

    const timeUnitAbbr = compact 
      ? { second: '/s', minute: '/m', hour: '/h' }[timeUnit]
      : { second: ' per second', minute: ' per minute', hour: ' per hour' }[timeUnit]

    const unitName = compact ? unit : unit
    
    let formattedValue: string
    if (value >= 1000000) {
      formattedValue = (value / 1000000).toFixed(precision) + (compact ? 'M' : ' million')
    } else if (value >= 1000) {
      formattedValue = (value / 1000).toFixed(precision) + (compact ? 'K' : ' thousand')
    } else {
      formattedValue = value.toFixed(precision)
    }

    return compact 
      ? `${formattedValue} ${unitName}${timeUnitAbbr}`
      : `${formattedValue} ${unitName}${timeUnitAbbr}`
  } catch (error) {
    console.error('Error formatting throughput:', error)
    return 'Invalid'
  }
}

/**
 * Format percentage value
 */
export const formatPercent = (
  value: number,
  options: {
    precision?: number
    showSign?: boolean
    colorCode?: boolean
  } = {}
): string => {
  try {
    const { precision = 1, showSign = false, colorCode = false } = options

    if (isNaN(value)) return 'N/A'

    const formatted = value.toFixed(precision)
    const sign = showSign && value > 0 ? '+' : ''
    const percent = `${sign}${formatted}%`

    if (colorCode) {
      if (value > 0) return `<span class="text-green-600">${percent}</span>`
      if (value < 0) return `<span class="text-red-600">${percent}</span>`
      return `<span class="text-gray-600">${percent}</span>`
    }

    return percent
  } catch (error) {
    console.error('Error formatting percentage:', error)
    return 'N/A'
  }
}

/**
 * Format number with locale-specific formatting
 */
export const formatNumber = (
  value: number,
  options: {
    precision?: number
    compact?: boolean
    currency?: string
    locale?: string
  } = {}
): string => {
  try {
    const { 
      precision = 0, 
      compact = false, 
      currency, 
      locale = 'en-US' 
    } = options

    if (isNaN(value)) return 'N/A'

    const formatOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }

    if (compact) {
      formatOptions.notation = 'compact'
      formatOptions.compactDisplay = 'short'
    }

    if (currency) {
      formatOptions.style = 'currency'
      formatOptions.currency = currency
    }

    return new Intl.NumberFormat(locale, formatOptions).format(value)
  } catch (error) {
    console.error('Error formatting number:', error)
    return value.toString()
  }
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (
  text: string,
  options: {
    maxLength?: number
    ellipsis?: string
    wordBoundary?: boolean
  } = {}
): string => {
  try {
    const { maxLength = 50, ellipsis = '...', wordBoundary = true } = options

    if (!text || text.length <= maxLength) {
      return text
    }

    if (wordBoundary) {
      const truncated = text.substring(0, maxLength)
      const lastSpace = truncated.lastIndexOf(' ')
      
      if (lastSpace > 0 && lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + ellipsis
      }
    }

    return text.substring(0, maxLength) + ellipsis
  } catch (error) {
    console.error('Error truncating text:', error)
    return text
  }
}

/**
 * Format boolean value to human-readable string
 */
export const formatBoolean = (
  value: boolean | null | undefined,
  options: {
    style?: 'yes-no' | 'true-false' | 'enabled-disabled' | 'on-off'
    capitalize?: boolean
  } = {}
): string => {
  const { style = 'yes-no', capitalize = true } = options

  if (value === null || value === undefined) {
    return 'N/A'
  }

  let result: string
  switch (style) {
    case 'yes-no':
      result = value ? 'yes' : 'no'
      break
    case 'true-false':
      result = value ? 'true' : 'false'
      break
    case 'enabled-disabled':
      result = value ? 'enabled' : 'disabled'
      break
    case 'on-off':
      result = value ? 'on' : 'off'
      break
    default:
      result = value ? 'yes' : 'no'
  }

  return capitalize ? result.charAt(0).toUpperCase() + result.slice(1) : result
}

/**
 * Format status with color coding
 */
export const formatStatus = (
  status: string,
  options: {
    colorMap?: Record<string, string>
    defaultColor?: string
    uppercase?: boolean
  } = {}
): string => {
  try {
    const {
      colorMap = {
        active: 'text-green-600',
        healthy: 'text-green-600',
        success: 'text-green-600',
        online: 'text-green-600',
        warning: 'text-yellow-600',
        pending: 'text-yellow-600',
        degraded: 'text-yellow-600',
        error: 'text-red-600',
        failed: 'text-red-600',
        critical: 'text-red-600',
        offline: 'text-red-600',
        inactive: 'text-gray-600',
        disabled: 'text-gray-600',
        unknown: 'text-gray-600'
      },
      defaultColor = 'text-gray-600',
      uppercase = false
    } = options

    const normalizedStatus = status.toLowerCase()
    const color = colorMap[normalizedStatus] || defaultColor
    const displayStatus = uppercase ? status.toUpperCase() : status

    return `<span class="${color}">${displayStatus}</span>`
  } catch (error) {
    console.error('Error formatting status:', error)
    return status
  }
}

/**
 * Format array to comma-separated string
 */
export const formatArray = (
  array: any[],
  options: {
    separator?: string
    maxItems?: number
    moreText?: string
  } = {}
): string => {
  try {
    const { separator = ', ', maxItems = 5, moreText = 'and {count} more' } = options

    if (!Array.isArray(array) || array.length === 0) {
      return ''
    }

    if (array.length <= maxItems) {
      return array.join(separator)
    }

    const visible = array.slice(0, maxItems)
    const remaining = array.length - maxItems
    const moreFormatted = moreText.replace('{count}', remaining.toString())

    return `${visible.join(separator)}${separator}${moreFormatted}`
  } catch (error) {
    console.error('Error formatting array:', error)
    return ''
  }
}

/**
 * Format object to key-value pairs
 */
export const formatObject = (
  obj: Record<string, any>,
  options: {
    separator?: string
    keyValueSeparator?: string
    maxPairs?: number
    excludeKeys?: string[]
  } = {}
): string => {
  try {
    const {
      separator = ', ',
      keyValueSeparator = ': ',
      maxPairs = 5,
      excludeKeys = []
    } = options

    if (!obj || typeof obj !== 'object') {
      return ''
    }

    const entries = Object.entries(obj)
      .filter(([key]) => !excludeKeys.includes(key))
      .slice(0, maxPairs)

    return entries
      .map(([key, value]) => `${key}${keyValueSeparator}${value}`)
      .join(separator)
  } catch (error) {
    console.error('Error formatting object:', error)
    return ''
  }
}

/**
 * Format action time for display
 */
export const formatActionTime = (
  timestamp: number | string | Date,
  options: {
    format?: 'relative' | 'absolute' | 'both'
    includeSeconds?: boolean
    timezone?: string
  } = {}
): string => {
  try {
    const { format = 'relative', includeSeconds = false, timezone } = options
    const date = new Date(timestamp)
    
    if (isNaN(date.getTime())) {
      return 'Invalid time'
    }

    switch (format) {
      case 'relative':
        return formatRelativeTime(date)
      case 'absolute':
        return formatTimestamp(date, { 
          includeTime: true, 
          includeSeconds, 
          format: 'medium',
          timezone 
        })
      case 'both':
        const absolute = formatTimestamp(date, { 
          includeTime: true, 
          includeSeconds, 
          format: 'short',
          timezone 
        })
        const relative = formatRelativeTime(date)
        return `${absolute} (${relative})`
      default:
        return formatRelativeTime(date)
    }
  } catch (error) {
    console.error('Error formatting action time:', error)
    return 'Invalid time'
  }
}

// Additional formatting utilities
export const formatPercentage = (value: number, decimals: number = 1): string => {
  try {
    if (isNaN(value) || !isFinite(value)) {
      return '0%'
    }
    return `${(value * 100).toFixed(decimals)}%`
  } catch (error) {
    console.error('Error formatting percentage:', error)
    return '0%'
  }
}

export const formatTimeAgo = (timestamp: number | string | Date): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffAbs = Math.abs(diffMs)
    
    const seconds = Math.floor(diffAbs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
    
    if (years > 0) {
      return `${years}y ago`
    } else if (months > 0) {
      return `${months}mo ago`
    } else if (weeks > 0) {
      return `${weeks}w ago`
    } else if (days > 0) {
      return `${days}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return `${seconds}s ago`
    }
  } catch (error) {
    console.error('Error formatting time ago:', error)
    return 'Unknown time'
  }
}

export const formatSearchTime = (timestamp: number | string | Date): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffAbs = Math.abs(diffMs)
    
    const seconds = Math.floor(diffAbs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(diffAbs / 3600)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return `${seconds}s ago`
    }
  } catch (error) {
    console.error('Error formatting search time:', error)
    return 'Just now'
  }
}

export const getSearchResultIcon = (resultType: string): string => {
  switch (resultType.toLowerCase()) {
    case 'file':
    case 'document':
      return '📄'
    case 'database':
    case 'table':
      return '🗄️'
    case 'user':
    case 'profile':
      return '👤'
    case 'folder':
    case 'directory':
      return '📁'
    case 'link':
    case 'url':
      return '🔗'
    case 'image':
    case 'photo':
      return '🖼️'
    case 'video':
    case 'media':
      return '🎥'
    default:
      return '📋'
  }
}

/**
 * Export all formatting functions
 */
export default {
  formatTimestamp,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatFileSize,
  formatBytes,
  formatLatency,
  formatThroughput,
  formatPercent,
  formatNumber,
  truncateText,
  formatBoolean,
  formatStatus,
  formatArray,
  formatObject,
  formatActionTime,
  formatPercentage,
  formatTimeAgo,
  formatSearchTime,
  getSearchResultIcon
}