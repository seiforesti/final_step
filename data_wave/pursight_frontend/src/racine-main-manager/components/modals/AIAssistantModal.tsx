"use client"

import type React from "react"
import { Suspense, lazy } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X } from "lucide-react"
import { Button } from "../ui/button"
import { EnterpriseLoadingState } from "../loading/EnterpriseLoadingStates"

const AIAssistantInterface = lazy(() => import("../ai-assistant/AIAssistantInterface"))

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-4xl h-[80vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <Bot className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Enterprise AI Assistant</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <EnterpriseLoadingState type="ai" message="Initializing AI Assistant..." />
                    </div>
                  }
                >
                  <AIAssistantInterface />
                </Suspense>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
