// ============================================================================
// SCHEMA PARSER UTILITIES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced schema parsing and analysis utilities for catalog operations
// ============================================================================

import { 
  SchemaDefinition,
  ColumnDefinition,
  DataType,
  SchemaRelationship,
  SchemaStatistics,
  SchemaValidationResult
} from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ParsedSchema {
  name: string;
  type: 'TABLE' | 'VIEW' | 'STORED_PROCEDURE' | 'FUNCTION' | 'INDEX';
  columns: ParsedColumn[];
  indexes: ParsedIndex[];
  constraints: ParsedConstraint[];
  relationships: SchemaRelationship[];
  metadata: SchemaMetadata;
  statistics: SchemaStatistics;
}

export interface ParsedColumn {
  name: string;
  dataType: DataType;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  defaultValue?: any;
  maxLength?: number;
  precision?: number;
  scale?: number;
  description?: string;
  tags: string[];
  qualityScore: number;
}

export interface ParsedIndex {
  name: string;
  type: 'CLUSTERED' | 'NONCLUSTERED' | 'UNIQUE' | 'BITMAP' | 'HASH';
  columns: string[];
  isUnique: boolean;
  isPrimaryKey: boolean;
  size?: number;
  usage?: IndexUsageStats;
}

export interface ParsedConstraint {
  name: string;
  type: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL' | 'DEFAULT';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  definition?: string;
}

export interface SchemaMetadata {
  createdDate?: Date;
  modifiedDate?: Date;
  owner?: string;
  schema?: string;
  database?: string;
  catalog?: string;
  rowCount?: number;
  sizeBytes?: number;
  partitionInfo?: PartitionInfo;
}

export interface PartitionInfo {
  isPartitioned: boolean;
  partitionColumns: string[];
  partitionType: 'RANGE' | 'LIST' | 'HASH' | 'COMPOSITE';
  partitionCount: number;
}

export interface IndexUsageStats {
  userSeeks: number;
  userScans: number;
  userLookups: number;
  userUpdates: number;
  lastUserSeek?: Date;
  lastUserScan?: Date;
  lastUserLookup?: Date;
  lastUserUpdate?: Date;
}

export interface SchemaParsingOptions {
  includeSystemColumns?: boolean;
  includeIndexes?: boolean;
  includeConstraints?: boolean;
  includeStatistics?: boolean;
  validateSchema?: boolean;
  enrichMetadata?: boolean;
  generateTags?: boolean;
}

// ============================================================================
// SCHEMA PARSER CLASS
// ============================================================================

export class SchemaParser {
  private options: Required<SchemaParsingOptions>;

  constructor(options: SchemaParsingOptions = {}) {
    this.options = {
      includeSystemColumns: options.includeSystemColumns ?? false,
      includeIndexes: options.includeIndexes ?? true,
      includeConstraints: options.includeConstraints ?? true,
      includeStatistics: options.includeStatistics ?? true,
      validateSchema: options.validateSchema ?? true,
      enrichMetadata: options.enrichMetadata ?? true,
      generateTags: options.generateTags ?? true,
    };
  }

  // ============================================================================
  // MAIN PARSING METHODS
  // ============================================================================

  /**
   * Parse schema from DDL (Data Definition Language)
   */
  parseDDL(ddl: string): ParsedSchema {
    const normalizedDDL = this.normalizeDDL(ddl);
    const schemaInfo = this.extractSchemaInfo(normalizedDDL);
    const columns = this.parseColumns(normalizedDDL);
    const indexes = this.options.includeIndexes ? this.parseIndexes(normalizedDDL) : [];
    const constraints = this.options.includeConstraints ? this.parseConstraints(normalizedDDL) : [];

    const schema: ParsedSchema = {
      name: schemaInfo.name,
      type: schemaInfo.type,
      columns,
      indexes,
      constraints,
      relationships: [],
      metadata: schemaInfo.metadata,
      statistics: this.generateStatistics(columns, indexes)
    };

    if (this.options.validateSchema) {
      this.validateParsedSchema(schema);
    }

    if (this.options.enrichMetadata) {
      this.enrichSchemaMetadata(schema);
    }

    return schema;
  }

