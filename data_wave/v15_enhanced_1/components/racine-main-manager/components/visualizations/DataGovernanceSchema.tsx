/**
 * Data Governance Schema Visualization Component
 * =============================================
 *
 * This component provides an interactive visualization of the data governance architecture
 * showing relationships between different system components, their health status,
 * and real-time metrics. Features animated connections and interactive nodes.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
  Bot,
  Building2,
  CheckCircle,
  Database,
  Heart,
  Network,
  Pause,
  Play,
  Radar,
  RefreshCw,
  Shield,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '../../utils/ui-utils';
import { DataGovernanceNode, SystemOverview } from '../../types/advanced-analytics.types';

interface DataGovernanceSchemaProps {
  nodes: DataGovernanceNode[];
  systemOverview: SystemOverview;
  onNodeClick?: (nodeId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

export const DataGovernanceSchema: React.FC<DataGovernanceSchemaProps> = ({
  nodes,
  systemOverview,
  onNodeClick,
  onRefresh,
  className,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [schemaAnimationEnabled, setSchemaAnimationEnabled] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  const schemaAnimation = useAnimation();
  const pulseAnimation = useAnimation();

  // Icon mapping for different node types
  const iconMap = {
    'data-sources': Database,
    'scan-rule-sets': Shield,
    'classifications': Target,
    'compliance': CheckCircle,
    'catalog': Building2,
    'scan-logic': Radar,
    'ai-engine': Bot,
    'orchestration': Network,
  };

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }, []);

  // Start schema animation
  React.useEffect(() => {
    if (schemaAnimationEnabled) {
      schemaAnimation.start({
        rotate: 360,
        transition: { duration: 60, repeat: Infinity, ease: "linear" },
      });
    } else {
      schemaAnimation.stop();
    }
  }, [schemaAnimation, schemaAnimationEnabled]);

  // Start heartbeat animation
  React.useEffect(() => {
    pulseAnimation.start({
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    });
  }, [pulseAnimation]);

  const systemHealthStatus = useMemo(() => {
    const avgHealth = nodes.reduce((sum, node) => sum + node.metrics.health, 0) / nodes.length;
    if (avgHealth >= 90) return { status: 'healthy', color: 'text-green-500' };
    if (avgHealth >= 70) return { status: 'degraded', color: 'text-yellow-500' };
    return { status: 'critical', color: 'text-red-500' };
  }, [nodes]);

  return (
    <TooltipProvider>
      <div className={cn('relative w-full h-96 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl overflow-hidden', className)}>
        {/* Interactive Background */}
        <motion.div
          className="absolute inset-0"
          animate={schemaAnimation}
          onMouseMove={handleMouseMove}
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
          }}
        />

        {/* SVG Visualization */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 700 400"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection Lines */}
          {nodes.map((node) =>
            node.connections.map((connectionId) => {
              const targetNode = nodes.find(
                (n) => n.id === connectionId || connectionId === "all"
              );
              
              if (!targetNode || connectionId === "all") {
                return nodes
                  .filter((n) => n.id !== node.id)
                  .map((target) => (
                    <motion.line
                      key={`${node.id}-${target.id}`}
                      x1={node.position.x}
                      y1={node.position.y}
                      x2={target.position.x}
                      y2={target.position.y}
                      stroke={
                        hoveredNode === node.id || hoveredNode === target.id
                          ? node.color
                          : "#94A3B8"
                      }
                      strokeWidth={
                        hoveredNode === node.id || hoveredNode === target.id ? 3 : 1
                      }
                      strokeOpacity={
                        hoveredNode === node.id || hoveredNode === target.id ? 0.8 : 0.3
                      }
                      strokeDasharray={node.type === "ai" ? "5,5" : "none"}
                      initial={{ pathLength: 0 }}
                      animate={{
                        pathLength: 1,
                        stroke:
                          hoveredNode === node.id || hoveredNode === target.id
                            ? node.color
                            : "#94A3B8",
                      }}
                      transition={{ duration: 2, delay: Math.random() * 2 }}
                    />
                  ));
              }
              
              return (
                <motion.line
                  key={`${node.id}-${connectionId}`}
                  x1={node.position.x}
                  y1={node.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  stroke={
                    hoveredNode === node.id || hoveredNode === connectionId
                      ? node.color
                      : "#94A3B8"
                  }
                  strokeWidth={
                    hoveredNode === node.id || hoveredNode === connectionId ? 3 : 1
                  }
                  strokeOpacity={
                    hoveredNode === node.id || hoveredNode === connectionId ? 0.8 : 0.3
                  }
                  strokeDasharray={node.type === "ai" ? "5,5" : "none"}
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: 1,
                    stroke:
                      hoveredNode === node.id || hoveredNode === connectionId
                        ? node.color
                        : "#94A3B8",
                  }}
                  transition={{ duration: 2, delay: Math.random() * 2 }}
                />
              );
            })
          )}

          {/* Nodes */}
          {nodes.map((node, index) => {
            const NodeIcon = iconMap[node.id as keyof typeof iconMap] || Database;
            
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.8, type: "spring" }}
                onHoverStart={() => handleNodeHover(node.id)}
                onHoverEnd={() => handleNodeHover(null)}
                onClick={() => onNodeClick?.(node.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Node Background */}
                <motion.circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={hoveredNode === node.id ? 35 : 25}
                  fill={`url(#gradient-${node.id})`}
                  stroke={node.color}
                  strokeWidth={hoveredNode === node.id ? 3 : 2}
                  animate={{
                    r: hoveredNode === node.id ? 35 : 25,
                    strokeWidth: hoveredNode === node.id ? 3 : 2,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Health Ring */}
                <motion.circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={hoveredNode === node.id ? 40 : 30}
                  fill="none"
                  stroke={
                    node.metrics.health > 90
                      ? "#10B981"
                      : node.metrics.health > 70
                      ? "#F59E0B"
                      : "#EF4444"
                  }
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  strokeDasharray={`${(node.metrics.health / 100) * 188} 188`}
                  strokeDashoffset={-47}
                  transform={`rotate(-90 ${node.position.x} ${node.position.y})`}
                  animate={{
                    strokeDasharray: `${(node.metrics.health / 100) * 188} 188`,
                  }}
                  transition={{ duration: 1 }}
                />

                {/* Activity Pulse */}
                {node.metrics.activity > 0 && (
                  <motion.circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r={25}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                    animate={{
                      r: [25, 45, 25],
                      strokeOpacity: [0.4, 0, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                )}

                {/* Node Icon */}
                <foreignObject
                  x={node.position.x - 12}
                  y={node.position.y - 12}
                  width={24}
                  height={24}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <NodeIcon className="w-5 h-5 text-white drop-shadow-sm" />
                  </div>
                </foreignObject>

                {/* Node Label */}
                <text
                  x={node.position.x}
                  y={node.position.y + 45}
                  textAnchor="middle"
                  className="text-xs font-medium fill-current text-gray-700 dark:text-gray-300"
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                    fontSize: hoveredNode === node.id ? "13px" : "11px",
                  }}
                >
                  {node.name}
                </text>

                {/* Metrics Tooltip on Hover */}
                {hoveredNode === node.id && (
                  <foreignObject
                    x={node.position.x + 50}
                    y={node.position.y - 30}
                    width={120}
                    height={60}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                    >
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Health:</span>
                          <span className="font-medium">{node.metrics.health}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Performance:</span>
                          <span className="font-medium">{node.metrics.performance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Activity:</span>
                          <span className="font-medium">{node.metrics.activity}</span>
                        </div>
                      </div>
                    </motion.div>
                  </foreignObject>
                )}
              </motion.g>
            );
          })}

          {/* Gradient Definitions */}
          <defs>
            {nodes.map((node) => (
              <radialGradient key={`gradient-${node.id}`} id={`gradient-${node.id}`}>
                <stop offset="0%" stopColor={node.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={node.color} stopOpacity={0.4} />
              </radialGradient>
            ))}
          </defs>
        </svg>

        {/* Schema Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSchemaAnimationEnabled(!schemaAnimationEnabled)}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
              >
                {schemaAnimationEnabled ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {schemaAnimationEnabled ? "Pause Animation" : "Resume Animation"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh System Health</TooltipContent>
          </Tooltip>
        </div>

        {/* System Heartbeat Indicator */}
        <motion.div
          className="absolute top-4 left-4 flex items-center gap-2"
          animate={pulseAnimation}
        >
          <Heart className={cn("w-5 h-5", systemHealthStatus.color)} fill="currentColor" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            System Pulse: {systemHealthStatus.status}
          </span>
        </motion.div>

        {/* System Stats */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50">
                {systemOverview.totalAssets} Assets
              </Badge>
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50">
                {systemOverview.activeWorkflows} Workflows
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50">
                Health: {systemOverview.systemHealth}%
              </Badge>
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50">
                AI Insights: {systemOverview.aiInsights}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};