/**
 * Enhanced Data Governance Schema Visualization Component
 * ======================================================
 *
 * Advanced interactive visualization of the Racine data governance architecture
 * featuring 3D effects, particle systems, real-time metrics, and modern animations.
 * Represents the complete system ecosystem with intelligent node positioning and
 * dynamic connection routing.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
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
  Zap,
  Cpu,
  Cloud,
  Lock,
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
  Users,
  FileText,
  BarChart3,
  Globe,
  Server,
  Workflow,
  Brain,
  Eye,
  Filter,
  Layers,
  GitBranch,
  Code,
  Palette,
  Sparkles,
  Star,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '../../utils/ui-utils';
import { DataGovernanceNode, SystemOverview } from '../../types/advanced-analytics.types';

interface EnhancedDataGovernanceSchemaProps {
  nodes: DataGovernanceNode[];
  systemOverview: SystemOverview;
  onNodeClick?: (nodeId: string) => void;
  onRefresh?: () => void;
  className?: string;
  showParticles?: boolean;
  show3DEffects?: boolean;
  autoRotate?: boolean;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ConnectionPath {
  id: string;
  source: string;
  target: string;
  strength: number;
  type: 'data' | 'control' | 'monitoring' | 'ai';
  animated: boolean;
}

export const DataGovernanceSchema: React.FC<EnhancedDataGovernanceSchemaProps> = ({
  nodes,
  systemOverview,
  onNodeClick,
  onRefresh,
  className,
  showParticles = true,
  show3DEffects = true,
  autoRotate = true,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'technical'>('overview');
  const [connectionPaths, setConnectionPaths] = useState<ConnectionPath[]>([]);
  const [localShowParticles, setLocalShowParticles] = useState(showParticles ?? true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const schemaAnimation = useAnimation();
  const pulseAnimation = useAnimation();
  const particleAnimation = useAnimation();
  const rotationAnimation = useAnimation();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  // Enhanced icon mapping with more system components
  const iconMap = {
    'data-sources': Database,
    'scan-rule-sets': Shield,
    'classifications': Target,
    'compliance': CheckCircle,
    'catalog': Building2,
    'scan-logic': Radar,
    'ai-engine': Bot,
    'orchestration': Network,
    'processing': Cpu,
    'storage': Server,
    'analytics': BarChart3,
    'security': Lock,
    'monitoring': Activity,
    'workflow': Workflow,
    'intelligence': Brain,
    'visualization': Eye,
    'filtering': Filter,
    'layers': Layers,
    'versioning': GitBranch,
    'development': Code,
    'theming': Palette,
    'enhancement': Sparkles,
    'performance': Zap,
    'cloud': Cloud,
    'users': Users,
    'documents': FileText,
    'global': Globe,
    'trending': TrendingUp,
    'alerts': AlertTriangle,
    'settings': Settings,
  };

  // Enhanced node shapes for different types
  const shapeMap = {
    'core': 'circle',
    'integration': 'square',
    'ai': 'hexagon',
    'monitoring': 'triangle',
    'processing': 'octagon',
    'storage': 'circle',
    'analytics': 'square',
    'security': 'triangle',
    'workflow': 'hexagon',
    'intelligence': 'star',
  };

  // Generate enhanced connection paths
  useEffect(() => {
    const paths: ConnectionPath[] = [];
    nodes.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const targetNode = nodes.find((n) => n.id === connectionId);
        if (targetNode) {
          paths.push({
            id: `${node.id}-${connectionId}`,
            source: node.id,
            target: connectionId,
            strength: Math.random() * 0.8 + 0.2,
            type: ['data', 'control', 'monitoring', 'ai'][Math.floor(Math.random() * 4)] as any,
            animated: Math.random() > 0.5,
          });
        }
      });
    });
    setConnectionPaths(paths);
  }, [nodes]);

  // Particle system
  useEffect(() => {
    if (!localShowParticles) return;

    const generateParticle = (): Particle => ({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1,
      maxLife: Math.random() * 100 + 50,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      size: Math.random() * 3 + 1,
    });

    const initialParticles = Array.from({ length: 50 }, generateParticle);
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles((current) => {
        const updated = current
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
          }))
          .filter((particle) => particle.life > 0);

        // Add new particles
        if (updated.length < 50) {
          updated.push(generateParticle());
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [localShowParticles]);

  // Mouse tracking for 3D effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    mouseX.set(x);
    mouseY.set(y);
    
    const percentX = ((e.clientX - rect.left) / rect.width) * 100;
    const percentY = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x: percentX, y: percentY });
  }, [mouseX, mouseY]);

  // Animation controls
  useEffect(() => {
    if (animationEnabled) {
      schemaAnimation.start({
        rotate: 360,
        transition: { duration: 120, repeat: Infinity, ease: "linear" },
      });
      
      if (autoRotate) {
        rotationAnimation.start({
          rotateY: [0, 360],
          transition: { duration: 60, repeat: Infinity, ease: "linear" },
        });
      }
    } else {
      schemaAnimation.stop();
      rotationAnimation.stop();
    }
  }, [animationEnabled, autoRotate, schemaAnimation, rotationAnimation]);

  useEffect(() => {
    pulseAnimation.start({
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    });
  }, [pulseAnimation]);

  const systemHealthStatus = useMemo(() => {
    const avgHealth = nodes.reduce((sum, node) => sum + node.metrics.health, 0) / nodes.length;
    if (avgHealth >= 90) return { status: 'optimal', color: 'text-emerald-500', bg: 'bg-emerald-500/20' };
    if (avgHealth >= 70) return { status: 'healthy', color: 'text-green-500', bg: 'bg-green-500/20' };
    if (avgHealth >= 50) return { status: 'degraded', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    return { status: 'critical', color: 'text-red-500', bg: 'bg-red-500/20' };
  }, [nodes]);

  const renderNodeShape = (node: DataGovernanceNode, isHovered: boolean) => {
    const shape = shapeMap[node.type as keyof typeof shapeMap] || 'circle';
    const size = isHovered ? 40 : 30;
    
    switch (shape) {
      case 'square':
        return (
          <motion.rect
            x={node.position.x - size / 2}
            y={node.position.y - size / 2}
            width={size}
            height={size}
            rx={4}
            fill={`url(#gradient-${node.id})`}
            stroke={node.color}
            strokeWidth={isHovered ? 3 : 2}
            animate={{
              width: size,
              height: size,
              strokeWidth: isHovered ? 3 : 2,
            }}
            transition={{ duration: 0.3 }}
          />
        );
      case 'triangle':
        return (
          <motion.polygon
            points={`${node.position.x},${node.position.y - size / 2} ${node.position.x - size / 2},${node.position.y + size / 2} ${node.position.x + size / 2},${node.position.y + size / 2}`}
            fill={`url(#gradient-${node.id})`}
            stroke={node.color}
            strokeWidth={isHovered ? 3 : 2}
            animate={{
              strokeWidth: isHovered ? 3 : 2,
            }}
            transition={{ duration: 0.3 }}
          />
        );
      case 'hexagon':
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = node.position.x + size * Math.cos(angle);
          const y = node.position.y + size * Math.sin(angle);
          hexPoints.push(`${x},${y}`);
        }
        return (
          <motion.polygon
            points={hexPoints.join(' ')}
            fill={`url(#gradient-${node.id})`}
            stroke={node.color}
            strokeWidth={isHovered ? 3 : 2}
            animate={{
              strokeWidth: isHovered ? 3 : 2,
            }}
            transition={{ duration: 0.3 }}
          />
        );
      case 'star':
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? size : size * 0.5;
          const x = node.position.x + radius * Math.cos(angle);
          const y = node.position.y + radius * Math.sin(angle);
          starPoints.push(`${x},${y}`);
        }
        return (
          <motion.polygon
            points={starPoints.join(' ')}
            fill={`url(#gradient-${node.id})`}
            stroke={node.color}
            strokeWidth={isHovered ? 3 : 2}
            animate={{
              strokeWidth: isHovered ? 3 : 2,
            }}
            transition={{ duration: 0.3 }}
          />
        );
      default:
        return (
          <motion.circle
            cx={node.position.x}
            cy={node.position.y}
            r={size / 2}
            fill={`url(#gradient-${node.id})`}
            stroke={node.color}
            strokeWidth={isHovered ? 3 : 2}
            animate={{
              r: size / 2,
              strokeWidth: isHovered ? 3 : 2,
            }}
            transition={{ duration: 0.3 }}
          />
        );
    }
  };

  return (
    <TooltipProvider>
      <div 
        ref={containerRef}
        className={cn(
          'relative w-full h-[600px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl',
          className
        )}
        onMouseMove={handleMouseMove}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 3D Background Effects */}
        {show3DEffects && (
          <motion.div
            className="absolute inset-0"
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            animate={rotationAnimation}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
          </motion.div>
        )}

        {/* Interactive Background */}
        <motion.div
          className="absolute inset-0"
          animate={schemaAnimation}
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)`,
          }}
        />

        {/* Particle System */}
        {localShowParticles && (
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  backgroundColor: particle.color,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.life / particle.maxLife,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, particle.life / particle.maxLife, 0],
                }}
                transition={{
                  duration: particle.maxLife / 100,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {/* SVG Visualization */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Enhanced Connection Lines */}
          {connectionPaths.map((path) => {
            const sourceNode = nodes.find(n => n.id === path.source);
            const targetNode = nodes.find(n => n.id === path.target);
            
            if (!sourceNode || !targetNode) return null;

            const isHovered = hoveredNode === path.source || hoveredNode === path.target;
            const isSelected = selectedNode === path.source || selectedNode === path.target;

            return (
              <motion.g key={path.id}>
                {/* Connection Path */}
                <motion.line
                  x1={sourceNode.position.x}
                  y1={sourceNode.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  stroke={
                    isHovered || isSelected
                      ? sourceNode.color
                      : path.type === 'data'
                      ? '#3B82F6'
                      : path.type === 'control'
                      ? '#10B981'
                      : path.type === 'monitoring'
                      ? '#F59E0B'
                      : '#8B5CF6'
                  }
                  strokeWidth={isHovered || isSelected ? 4 : 2}
                  strokeOpacity={isHovered || isSelected ? 0.9 : 0.4}
                  strokeDasharray={path.animated ? "8,4" : "none"}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: isHovered || isSelected ? 0.9 : 0.4,
                    strokeDashoffset: path.animated ? [0, -12] : 0,
                  }}
                  transition={{
                    pathLength: { duration: 2, delay: Math.random() * 2 },
                    strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" },
                  }}
                />

                {/* Data Flow Particles */}
                {path.animated && (isHovered || isSelected) && (
                  <motion.circle
                    r="3"
                    fill={sourceNode.color}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: [sourceNode.position.x, targetNode.position.x],
                      y: [sourceNode.position.y, targetNode.position.y],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.g>
            );
          })}

          {/* Enhanced Nodes */}
          {nodes.map((node, index) => {
            const NodeIcon = iconMap[node.id as keyof typeof iconMap] || Database;
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0, y: 50 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  filter: isHovered ? "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))" : "none",
                }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.8, 
                  type: "spring",
                  stiffness: 100,
                }}
                onHoverStart={() => setHoveredNode(node.id)}
                onHoverEnd={() => setHoveredNode(null)}
                onClick={() => {
                  setSelectedNode(node.id);
                  onNodeClick?.(node.id);
                }}
                style={{ cursor: "pointer" }}
              >
                {/* Node Shadow */}
                <motion.circle
                  cx={node.position.x + 2}
                  cy={node.position.y + 2}
                  r={isHovered ? 45 : 35}
                  fill="rgba(0,0,0,0.1)"
                  animate={{
                    r: isHovered ? 45 : 35,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Node Shape */}
                {renderNodeShape(node, isHovered)}

                {/* Health Ring */}
                <motion.circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={isHovered ? 50 : 40}
                  fill="none"
                  stroke={
                    node.metrics.health > 90
                      ? "#10B981"
                      : node.metrics.health > 70
                      ? "#F59E0B"
                      : "#EF4444"
                  }
                  strokeWidth={3}
                  strokeOpacity={0.6}
                  strokeDasharray={`${(node.metrics.health / 100) * 251} 251`}
                  strokeDashoffset={-63}
                  transform={`rotate(-90 ${node.position.x} ${node.position.y})`}
                  animate={{
                    strokeDasharray: `${(node.metrics.health / 100) * 251} 251`,
                    rotate: [0, 360],
                  }}
                  transition={{
                    strokeDasharray: { duration: 1 },
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  }}
                />

                {/* Activity Pulse */}
                {node.metrics.activity > 0 && (
                  <motion.circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r={30}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2}
                    strokeOpacity={0.3}
                    animate={{
                      r: [30, 60, 30],
                      strokeOpacity: [0.3, 0, 0.3],
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
                  x={node.position.x - 15}
                  y={node.position.y - 15}
                  width={30}
                  height={30}
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.2 : 1,
                        rotate: isHovered ? [0, 360] : 0,
                      }}
                      transition={{
                        scale: { duration: 0.3 },
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      }}
                    >
                      <NodeIcon className="w-6 h-6 text-white drop-shadow-lg" />
                    </motion.div>
                  </div>
                </foreignObject>

                {/* Node Label */}
                <motion.text
                  x={node.position.x}
                  y={node.position.y + (isHovered ? 60 : 50)}
                  textAnchor="middle"
                  className="text-sm font-semibold fill-current text-slate-700 dark:text-slate-300"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                    fontSize: isHovered ? "14px" : "12px",
                  }}
                  animate={{
                    fontSize: isHovered ? "14px" : "12px",
                    y: node.position.y + (isHovered ? 60 : 50),
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {node.name}
                </motion.text>

                {/* Enhanced Metrics Tooltip */}
                {isHovered && (
                  <foreignObject
                    x={node.position.x + 60}
                    y={node.position.y - 40}
                    width={200}
                    height={120}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -20 }}
                      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <NodeIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {node.name}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Health</span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs font-medium">{node.metrics.health}%</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Performance</span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-xs font-medium">{node.metrics.performance}%</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Activity</span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              <span className="text-xs font-medium">{node.metrics.activity}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              node.status === 'healthy' ? 'border-green-500 text-green-600' :
                              node.status === 'degraded' ? 'border-yellow-500 text-yellow-600' :
                              'border-red-500 text-red-600'
                            )}
                          >
                            {node.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  </foreignObject>
                )}
              </motion.g>
            );
          })}

          {/* Enhanced Gradient Definitions */}
          <defs>
            {nodes.map((node) => (
              <radialGradient key={`gradient-${node.id}`} id={`gradient-${node.id}`}>
                <stop offset="0%" stopColor={node.color} stopOpacity={0.9} />
                <stop offset="70%" stopColor={node.color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={node.color} stopOpacity={0.3} />
              </radialGradient>
            ))}
            
            {/* Glow Effects */}
            {nodes.map((node) => (
              <filter key={`glow-${node.id}`} id={`glow-${node.id}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            ))}
          </defs>
        </svg>

        {/* Enhanced Controls Panel */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnimationEnabled(!animationEnabled)}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
              >
                {animationEnabled ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {animationEnabled ? "Pause Animations" : "Resume Animations"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh System Health</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                                 onClick={() => setLocalShowParticles(!localShowParticles)}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
                         <TooltipContent>
               {localShowParticles ? "Hide Particles" : "Show Particles"}
             </TooltipContent>
          </Tooltip>
        </div>

        {/* Enhanced System Status */}
        <motion.div
          className="absolute top-4 left-4 flex items-center gap-3"
          animate={pulseAnimation}
        >
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm border",
            systemHealthStatus.bg,
            "border-slate-200/50 dark:border-slate-700/50"
          )}>
            <Heart className={cn("w-5 h-5", systemHealthStatus.color)} fill="currentColor" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              System: {systemHealthStatus.status}
            </span>
          </div>
        </motion.div>

        {/* Enhanced System Stats */}
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{systemOverview.totalAssets} Assets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{systemOverview.activeWorkflows} Workflows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{systemOverview.activePipelines} Pipelines</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">{systemOverview.systemHealth}% Health</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium">{systemOverview.aiInsights} AI Insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">{systemOverview.complianceScore}% Compliance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Selector */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg p-1 border border-slate-200/50 dark:border-slate-700/50">
            {(['overview', 'detailed', 'technical'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="text-xs capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};