  /**
   * Parse schema from JSON definition
   */
  parseJSON(schemaJson: any): ParsedSchema {
    try {
      const schema = this.parseSchemaFromObject(schemaJson);
      
      if (this.options.validateSchema) {
        this.validateParsedSchema(schema);
      }

      return schema;
    } catch (error) {
      throw new Error(`Failed to parse JSON schema: ${error}`);
    }
  }

  /**
   * Parse schema from database metadata
   */
  parseMetadata(metadata: any): ParsedSchema {
    const columns = this.parseColumnsFromMetadata(metadata.columns || []);
    const indexes = this.parseIndexesFromMetadata(metadata.indexes || []);
    const constraints = this.parseConstraintsFromMetadata(metadata.constraints || []);

    return {
      name: metadata.tableName || metadata.name,
      type: metadata.objectType || 'TABLE',
      columns,
      indexes,
      constraints,
      relationships: metadata.relationships || [],
      metadata: {
        createdDate: metadata.createdDate ? new Date(metadata.createdDate) : undefined,
        modifiedDate: metadata.modifiedDate ? new Date(metadata.modifiedDate) : undefined,
        owner: metadata.owner,
        schema: metadata.schemaName,
        database: metadata.databaseName,
        catalog: metadata.catalogName,
        rowCount: metadata.rowCount,
        sizeBytes: metadata.sizeBytes
      },
      statistics: this.generateStatistics(columns, indexes)
    };
  }

  // ============================================================================
  // DDL PARSING METHODS
  // ============================================================================

  private normalizeDDL(ddl: string): string {
    return ddl
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .replace(/\t+/g, ' ')
      .trim();
  }

  private extractSchemaInfo(ddl: string): { name: string; type: ParsedSchema['type']; metadata: SchemaMetadata } {
    const createTableMatch = ddl.match(/CREATE\s+(TABLE|VIEW|PROCEDURE|FUNCTION|INDEX)\s+(?:\[?(\w+)\]?\.\[?(\w+)\]?|\[?(\w+)\]?)/i);
    
    if (!createTableMatch) {
      throw new Error('Unable to extract schema information from DDL');
    }

    const type = createTableMatch[1].toUpperCase() as ParsedSchema['type'];
    const name = createTableMatch[4] || createTableMatch[3];
    const schema = createTableMatch[2];

    return {
      name,
      type,
      metadata: {
        schema,
        createdDate: new Date(),
        modifiedDate: new Date()
      }
    };
  }

  private parseColumns(ddl: string): ParsedColumn[] {
    const columns: ParsedColumn[] = [];
    const columnRegex = /(\w+)\s+([\w\(\),\s]+)(?:\s+(NOT\s+NULL|NULL))?(?:\s+(PRIMARY\s+KEY))?(?:\s+(UNIQUE))?(?:\s+(DEFAULT\s+[^,\)]+))?/gi;
    
    let match;
    while ((match = columnRegex.exec(ddl)) !== null) {
      const column = this.parseColumn(match);
      if (column) {
        columns.push(column);
      }
    }

