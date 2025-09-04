'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

interface LoadingSpinnerProps extends IconProps {
  speed?: number;
}

// ============================================================================
// GOOGLE ICON - Advanced Enterprise Design
// ============================================================================

export const GoogleIcon: React.FC<IconProps> = ({ 
  className = "h-5 w-5", 
  size = 20 
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="google-red" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EA4335" />
        <stop offset="100%" stopColor="#D93025" />
      </linearGradient>
      <linearGradient id="google-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBC04" />
        <stop offset="100%" stopColor="#F9AB00" />
      </linearGradient>
      <linearGradient id="google-green" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34A853" />
        <stop offset="100%" stopColor="#137333" />
      </linearGradient>
      <linearGradient id="google-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="100%" stopColor="#1A73E8" />
      </linearGradient>
    </defs>
    
    {/* Google G Logo - Enhanced with gradients */}
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="url(#google-blue)"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="url(#google-green)"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="url(#google-yellow)"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="url(#google-red)"
    />
  </svg>
);

// ============================================================================
// MICROSOFT ICON - Advanced Enterprise Design
// ============================================================================

export const MicrosoftIcon: React.FC<IconProps> = ({ 
  className = "h-5 w-5", 
  size = 20 
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="ms-red" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F25022" />
        <stop offset="100%" stopColor="#D83B01" />
      </linearGradient>
      <linearGradient id="ms-green" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7FBA00" />
        <stop offset="100%" stopColor="#5A9600" />
      </linearGradient>
      <linearGradient id="ms-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00A4EF" />
        <stop offset="100%" stopColor="#0078D4" />
      </linearGradient>
      <linearGradient id="ms-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFB900" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
    </defs>
    
    {/* Microsoft Logo - Four squares */}
    <rect x="1" y="1" width="10" height="10" rx="1" fill="url(#ms-red)" />
    <rect x="13" y="1" width="10" height="10" rx="1" fill="url(#ms-green)" />
    <rect x="1" y="13" width="10" height="10" rx="1" fill="url(#ms-blue)" />
    <rect x="13" y="13" width="10" height="10" rx="1" fill="url(#ms-yellow)" />
    
    {/* Subtle glow effect */}
    <rect 
      x="1" 
      y="1" 
      width="10" 
      height="10" 
      rx="1" 
      fill="none" 
      stroke="rgba(242, 80, 34, 0.3)" 
      strokeWidth="0.5"
    />
    <rect 
      x="13" 
      y="1" 
      width="10" 
      height="10" 
      rx="1" 
      fill="none" 
      stroke="rgba(127, 186, 0, 0.3)" 
      strokeWidth="0.5"
    />
    <rect 
      x="1" 
      y="13" 
      width="10" 
      height="10" 
      rx="1" 
      fill="none" 
      stroke="rgba(0, 164, 239, 0.3)" 
      strokeWidth="0.5"
    />
    <rect 
      x="13" 
      y="13" 
      width="10" 
      height="10" 
      rx="1" 
      fill="none" 
      stroke="rgba(255, 185, 0, 0.3)" 
      strokeWidth="0.5"
    />
  </svg>
);

// ============================================================================
// LOADING SPINNER - Advanced Animated Design
// ============================================================================

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  className = "h-5 w-5", 
  size = 20,
  speed = 1
}) => (
  <motion.svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{ rotate: 360 }}
    transition={{
      duration: 1 / speed,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    <defs>
      <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
      <linearGradient id="spinner-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Background circle */}
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="url(#spinner-bg)"
      strokeWidth="2"
      fill="none"
    />
    
    {/* Animated progress circle */}
    <motion.circle
      cx="12"
      cy="12"
      r="10"
      stroke="url(#spinner-gradient)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="62.83"
      initial={{ strokeDashoffset: 62.83 }}
      animate={{ strokeDashoffset: [62.83, 15.71, 62.83] }}
      transition={{
        duration: 1.5 / speed,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Pulse effect */}
    <motion.circle
      cx="12"
      cy="12"
      r="6"
      fill="url(#spinner-gradient)"
      fillOpacity="0.1"
      initial={{ scale: 0.8, opacity: 0.3 }}
      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.1, 0.3] }}
      transition={{
        duration: 2 / speed,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </motion.svg>
);

// ============================================================================
// DATA GOVERNANCE ICON - Unique Advanced Design (Surpassing Databricks)
// ============================================================================

export const DataGovernanceIcon: React.FC<IconProps> = ({ 
  className = "h-8 w-8", 
  size = 32 
}) => (
  <motion.svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <defs>
      {/* Advanced Gradients */}
      <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667EEA" />
        <stop offset="50%" stopColor="#764BA2" />
        <stop offset="100%" stopColor="#F093FB" />
      </linearGradient>
      
      <linearGradient id="secondary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4FACFE" />
        <stop offset="100%" stopColor="#00F2FE" />
      </linearGradient>
      
      <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#43E97B" />
        <stop offset="100%" stopColor="#38F9D7" />
      </linearGradient>
      
      <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#4ECDC4" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#45B7D1" stopOpacity="0.4" />
      </linearGradient>
      
      {/* Filters for advanced effects */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.1)"/>
      </filter>
    </defs>
    
    {/* Background Circle with Glow */}
    <motion.circle
      cx="24"
      cy="24"
      r="22"
      fill="url(#glow-gradient)"
      filter="url(#glow)"
      initial={{ scale: 0.9, opacity: 0.7 }}
      animate={{ 
        scale: [0.9, 1.1, 0.9],
        opacity: [0.7, 0.3, 0.7]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Main Data Node (Center) */}
    <motion.circle
      cx="24"
      cy="24"
      r="8"
      fill="url(#primary-gradient)"
      filter="url(#shadow)"
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Data Connection Rings */}
    <motion.circle
      cx="24"
      cy="24"
      r="14"
      fill="none"
      stroke="url(#secondary-gradient)"
      strokeWidth="2"
      strokeDasharray="8 4"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    
    <motion.circle
      cx="24"
      cy="24"
      r="18"
      fill="none"
      stroke="url(#accent-gradient)"
      strokeWidth="1.5"
      strokeDasharray="12 6"
      strokeOpacity="0.7"
      initial={{ rotate: 0 }}
      animate={{ rotate: -360 }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    
    {/* Satellite Data Nodes */}
    {[0, 60, 120, 180, 240, 300].map((angle, index) => {
      const x = 24 + 14 * Math.cos((angle * Math.PI) / 180);
      const y = 24 + 14 * Math.sin((angle * Math.PI) / 180);
      
      return (
        <motion.g key={index}>
          {/* Connection Lines */}
          <motion.line
            x1="24"
            y1="24"
            x2={x}
            y2={y}
            stroke="url(#secondary-gradient)"
            strokeWidth="1"
            strokeOpacity="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{
              duration: 3,
              delay: index * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Satellite Nodes */}
          <motion.circle
            cx={x}
            cy={y}
            r="3"
            fill="url(#accent-gradient)"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1, 0.8, 1],
              opacity: [0.5, 1, 0.7, 1]
            }}
            transition={{
              duration: 2,
              delay: index * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.g>
      );
    })}
    
    {/* Central Shield Symbol (Governance) */}
    <motion.path
      d="M24 17 L20 19 L20 25 C20 27.5 21.5 29.5 24 30 C26.5 29.5 28 27.5 28 25 L28 19 L24 17 Z"
      fill="white"
      fillOpacity="0.9"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        delay: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    />
    
    {/* Lock Symbol inside Shield */}
    <motion.rect
      x="22"
      y="22"
      width="4"
      height="3"
      rx="0.5"
      fill="url(#primary-gradient)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    />
    <motion.circle
      cx="24"
      cy="21"
      r="1"
      fill="none"
      stroke="url(#primary-gradient)"
      strokeWidth="1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    />
    
    {/* Data Flow Particles */}
    {[...Array(8)].map((_, i) => (
      <motion.circle
        key={`particle-${i}`}
        r="1"
        fill="url(#accent-gradient)"
        initial={{ 
          x: 24 + Math.random() * 20 - 10,
          y: 24 + Math.random() * 20 - 10,
          opacity: 0
        }}
        animate={{
          x: 24 + (Math.random() * 40 - 20),
          y: 24 + (Math.random() * 40 - 20),
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          delay: Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
    
    {/* Hexagonal Data Pattern */}
    <motion.path
      d="M24 12 L30 16 L30 24 L24 28 L18 24 L18 16 Z"
      fill="none"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.3"
      strokeDasharray="2 2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration: 3,
        delay: 1.5,
        ease: "easeInOut"
      }}
    />
  </motion.svg>
);

// ============================================================================
// UTILITY ICONS
// ============================================================================

export const SecurityShieldIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

export const DataFlowIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <motion.svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    animate={{ rotate: [0, 360] }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </motion.svg>
);

export const ComplianceIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
);

// ============================================================================
// BRAND VARIATIONS
// ============================================================================

export const DataGovernanceIconMini: React.FC<IconProps> = ({ 
  className = "h-4 w-4", 
  size = 16 
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="mini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667EEA" />
        <stop offset="100%" stopColor="#764BA2" />
      </linearGradient>
    </defs>
    
    <circle cx="12" cy="12" r="10" fill="url(#mini-gradient)" />
    <circle cx="12" cy="12" r="4" fill="white" fillOpacity="0.9" />
    <path
      d="M12 8 L10 9 L10 13 C10 14.5 11 15.5 12 16 C13 15.5 14 14.5 14 13 L14 9 L12 8 Z"
      fill="url(#mini-gradient)"
    />
  </svg>
);

export const DataGovernanceIconLarge: React.FC<IconProps> = ({ 
  className = "h-16 w-16", 
  size = 64 
}) => (
  <DataGovernanceIcon className={className} size={size} />
);

// ============================================================================
// EXPORT ALL ICONS
// ============================================================================

export default {
  GoogleIcon,
  MicrosoftIcon,
  LoadingSpinner,
  DataGovernanceIcon,
  DataGovernanceIconMini,
  DataGovernanceIconLarge,
  SecurityShieldIcon,
  DataFlowIcon,
  ComplianceIcon
};