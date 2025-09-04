"use client";

/**
 * 🛡️ CLIENT ERROR BOUNDARY WRAPPER
 * ==================================
 * 
 * Client-side wrapper for error boundaries to ensure proper rendering
 * in Next.js 15 App Router server components.
 */

import React from 'react';
import { FunctionalErrorBoundary, ErrorBoundaryProps } from './AdvancedErrorBoundary';

// Client-side error boundary wrapper
export const ClientErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return <FunctionalErrorBoundary {...props} />;
};

// Default export
export default ClientErrorBoundary;

