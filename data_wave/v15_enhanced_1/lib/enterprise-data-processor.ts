/**
 * Enterprise Data Validation and Transformation System
 * ================================================
 *
 * Advanced data processing with:
 * - Schema validation
 * - Data transformation pipelines
 * - Custom validation rules
 * - Data sanitization
 * - Type conversion
 * - Format standardization
 * - Performance optimization
 * - Error handling
 */

import { errorSystem } from "./enterprise-error-system";
import { stateManager } from "./advanced-state-management";
import { EventEmitter } from "events";

export type ValidationRule = {
  id: string;
  name: string;
  description: string;
  validate: (
    value: any,
    context?: ValidationContext
  ) => Promise<ValidationResult>;
  severity: "error" | "warning" | "info";
  category: string;
  metadata?: Record<string, any>;
};

export type ValidationContext = {
  path: string[];
  rootValue: any;
  parentValue?: any;
  schema?: SchemaDefinition;
  metadata?: Record<string, any>;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: Record<string, any>;
};

export type ValidationError = {
  code: string;
  message: string;
  path: string[];
  value: any;
  rule: string;
  severity: "error";
  metadata?: Record<string, any>;
};

export type ValidationWarning = {
  code: string;
  message: string;
  path: string[];
  value: any;
  rule: string;
  severity: "warning";
  metadata?: Record<string, any>;
};

export type TransformationRule = {
  id: string;
  name: string;
  description: string;
  transform: (value: any, context?: TransformationContext) => Promise<any>;
  priority: number;
  category: string;
  metadata?: Record<string, any>;
};

export type TransformationContext = {
  path: string[];
  rootValue: any;
  parentValue?: any;
  schema?: SchemaDefinition;
  metadata?: Record<string, any>;
};

export type SchemaDefinition = {
  type: string | string[];
  required?: boolean;
  properties?: Record<string, SchemaDefinition>;
  items?: SchemaDefinition;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
  const?: any;
  validate?: ValidationRule[];
  transform?: TransformationRule[];
  metadata?: Record<string, any>;
};

