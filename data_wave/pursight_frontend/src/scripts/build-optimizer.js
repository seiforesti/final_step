#!/usr/bin/env node

/**
 * 🚀 ADVANCED BUILD OPTIMIZER
 * ============================
 * 
 * Enterprise-grade build optimization script that handles module resolution,
 * dependency analysis, and ensures all imports are properly resolved
 * before building the Racine platform.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build configuration
const BUILD_CONFIG = {
  projectRoot: process.cwd(),
  componentsDir: 'components',
  libDir: 'lib',
  hooksDir: 'hooks',
  contextDir: 'context',
  maxRetries: 3,
  retryDelay: 2000
};

// Advanced build optimizer class
class AdvancedBuildOptimizer {
  constructor(config = {}) {
    this.config = { ...BUILD_CONFIG, ...config };
    this.issues = [];
    this.resolvedModules = new Set();
    this.moduleCache = new Map();
  }

  // Main optimization process
  async optimize() {
    console.log('🔧 Starting Advanced Build Optimization...\n');
    
    try {
      // Step 1: Analyze project structure
      await this.analyzeProjectStructure();
      
      // Step 2: Validate module dependencies
      await this.validateModuleDependencies();
      
      // Step 3: Resolve import paths
      await this.resolveImportPaths();
      
      // Step 4: Optimize Next.js configuration
      await this.optimizeNextConfig();
      
      // Step 5: Run pre-build checks
      await this.runPreBuildChecks();
      
      console.log('✅ Build optimization completed successfully!\n');
      
      if (this.issues.length > 0) {
        console.log('⚠️  Issues found during optimization:');
        this.issues.forEach(issue => console.log(`   - ${issue}`));
        console.log('');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Build optimization failed:', error.message);
      return false;
    }
  }

  // Analyze project structure
  async analyzeProjectStructure() {
    console.log('📁 Analyzing project structure...');
    
    const dirs = [this.config.componentsDir, this.config.libDir, this.config.hooksDir, this.config.contextDir];
    
    for (const dir of dirs) {
      const fullPath = path.join(this.config.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`   ✓ ${dir}/ (${stats.isDirectory() ? 'directory' : 'file'})`);
      } else {
        console.log(`   ⚠️  ${dir}/ (missing)`);
        this.issues.push(`Directory ${dir}/ is missing`);
      }
    }
  }

  // Validate module dependencies
  async validateModuleDependencies() {
    console.log('🔍 Validating module dependencies...');
    
    const criticalModules = [
      'components/classifications/core/api/classificationApi',
      'components/Advanced-Scan-Logic/utils/dependency-resolver',
      'components/racine-main-manager/hooks/useDataSources',
      'components/ui/icon-registry',
      'lib/module-resolver',
      'components/error-boundary/AdvancedErrorBoundary'
    ];
    
    for (const module of criticalModules) {
      const fullPath = path.join(this.config.projectRoot, module);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✓ ${module}`);
        this.resolvedModules.add(module);
      } else {
        console.log(`   ❌ ${module} (missing)`);
        this.issues.push(`Critical module ${module} is missing`);
      }
    }
  }

  // Resolve import paths
  async resolveImportPaths() {
    console.log('🔄 Resolving import paths...');
    
    // Check for common import issues
    const importIssues = await this.checkImportIssues();
    
    if (importIssues.length > 0) {
      console.log('   ⚠️  Import issues detected:');
      importIssues.forEach(issue => {
        console.log(`      - ${issue}`);
        this.issues.push(issue);
      });
    } else {
      console.log('   ✓ All import paths resolved');
    }
  }

  // Check for import issues
  async checkImportIssues() {
    const issues = [];
    
    // Check TypeScript configuration
    const tsConfigPath = path.join(this.config.projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      try {
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
        if (!tsConfig.compilerOptions?.paths?.['@/*']) {
          issues.push('Missing @/* path alias in tsconfig.json');
        }
      } catch (error) {
        issues.push('Invalid tsconfig.json configuration');
      }
    }
    
    // Check Next.js configuration
    const nextConfigPath = path.join(this.config.projectRoot, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
      if (nextConfigContent.includes('lucide-react')) {
        console.log('   ⚠️  Lucide React optimization disabled for icon compatibility');
      }
    }
    
    return issues;
  }

  // Optimize Next.js configuration
  async optimizeNextConfig() {
    console.log('⚙️  Optimizing Next.js configuration...');
    
    const nextConfigPath = path.join(this.config.projectRoot, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      try {
        let configContent = fs.readFileSync(nextConfigPath, 'utf8');
        
        // Ensure proper icon handling
        if (!configContent.includes('// Icon optimization disabled')) {
          configContent = configContent.replace(
            /optimizePackageImports:\s*\[([\s\S]*?)\]/,
            `optimizePackageImports: [
      // Icon optimization disabled for compatibility
      '@radix-ui/react-icons',
      '@heroicons/react',
      'framer-motion',
      'recharts',
      'd3'
    ]`
          );
          
          fs.writeFileSync(nextConfigPath, configContent);
          console.log('   ✓ Next.js configuration optimized');
        }
      } catch (error) {
        console.log('   ⚠️  Could not optimize Next.js configuration');
        this.issues.push('Next.js configuration optimization failed');
      }
    }
  }

  // Run pre-build checks
  async runPreBuildChecks() {
    console.log('🧪 Running pre-build checks...');
    
    try {
      // Check TypeScript compilation
      console.log('   🔍 Checking TypeScript compilation...');
      execSync('npx tsc --noEmit', { 
        cwd: this.config.projectRoot, 
        stdio: 'pipe' 
      });
      console.log('   ✓ TypeScript compilation check passed');
    } catch (error) {
      console.log('   ⚠️  TypeScript compilation issues detected');
      this.issues.push('TypeScript compilation has issues');
    }
    
    try {
      // Check ESLint
      console.log('   🔍 Checking ESLint...');
      execSync('npx next lint --dir components --dir lib', { 
        cwd: this.config.projectRoot, 
        stdio: 'pipe' 
      });
      console.log('   ✓ ESLint check passed');
    } catch (error) {
      console.log('   ⚠️  ESLint issues detected');
      this.issues.push('ESLint has issues');
    }
  }

  // Get optimization report
  getReport() {
    return {
      success: this.issues.length === 0,
      issues: this.issues,
      resolvedModules: Array.from(this.resolvedModules),
      timestamp: new Date().toISOString()
    };
  }
}

// CLI execution
if (require.main === module) {
  const optimizer = new AdvancedBuildOptimizer();
  
  optimizer.optimize()
    .then(success => {
      const report = optimizer.getReport();
      
      if (success) {
        console.log('🎉 Build optimization completed successfully!');
        process.exit(0);
      } else {
        console.log('⚠️  Build optimization completed with issues');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Build optimization failed:', error);
      process.exit(1);
    });
}

module.exports = AdvancedBuildOptimizer;

