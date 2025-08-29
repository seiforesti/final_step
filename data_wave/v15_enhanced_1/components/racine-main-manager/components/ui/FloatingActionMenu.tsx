"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Brain, 
  Workflow, 
  GitBranch, 
  Database, 
  Shield, 
  BarChart3,
  Zap,
  Network,
  Cpu,
  Activity,
  Target,
  Layers,
  Command,
  Sparkles
} from "lucide-react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Badge } from "./badge"

interface FloatingActionMenuProps {
  onQuickAction: (action: string, context?: any) => void
  onAIAssistant: () => void
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ onQuickAction, onAIAssistant }) => {
  return (
    <motion.div 
      className="fixed bottom-8 right-8 z-50" 
      whileHover={{ scale: 1.02 }} 
      whileTap={{ scale: 0.98 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            className="relative"
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 30px rgba(59, 130, 246, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Button
              size="lg"
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 hover:from-slate-700 hover:via-blue-800 hover:to-indigo-800 border border-slate-600/30 shadow-2xl backdrop-blur-sm transition-all duration-300 group"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <Brain className="w-8 h-8 text-blue-300 group-hover:text-blue-200 transition-colors duration-200" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl"
        >
          <DropdownMenuLabel className="flex items-center gap-3 p-4 border-b border-slate-700/50">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Enterprise Actions</h3>
              <p className="text-xs text-slate-400">Advanced workflow orchestration</p>
            </div>
          </DropdownMenuLabel>
          
          <div className="p-2 space-y-1">
            <DropdownMenuItem 
              onClick={onAIAssistant}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 group-hover:border-blue-400/50">
                <Brain className="w-5 h-5 text-blue-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-100">AI Assistant</span>
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">
                    Enterprise
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">Intelligent workflow orchestration</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => onQuickAction("create_workflow")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 group-hover:border-green-400/50">
                <Workflow className="w-5 h-5 text-green-300" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-100">Create Workflow</span>
                <p className="text-xs text-slate-400">Design automation pipelines</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => onQuickAction("data_governance")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-400/30 group-hover:border-purple-400/50">
                <Shield className="w-5 h-5 text-purple-300" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-100">Data Governance</span>
                <p className="text-xs text-slate-400">Compliance & security rules</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => onQuickAction("analytics_dashboard")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 group-hover:border-orange-400/50">
                <BarChart3 className="w-5 h-5 text-orange-300" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-100">Analytics Hub</span>
                <p className="text-xs text-slate-400">Performance insights</p>
              </div>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="border-slate-700/50" />
          
          <div className="p-2 space-y-1">
            <DropdownMenuItem 
              onClick={() => onQuickAction("system_monitor")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-400/30 group-hover:border-cyan-400/50">
                <Activity className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-100">System Monitor</span>
                <p className="text-xs text-slate-400">Real-time health metrics</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => onQuickAction("advanced_settings")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer group transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500/20 to-gray-500/20 border border-slate-400/30 group-hover:border-slate-400/50">
                <Command className="w-5 h-5 text-slate-300" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-100">Advanced Config</span>
                <p className="text-xs text-slate-400">Enterprise settings</p>
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