export class EnterpriseDataProcessor {
  private readonly validationRules = new Map<string, ValidationRule>();
  private readonly transformationRules = new Map<string, TransformationRule>();
  private readonly eventEmitter = new EventEmitter();
  private readonly schemaCache = new Map<string, SchemaDefinition>();
  private readonly validationCache = new Map<string, ValidationResult>();
  private readonly transformationCache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.registerDefaultRules();
    this.setupCacheCleanup();
  }

  /**
   * Register a new validation rule
   */
  public registerValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.id, rule);
    this.eventEmitter.emit("ruleRegistered", { type: "validation", rule });
  }

  /**
   * Register a new transformation rule
   */
  public registerTransformationRule(rule: TransformationRule): void {
    this.transformationRules.set(rule.id, rule);
    this.eventEmitter.emit("ruleRegistered", { type: "transformation", rule });
  }

  /**
   * Register a schema definition
   */
  public registerSchema(name: string, schema: SchemaDefinition): void {
    this.schemaCache.set(name, this.compileSchema(schema));
    this.eventEmitter.emit("schemaRegistered", { name, schema });
  }

  /**
   * Validate data against schema or rules
   */
  public async validate(
    data: any,
    schemaOrRules: SchemaDefinition | string[] | string,
    context: Partial<ValidationContext> = {}
  ): Promise<ValidationResult> {
    try {
      const cacheKey = this.generateCacheKey("validation", data, schemaOrRules);
      const cached = this.validationCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      let schema: SchemaDefinition | undefined;
      let rules: ValidationRule[] = [];

      if (typeof schemaOrRules === "string") {
        schema = this.schemaCache.get(schemaOrRules);
        if (!schema) {
          throw new Error(`Schema not found: ${schemaOrRules}`);
        }
      } else if (Array.isArray(schemaOrRules)) {
        rules = schemaOrRules.map((id) => {
          const rule = this.validationRules.get(id);
          if (!rule) {
            throw new Error(`Validation rule not found: ${id}`);
          }
          return rule;
        });
      } else {
        schema = schemaOrRules;
      }

      const fullContext: ValidationContext = {
        path: [],
        rootValue: data,
        ...context,
      };

      const result = await this.validateWithSchemaAndRules(
        data,
        schema,
        rules,
        fullContext
      );
      this.validationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      await errorSystem.handleError(error as Error, "error", {
        service: "DataProcessor",
        operation: "validate",
        component: "Validation",
      });
      throw error;
    }
  }

  /**
   * Transform data using rules or schema
   */
  public async transform(
    data: any,
    rulesOrSchema: TransformationRule[] | string[] | SchemaDefinition | string,
    context: Partial<TransformationContext> = {}
  ): Promise<any> {
    try {
      const cacheKey = this.generateCacheKey(
        "transformation",
        data,
        rulesOrSchema
      );
      const cached = this.transformationCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      let transformRules: TransformationRule[] = [];

      if (typeof rulesOrSchema === "string") {
        const schema = this.schemaCache.get(rulesOrSchema);
        if (!schema) {
          throw new Error(`Schema not found: ${rulesOrSchema}`);
        }
        transformRules = this.extractTransformRules(schema);
      } else if (Array.isArray(rulesOrSchema)) {
        transformRules = rulesOrSchema.map((id) => {
          if (typeof id === "string") {
            const rule = this.transformationRules.get(id);
            if (!rule) {
              throw new Error(`Transformation rule not found: ${id}`);
            }
            return rule;
          }
          return id;
        });
      } else {
        transformRules = this.extractTransformRules(rulesOrSchema);
      }

      const fullContext: TransformationContext = {
        path: [],
        rootValue: data,
        ...context,
      };

      let transformed = data;
      for (const rule of this.sortRulesByPriority(transformRules)) {
        transformed = await rule.transform(transformed, fullContext);
      }

      this.transformationCache.set(cacheKey, transformed);
      return transformed;
    } catch (error) {
      await errorSystem.handleError(error as Error, "error", {
        service: "DataProcessor",
        operation: "transform",
        component: "Transformation",
      });
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.validationCache.clear();
    this.transformationCache.clear();
    this.eventEmitter.emit("cachesCleared");
  }

  private async validateWithSchemaAndRules(
    data: any,
    schema?: SchemaDefinition,
    rules: ValidationRule[] = [],
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate schema if provided
    if (schema) {
      const schemaResult = await this.validateSchema(data, schema, context);
      errors.push(...schemaResult.errors);
      warnings.push(...schemaResult.warnings);
    }

    // Apply additional validation rules
    for (const rule of rules) {
      const ruleResult = await rule.validate(data, context);
      if (rule.severity === "error") {
        errors.push(...ruleResult.errors);
      } else {
        warnings.push(...ruleResult.warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        timestamp: new Date().toISOString(),
        schemaValidated: !!schema,
        rulesApplied: rules.length,
      },
    };
  }

  private async validateSchema(
    data: any,
    schema: SchemaDefinition,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Type validation
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => this.checkType(data, type))) {
      errors.push({
        code: "invalid_type",
        message: `Expected type ${types.join(" | ")}, got ${typeof data}`,
        path: context.path,
        value: data,
        rule: "type_validation",
        severity: "error",
      });
      return { valid: false, errors, warnings };
    }

    // Required fields validation
    if (schema.required && (data === undefined || data === null)) {
      errors.push({
        code: "required_field",
        message: "Field is required",
        path: context.path,
        value: data,
        rule: "required_validation",
        severity: "error",
      });
    }

    // Object properties validation
    if (schema.properties && typeof data === "object") {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const propContext = {
          ...context,
          path: [...context.path, key],
          parentValue: data,
        };
        const propResult = await this.validateSchema(
          data[key],
          propSchema,
          propContext
        );
        errors.push(...propResult.errors);
        warnings.push(...propResult.warnings);
      }
    }

    // Array items validation
    if (schema.items && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const itemContext = {
          ...context,
          path: [...context.path, i.toString()],
          parentValue: data,
        };
        const itemResult = await this.validateSchema(
          data[i],
          schema.items,
          itemContext
        );
        errors.push(...itemResult.errors);
        warnings.push(...itemResult.warnings);
      }
    }

    // Format validation
    if (schema.format && !this.validateFormat(data, schema.format)) {
      errors.push({
        code: "invalid_format",
        message: `Invalid format: ${schema.format}`,
        path: context.path,
        value: data,
        rule: "format_validation",
        severity: "error",
      });
    }

    // Range validation
    if (typeof data === "number") {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push({
          code: "minimum_value",
          message: `Value must be >= ${schema.minimum}`,
          path: context.path,
          value: data,
          rule: "range_validation",
          severity: "error",
        });
      }
      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push({
          code: "maximum_value",
          message: `Value must be <= ${schema.maximum}`,
          path: context.path,
          value: data,
          rule: "range_validation",
          severity: "error",
        });
      }
    }

    // Length validation
    if (typeof data === "string") {
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push({
          code: "minimum_length",
          message: `String length must be >= ${schema.minLength}`,
          path: context.path,
          value: data,
          rule: "length_validation",
          severity: "error",
        });
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push({
          code: "maximum_length",
          message: `String length must be <= ${schema.maxLength}`,
          path: context.path,
          value: data,
          rule: "length_validation",
          severity: "error",
        });
      }
    }

    // Pattern validation
    if (schema.pattern && typeof data === "string") {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        errors.push({
          code: "pattern_mismatch",
          message: `Value does not match pattern: ${schema.pattern}`,
          path: context.path,
          value: data,
          rule: "pattern_validation",
          severity: "error",
        });
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push({
        code: "invalid_enum",
        message: `Value must be one of: ${schema.enum.join(", ")}`,
        path: context.path,
        value: data,
        rule: "enum_validation",
        severity: "error",
      });
    }

    // Const validation
    if (schema.const !== undefined && data !== schema.const) {
      errors.push({
        code: "invalid_const",
        message: `Value must be: ${schema.const}`,
        path: context.path,
        value: data,
        rule: "const_validation",
        severity: "error",
      });
    }

    // Custom validation rules
    if (schema.validate) {
      for (const rule of schema.validate) {
        const ruleResult = await rule.validate(data, context);
        if (rule.severity === "error") {
          errors.push(...ruleResult.errors);
        } else {
          warnings.push(...ruleResult.warnings);
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private checkType(value: any, type: string): boolean {
    switch (type) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && !isNaN(value);
      case "integer":
        return Number.isInteger(value);
      case "boolean":
        return typeof value === "boolean";
      case "array":
        return Array.isArray(value);
      case "object":
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      case "null":
        return value === null;
      default:
        return false;
    }
  }

  private validateFormat(value: any, format: string): boolean {
    // Add more format validations as needed
    const formats: Record<string, RegExp> = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      date: /^\d{4}-\d{2}-\d{2}$/,
      "date-time":
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
      uri: /^https?:\/\/.+/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      ipv6: /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i,
    };

    return formats[format]?.test(value) ?? false;
  }

  private compileSchema(schema: SchemaDefinition): SchemaDefinition {
    // Resolve references and optimize schema
    return schema;
  }

  private extractTransformRules(
    schema: SchemaDefinition
  ): TransformationRule[] {
    const rules: TransformationRule[] = [];
    if (schema.transform) {
      rules.push(...schema.transform);
    }
    return rules;
  }

  private sortRulesByPriority(
    rules: TransformationRule[]
  ): TransformationRule[] {
    return [...rules].sort((a, b) => a.priority - b.priority);
  }

  private generateCacheKey(type: string, data: any, rules: any): string {
    return `${type}:${JSON.stringify(data)}:${JSON.stringify(rules)}`;
  }

  private setupCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.validationCache.entries()) {
        if (
          now - new Date(entry.metadata?.timestamp).getTime() >
          this.CACHE_TTL
        ) {
          this.validationCache.delete(key);
        }
      }
      for (const [key, entry] of this.transformationCache.entries()) {
        if (now - new Date(entry?.timestamp).getTime() > this.CACHE_TTL) {
          this.transformationCache.delete(key);
        }
      }
    }, this.CACHE_TTL);
  }

  private registerDefaultRules(): void {
    // Register common validation rules
    this.registerValidationRule({
      id: "string-not-empty",
      name: "String Not Empty",
      description: "Validates that a string is not empty",
      validate: async (value) => ({
        valid: typeof value === "string" && value.trim().length > 0,
        errors: [],
        warnings: [],
      }),
      severity: "error",
      category: "string",
    });

    // Register common transformation rules
    this.registerTransformationRule({
      id: "string-trim",
      name: "String Trim",
      description: "Trims whitespace from strings",
      transform: async (value) =>
        typeof value === "string" ? value.trim() : value,
      priority: 1,
      category: "string",
    });
  }
}

// Create singleton instance
export const dataProcessor = new EnterpriseDataProcessor();
