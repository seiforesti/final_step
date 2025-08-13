"use client"

import { useToast } from "@/components/ui/use-toast"
import { useCallback } from "react"

interface NotificationOptions {
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number // in ms
}

export function useNotifications() {
  const { toast } = useToast()

  const showNotification = useCallback(
    ({ type, title, message, duration = 5000 }: NotificationOptions) => {
      let variant: "default" | "destructive" = "default"
      let descriptionColor = "text-muted-foreground"

      switch (type) {
        case "success":
          variant = "default"
          descriptionColor = "text-green-600"
          break
        case "error":
          variant = "destructive"
          descriptionColor = "text-red-600"
          break
        case "info":
          variant = "default"
          descriptionColor = "text-blue-600"
          break
        case "warning":
          variant = "default"
          descriptionColor = "text-orange-600"
          break
        default:
          variant = "default"
          break
      }

      toast({
        variant: variant,
        title: title,
        description: message,
        duration: duration,
      })
    },
    [toast],
  )

  return { showNotification }
}
