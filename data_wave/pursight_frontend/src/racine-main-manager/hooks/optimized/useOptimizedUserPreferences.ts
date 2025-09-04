'use client'

import { useCallback } from 'react'

export const useOptimizedUserPreferences = () => {
  const getSidebarPreferences = useCallback(async () => {
    try {
      const stored = localStorage.getItem('sidebar_preferences')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }, [])

  const saveFavoriteItem = useCallback(async (item: any) => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      favorites.push(item)
      localStorage.setItem('favorites', JSON.stringify(favorites))
    } catch (error) {
      console.error('Failed to save favorite:', error)
    }
  }, [])

  const removeFavoriteItem = useCallback(async (id: string) => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const filtered = favorites.filter((fav: any) => fav.id !== id)
      localStorage.setItem('favorites', JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }, [])

  const getQuickActionPreferences = useCallback(async () => {
    try {
      const stored = localStorage.getItem('quick_action_preferences')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }, [])

  const saveFavoriteAction = useCallback(async (actionId: string) => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorite_actions') || '[]')
      if (!favorites.includes(actionId)) {
        favorites.push(actionId)
        localStorage.setItem('favorite_actions', JSON.stringify(favorites))
      }
    } catch (error) {
      console.error('Failed to save favorite action:', error)
    }
  }, [])

  const removeFavoriteAction = useCallback(async (actionId: string) => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorite_actions') || '[]')
      const filtered = favorites.filter((id: string) => id !== actionId)
      localStorage.setItem('favorite_actions', JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to remove favorite action:', error)
    }
  }, [])

  return {
    getSidebarPreferences,
    saveFavoriteItem,
    removeFavoriteItem,
    getQuickActionPreferences,
    saveFavoriteAction,
    removeFavoriteAction
  }
}