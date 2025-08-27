/**
 * 🔧 ADVANCED MODULE RESOLVER SYSTEM
 * ===================================
 * 
 * Enterprise-grade module resolution system that handles import path
 * resolution, dependency management, and ensures all modules are
 * properly accessible throughout the Racine platform.
 */

import path from 'path';

// Module resolution configuration
interface ModuleResolverConfig {
  basePaths: string[];
  aliases: Record<string, string>;
  fallbacks: Record<string, string>;
  extensions: string[];
}

// Advanced module resolver class
export class AdvancedModuleResolver {
  private config: ModuleResolverConfig;
  private cache: Map<string, any> = new Map();
  private resolutionHistory: string[] = [];

  constructor(config: Partial<ModuleResolverConfig> = {}) {
    this.config = {
      basePaths: [
        process.cwd(),
        path.join(process.cwd(), 'components'),
        path.join(process.cwd(), 'lib'),
        path.join(process.cwd(), 'utils'),
        path.join(process.cwd(), 'hooks'),
        path.join(process.cwd(), 'context')
      ],
      aliases: {
        '@': process.cwd(),
        '@/components': path.join(process.cwd(), 'components'),
        '@/lib': path.join(process.cwd(), 'lib'),
        '@/utils': path.join(process.cwd(), 'utils'),
        '@/hooks': path.join(process.cwd(), 'hooks'),
        '@/context': path.join(process.cwd(), 'context')
      },
      fallbacks: {
        'dependency-resolver': './Advanced-Scan-Logic/utils/dependency-resolver',
        'classificationApi': './classifications/core/api/classificationApi',
        'useDataSourceComplianceStatusQuery': './racine-main-manager/hooks/useDataSources'
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    };

    // Merge custom config
    Object.assign(this.config, config);
  }

  // Resolve module path
  resolveModule(modulePath: string, fromPath?: string): string | null {
    const cacheKey = `${modulePath}:${fromPath || 'root'}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Try direct resolution first
    let resolvedPath = this.tryDirectResolution(modulePath, fromPath);
    
    // Try alias resolution
    if (!resolvedPath) {
      resolvedPath = this.tryAliasResolution(modulePath);
    }
    
    // Try fallback resolution
    if (!resolvedPath) {
      resolvedPath = this.tryFallbackResolution(modulePath);
    }
    
    // Try base path resolution
    if (!resolvedPath) {
      resolvedPath = this.tryBasePathResolution(modulePath);
    }

    // Cache result
    this.cache.set(cacheKey, resolvedPath);
    
    if (resolvedPath) {
      this.resolutionHistory.push(`${modulePath} -> ${resolvedPath}`);
    }

    return resolvedPath;
  }

  // Direct resolution
  private tryDirectResolution(modulePath: string, fromPath?: string): string | null {
    try {
      if (fromPath) {
        const resolved = path.resolve(path.dirname(fromPath), modulePath);
        if (this.moduleExists(resolved)) {
          return resolved;
        }
      }
    } catch (error) {
      // Ignore resolution errors
    }
    return null;
  }

  // Alias resolution
  private tryAliasResolution(modulePath: string): string | null {
    for (const [alias, aliasPath] of Object.entries(this.config.aliases)) {
      if (modulePath.startsWith(alias)) {
        const resolvedPath = modulePath.replace(alias, aliasPath);
        if (this.moduleExists(resolvedPath)) {
          return resolvedPath;
        }
      }
    }
    return null;
  }

  // Fallback resolution
  private tryFallbackResolution(modulePath: string): string | null {
    const fallback = this.config.fallbacks[modulePath];
    if (fallback) {
      const resolvedPath = path.resolve(process.cwd(), fallback);
      if (this.moduleExists(resolvedPath)) {
        return resolvedPath;
      }
    }
    return null;
  }

  // Base path resolution
  private tryBasePathResolution(modulePath: string): string | null {
    for (const basePath of this.config.basePaths) {
      for (const extension of this.config.extensions) {
        const fullPath = path.join(basePath, `${modulePath}${extension}`);
        if (this.moduleExists(fullPath)) {
          return fullPath;
        }
      }
    }
    return null;
  }

  // Check if module exists
  private moduleExists(modulePath: string): boolean {
    try {
      require.resolve(modulePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get resolution history
  getResolutionHistory(): string[] {
    return [...this.resolutionHistory];
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.resolutionHistory = [];
  }

  // Add custom fallback
  addFallback(moduleName: string, fallbackPath: string): void {
    this.config.fallbacks[moduleName] = fallbackPath;
  }

  // Add custom alias
  addAlias(alias: string, aliasPath: string): void {
    this.config.aliases[alias] = aliasPath;
  }
}

// Global module resolver instance
export const globalModuleResolver = new AdvancedModuleResolver();

// Utility function for module resolution
export const resolveModule = (modulePath: string, fromPath?: string): string | null => {
  return globalModuleResolver.resolveModule(modulePath, fromPath);
};

// Export default instance
export default globalModuleResolver;