    return columns;
  }

  private parseColumn(match: RegExpExecArray): ParsedColumn | null {
    const [, name, dataTypeStr, nullability, primaryKey, unique, defaultValue] = match;

    if (!name || !dataTypeStr) return null;

    const dataType = this.parseDataType(dataTypeStr.trim());
    
    const column: ParsedColumn = {
      name: name.trim(),
      dataType,
      isNullable: nullability?.toUpperCase() !== 'NOT NULL',
      isPrimaryKey: !!primaryKey,
      isForeignKey: false, // Will be determined by constraints
      isUnique: !!unique,
      defaultValue: defaultValue ? this.parseDefaultValue(defaultValue) : undefined,
      tags: this.options.generateTags ? this.generateColumnTags(name, dataType) : [],
      qualityScore: this.calculateColumnQualityScore(name, dataType)
    };

    return column;
  }

  private parseDataType(dataTypeStr: string): DataType {
    const normalizedType = dataTypeStr.toLowerCase().trim();
    
    // Extract base type and parameters
    const typeMatch = normalizedType.match(/^(\w+)(?:\(([^)]+)\))?/);
    if (!typeMatch) {
      return { name: 'UNKNOWN', category: 'OTHER' };
    }

    const [, baseType, params] = typeMatch;
    
    const dataType: DataType = {
      name: baseType.toUpperCase(),
      category: this.categorizeDataType(baseType)
    };

    if (params) {
      const paramValues = params.split(',').map(p => p.trim());
      if (paramValues.length === 1) {
        dataType.maxLength = parseInt(paramValues[0]);
      } else if (paramValues.length === 2) {
        dataType.precision = parseInt(paramValues[0]);
        dataType.scale = parseInt(paramValues[1]);
      }
    }

    return dataType;
  }

  private categorizeDataType(type: string): DataType['category'] {
    const typeCategories: Record<string, DataType['category']> = {
      // String types
      'char': 'STRING',
      'varchar': 'STRING',
      'nchar': 'STRING',
      'nvarchar': 'STRING',
      'text': 'STRING',
      'ntext': 'STRING',
      
      // Numeric types
      'int': 'NUMERIC',
      'bigint': 'NUMERIC',
      'smallint': 'NUMERIC',
      'tinyint': 'NUMERIC',
      'decimal': 'NUMERIC',
      'numeric': 'NUMERIC',
      'float': 'NUMERIC',
      'real': 'NUMERIC',
      
      // Date/Time types
      'date': 'TEMPORAL',
      'datetime': 'TEMPORAL',
      'datetime2': 'TEMPORAL',
      'time': 'TEMPORAL',
      'timestamp': 'TEMPORAL',
      
      // Boolean
      'bit': 'BOOLEAN',
      'boolean': 'BOOLEAN',
      
      // Binary
      'binary': 'BINARY',
      'varbinary': 'BINARY',
      'image': 'BINARY',
      
      // JSON
      'json': 'JSON',
      'jsonb': 'JSON',
      
      // Spatial
      'geometry': 'SPATIAL',
      'geography': 'SPATIAL',
      
      // UUID
      'uuid': 'UUID',
      'uniqueidentifier': 'UUID'
    };

    return typeCategories[type.toLowerCase()] || 'OTHER';
  }

  private parseIndexes(ddl: string): ParsedIndex[] {
    const indexes: ParsedIndex[] = [];
    const indexRegex = /CREATE\s+(UNIQUE\s+)?(CLUSTERED\s+|NONCLUSTERED\s+)?INDEX\s+(\w+)\s+ON\s+\w+\s*\(([^)]+)\)/gi;
    
    let match;
    while ((match = indexRegex.exec(ddl)) !== null) {
      const index = this.parseIndex(match);
      if (index) {
        indexes.push(index);
      }
    }

    return indexes;
  }

  private parseIndex(match: RegExpExecArray): ParsedIndex | null {
    const [, unique, clustered, name, columnsStr] = match;

    if (!name || !columnsStr) return null;

    const columns = columnsStr.split(',').map(col => col.trim());
    
    let type: ParsedIndex['type'] = 'NONCLUSTERED';
    if (clustered?.toLowerCase().includes('clustered')) {
      type = 'CLUSTERED';
    } else if (unique) {
      type = 'UNIQUE';
    }

    return {
      name: name.trim(),
      type,
      columns,
      isUnique: !!unique,
      isPrimaryKey: false // Will be determined by constraints
    };
  }

  private parseConstraints(ddl: string): ParsedConstraint[] {
    const constraints: ParsedConstraint[] = [];
    
    // Primary Key constraints
    const pkRegex = /CONSTRAINT\s+(\w+)\s+PRIMARY\s+KEY\s*\(([^)]+)\)/gi;
    let match;
    while ((match = pkRegex.exec(ddl)) !== null) {
      constraints.push({
        name: match[1],
        type: 'PRIMARY_KEY',
        columns: match[2].split(',').map(col => col.trim())
      });
    }

    // Foreign Key constraints
    const fkRegex = /CONSTRAINT\s+(\w+)\s+FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(\w+)\s*\(([^)]+)\)/gi;
    while ((match = fkRegex.exec(ddl)) !== null) {
      constraints.push({
        name: match[1],
        type: 'FOREIGN_KEY',
        columns: match[2].split(',').map(col => col.trim()),
        referencedTable: match[3],
        referencedColumns: match[4].split(',').map(col => col.trim())
      });
    }

    return constraints;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private parseSchemaFromObject(obj: any): ParsedSchema {
    return {
      name: obj.name || 'unnamed',
      type: obj.type || 'TABLE',
      columns: (obj.columns || []).map((col: any) => this.parseColumnFromObject(col)),
      indexes: (obj.indexes || []).map((idx: any) => this.parseIndexFromObject(idx)),
      constraints: (obj.constraints || []).map((con: any) => this.parseConstraintFromObject(con)),
      relationships: obj.relationships || [],
      metadata: obj.metadata || {},
      statistics: obj.statistics || this.generateEmptyStatistics()
    };
  }

  private parseColumnFromObject(col: any): ParsedColumn {
    return {
      name: col.name,
      dataType: col.dataType || { name: 'UNKNOWN', category: 'OTHER' },
      isNullable: col.isNullable ?? true,
      isPrimaryKey: col.isPrimaryKey ?? false,
      isForeignKey: col.isForeignKey ?? false,
      isUnique: col.isUnique ?? false,
      defaultValue: col.defaultValue,
      maxLength: col.maxLength,
      precision: col.precision,
      scale: col.scale,
      description: col.description,
      tags: col.tags || [],
      qualityScore: col.qualityScore ?? 0.5
    };
  }

  private parseIndexFromObject(idx: any): ParsedIndex {
    return {
      name: idx.name,
      type: idx.type || 'NONCLUSTERED',
      columns: idx.columns || [],
      isUnique: idx.isUnique ?? false,
      isPrimaryKey: idx.isPrimaryKey ?? false,
      size: idx.size,
      usage: idx.usage
    };
  }

  private parseConstraintFromObject(con: any): ParsedConstraint {
    return {
      name: con.name,
      type: con.type,
      columns: con.columns || [],
      referencedTable: con.referencedTable,
      referencedColumns: con.referencedColumns,
      definition: con.definition
    };
  }

  private parseColumnsFromMetadata(metadata: any[]): ParsedColumn[] {
    return metadata.map(col => ({
      name: col.column_name || col.name,
      dataType: this.parseDataType(col.data_type || col.type),
      isNullable: col.is_nullable === 'YES' || col.nullable === true,
      isPrimaryKey: col.is_primary_key === true,
      isForeignKey: col.is_foreign_key === true,
      isUnique: col.is_unique === true,
      defaultValue: col.default_value,
      maxLength: col.character_maximum_length,
      precision: col.numeric_precision,
      scale: col.numeric_scale,
      description: col.description || col.comment,
      tags: this.options.generateTags ? this.generateColumnTags(col.column_name || col.name, this.parseDataType(col.data_type || col.type)) : [],
      qualityScore: this.calculateColumnQualityScore(col.column_name || col.name, this.parseDataType(col.data_type || col.type))
    }));
  }

  private parseIndexesFromMetadata(metadata: any[]): ParsedIndex[] {
    return metadata.map(idx => ({
      name: idx.index_name || idx.name,
      type: idx.index_type || 'NONCLUSTERED',
      columns: idx.column_names || idx.columns || [],
      isUnique: idx.is_unique === true,
      isPrimaryKey: idx.is_primary === true,
      size: idx.size_bytes,
      usage: idx.usage_stats
    }));
  }

  private parseConstraintsFromMetadata(metadata: any[]): ParsedConstraint[] {
    return metadata.map(con => ({
      name: con.constraint_name || con.name,
      type: con.constraint_type || con.type,
      columns: con.column_names || con.columns || [],
      referencedTable: con.referenced_table,
      referencedColumns: con.referenced_columns,
      definition: con.definition
    }));
  }

  private generateColumnTags(name: string, dataType: DataType): string[] {
    const tags: string[] = [];
    
    // Add category tag
    tags.push(dataType.category.toLowerCase());
    
    // Add common pattern tags
    const namePattern = name.toLowerCase();
    if (namePattern.includes('id')) tags.push('identifier');
    if (namePattern.includes('name')) tags.push('name');
    if (namePattern.includes('email')) tags.push('email');
    if (namePattern.includes('phone')) tags.push('phone');
    if (namePattern.includes('address')) tags.push('address');
    if (namePattern.includes('date') || namePattern.includes('time')) tags.push('temporal');
    if (namePattern.includes('amount') || namePattern.includes('price') || namePattern.includes('cost')) tags.push('financial');
    
    return tags;
  }

  private calculateColumnQualityScore(name: string, dataType: DataType): number {
    let score = 0.5; // Base score
    
    // Add points for descriptive names
    if (name.length > 3) score += 0.1;
    if (name.includes('_')) score += 0.1; // Snake case naming
    
    // Add points for appropriate data types
    if (dataType.category !== 'OTHER') score += 0.2;
    if (dataType.maxLength || dataType.precision) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private generateStatistics(columns: ParsedColumn[], indexes: ParsedIndex[]): SchemaStatistics {
    return {
      columnCount: columns.length,
      indexCount: indexes.length,
      primaryKeyCount: columns.filter(col => col.isPrimaryKey).length,
      foreignKeyCount: columns.filter(col => col.isForeignKey).length,
      uniqueConstraintCount: columns.filter(col => col.isUnique).length,
      nullableColumnCount: columns.filter(col => col.isNullable).length,
      averageQualityScore: columns.reduce((sum, col) => sum + col.qualityScore, 0) / columns.length,
      dataTypeDistribution: this.calculateDataTypeDistribution(columns)
    };
  }

  private generateEmptyStatistics(): SchemaStatistics {
    return {
      columnCount: 0,
      indexCount: 0,
      primaryKeyCount: 0,
      foreignKeyCount: 0,
      uniqueConstraintCount: 0,
      nullableColumnCount: 0,
      averageQualityScore: 0,
      dataTypeDistribution: {}
    };
  }

  private calculateDataTypeDistribution(columns: ParsedColumn[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    columns.forEach(col => {
      const category = col.dataType.category;
      distribution[category] = (distribution[category] || 0) + 1;
    });
    
    return distribution;
  }

  private parseDefaultValue(defaultStr: string): any {
    const value = defaultStr.replace(/^DEFAULT\s+/i, '').trim();
    
    // Handle quoted strings
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    
    // Handle numbers
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return parseFloat(value);
    }
    
    // Handle booleans
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Handle NULL
    if (value.toLowerCase() === 'null') return null;
    
    return value;
  }

  private validateParsedSchema(schema: ParsedSchema): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for primary key
    if (!schema.columns.some(col => col.isPrimaryKey)) {
      warnings.push('No primary key defined');
    }
    
    // Check for duplicate column names
    const columnNames = schema.columns.map(col => col.name.toLowerCase());
    const duplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate column names: ${duplicates.join(', ')}`);
    }
    
    // Check for orphaned foreign keys
    schema.columns.filter(col => col.isForeignKey).forEach(col => {
      const hasConstraint = schema.constraints.some(con => 
        con.type === 'FOREIGN_KEY' && con.columns.includes(col.name)
      );
      if (!hasConstraint) {
        warnings.push(`Column ${col.name} marked as foreign key but no constraint defined`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private enrichSchemaMetadata(schema: ParsedSchema): void {
    // Add computed metadata
    if (!schema.metadata.rowCount) {
      schema.metadata.rowCount = 0; // Would be fetched from actual database
    }
    
    // Calculate estimated size
    if (!schema.metadata.sizeBytes) {
      schema.metadata.sizeBytes = this.estimateSchemaSize(schema);
    }
  }

  private estimateSchemaSize(schema: ParsedSchema): number {
    // Rough estimation based on column types and count
    const baseRowSize = schema.columns.reduce((size, col) => {
      switch (col.dataType.category) {
        case 'STRING': return size + (col.dataType.maxLength || 50);
        case 'NUMERIC': return size + 8;
        case 'TEMPORAL': return size + 8;
        case 'BOOLEAN': return size + 1;
        case 'BINARY': return size + (col.dataType.maxLength || 100);
        case 'UUID': return size + 16;
        default: return size + 50;
      }
    }, 0);
    
    const estimatedRows = schema.metadata.rowCount || 1000;
    return baseRowSize * estimatedRows;
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Parse schema from DDL string
 */
export function parseSchemaFromDDL(ddl: string, options?: SchemaParsingOptions): ParsedSchema {
  const parser = new SchemaParser(options);
  return parser.parseDDL(ddl);
}

/**
 * Parse schema from JSON definition
 */
export function parseSchemaFromJSON(json: any, options?: SchemaParsingOptions): ParsedSchema {
  const parser = new SchemaParser(options);
  return parser.parseJSON(json);
}

/**
 * Parse schema from database metadata
 */
export function parseSchemaFromMetadata(metadata: any, options?: SchemaParsingOptions): ParsedSchema {
  const parser = new SchemaParser(options);
  return parser.parseMetadata(metadata);
}

/**
 * Compare two schemas and return differences
 */
export function compareSchemas(schema1: ParsedSchema, schema2: ParsedSchema): {
  addedColumns: ParsedColumn[];
  removedColumns: ParsedColumn[];
  modifiedColumns: { old: ParsedColumn; new: ParsedColumn }[];
  addedIndexes: ParsedIndex[];
  removedIndexes: ParsedIndex[];
  addedConstraints: ParsedConstraint[];
  removedConstraints: ParsedConstraint[];
} {
  const addedColumns: ParsedColumn[] = [];
  const removedColumns: ParsedColumn[] = [];
  const modifiedColumns: { old: ParsedColumn; new: ParsedColumn }[] = [];
  
  // Compare columns
  const schema1ColumnMap = new Map(schema1.columns.map(col => [col.name, col]));
  const schema2ColumnMap = new Map(schema2.columns.map(col => [col.name, col]));
  
  // Find added columns
  schema2.columns.forEach(col => {
    if (!schema1ColumnMap.has(col.name)) {
      addedColumns.push(col);
    }
  });
  
  // Find removed and modified columns
  schema1.columns.forEach(col => {
    if (!schema2ColumnMap.has(col.name)) {
      removedColumns.push(col);
    } else {
      const newCol = schema2ColumnMap.get(col.name)!;
      if (JSON.stringify(col) !== JSON.stringify(newCol)) {
        modifiedColumns.push({ old: col, new: newCol });
      }
    }
  });
  
  // Compare indexes and constraints (simplified)
  const addedIndexes = schema2.indexes.filter(idx => 
    !schema1.indexes.some(idx1 => idx1.name === idx.name)
  );
  
  const removedIndexes = schema1.indexes.filter(idx => 
    !schema2.indexes.some(idx2 => idx2.name === idx.name)
  );
  
  const addedConstraints = schema2.constraints.filter(con => 
    !schema1.constraints.some(con1 => con1.name === con.name)
  );
  
  const removedConstraints = schema1.constraints.filter(con => 
    !schema2.constraints.some(con2 => con2.name === con.name)
  );
  
  return {
    addedColumns,
    removedColumns,
    modifiedColumns,
    addedIndexes,
    removedIndexes,
    addedConstraints,
    removedConstraints
  };
}

// Create default instance
export const schemaParser = new SchemaParser();