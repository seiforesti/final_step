/**
 * 🎯 ADVANCED ICON IMPORTS - RESOLVES BARREL OPTIMIZATION CONFLICTS
 * ================================================================
 * 
 * Direct icon imports to bypass Next.js 15 barrel optimization issues
 * and ensure all icons are available throughout the Racine platform.
 */

// Core action icons
export { 
  Play, Pause, Square, Stop, RotateCcw, RefreshCw, Save, Download, Upload,
  Edit, Trash2, Copy, Eye, EyeOff, Settings, Search, Filter, Plus, Minus
} from 'lucide-react';

// Navigation icons
export {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';

// Status icons
export {
  CheckCircle, XCircle, AlertTriangle, AlertCircle, Info, Warning, Success
} from 'lucide-react';

// Data and analytics icons
export {
  Database, Table, FileText, Folder, BarChart3, LineChart, PieChart,
  TrendingUp, TrendingDown, Activity, Target
} from 'lucide-react';

// Security and workflow icons
export {
  Shield, Lock, Unlock, Key, Fingerprint, GitBranch, Workflow, Layers,
  Network, Zap, Brain, Cpu
} from 'lucide-react';

// Advanced icon component with fallback
export const IconWithFallback: React.FC<{
  name: string;
  fallback?: React.ReactNode;
  size?: number;
  className?: string;
}> = ({ name, fallback, size = 24, className = '' }) => {
  // Dynamic import with fallback
  try {
    const IconComponent = require('lucide-react')[name];
    if (IconComponent) {
      return <IconComponent size={size} className={className} />;
    }
  } catch (error) {
    console.warn(`Icon "${name}" not found, using fallback`);
  }
  
  return fallback || <div className={`w-${size} h-${size} bg-gray-200 rounded`} />;
};

