// ============================================================================
// ADVANCED CATALOG SCHEMA CONSTANTS - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Schema definitions and validation rules for catalog assets
// ============================================================================

import { 
  DataAssetType, 
  SchemaFormat, 
  DataType, 
  SensitivityLevel 
} from '../types';

// ============================================================================
// CORE ASSET SCHEMAS
// ============================================================================

export const ASSET_SCHEMAS = {
  // Database Table Schema
  TABLE: {
    name: 'database_table',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 255,
        pattern: '^[a-zA-Z][a-zA-Z0-9_]*$'
      },
      schema: {
        type: 'string',
        required: true,
        maxLength: 128
      },
      database: {
        type: 'string',
        required: true,
        maxLength: 128
      },
      columns: {
        type: 'array',
        required: true,
        items: 'column_schema'
      },
      primaryKey: {
        type: 'array',
        items: 'string'
      },
      foreignKeys: {
        type: 'array',
        items: 'foreign_key_schema'
      },
      indexes: {
        type: 'array',
        items: 'index_schema'
      },
      partitioning: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['RANGE', 'HASH', 'LIST'] },
          columns: { type: 'array', items: 'string' }
        }
      },
      rowCount: {
        type: 'number',
        minimum: 0
      },
      sizeInBytes: {
        type: 'number',
        minimum: 0
      }
    }
  },

  // Database View Schema
  VIEW: {
    name: 'database_view',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 255,
        pattern: '^[a-zA-Z][a-zA-Z0-9_]*$'
      },
      schema: {
        type: 'string',
        required: true,
        maxLength: 128
      },
      database: {
        type: 'string',
        required: true,
        maxLength: 128
      },
      definition: {
        type: 'string',
        required: true
      },
      columns: {
        type: 'array',
        required: true,
        items: 'column_schema'
      },
      dependencies: {
        type: 'array',
        items: 'string'
      },
      materialized: {
        type: 'boolean',
        default: false
      }
    }
  },

  // File Asset Schema
  FILE: {
    name: 'file_asset',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      path: {
        type: 'string',
        required: true,
        maxLength: 4096
      },
      format: {
        type: 'string',
        required: true,
        enum: Object.values(SchemaFormat)
      },
      sizeInBytes: {
        type: 'number',
        required: true,
        minimum: 0
      },
      lastModified: {
        type: 'string',
        format: 'date-time'
      },
      schema: {
        type: 'object',
        properties: {
          columns: { type: 'array', items: 'column_schema' },
          delimiter: { type: 'string' },
          header: { type: 'boolean' },
          encoding: { type: 'string', default: 'UTF-8' }
        }
      },
      compression: {
        type: 'string',
        enum: ['NONE', 'GZIP', 'SNAPPY', 'LZO', 'BZIP2']
      }
    }
  },

  // API Endpoint Schema
  API: {
    name: 'api_endpoint',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      url: {
        type: 'string',
        required: true,
        format: 'uri'
      },
      method: {
        type: 'string',
        required: true,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      },
      parameters: {
        type: 'array',
        items: 'parameter_schema'
      },
      responseSchema: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          properties: { type: 'object' }
        }
      },
      authentication: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['NONE', 'BASIC', 'BEARER', 'API_KEY', 'OAUTH2'] },
          required: { type: 'boolean' }
        }
      },
      rateLimit: {
        type: 'object',
        properties: {
          requests: { type: 'number' },
          period: { type: 'string' }
        }
      }
    }
  },

  // Dashboard Schema
  DASHBOARD: {
    name: 'dashboard',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      description: {
        type: 'string',
        maxLength: 2048
      },
      type: {
        type: 'string',
        enum: ['OPERATIONAL', 'ANALYTICAL', 'EXECUTIVE', 'REAL_TIME']
      },
      widgets: {
        type: 'array',
        items: 'widget_schema'
      },
      filters: {
        type: 'array',
        items: 'filter_schema'
      },
      refreshInterval: {
        type: 'number',
        minimum: 0
      },
      dataSources: {
        type: 'array',
        items: 'string'
      }
    }
  }
} as const;

// ============================================================================
// SUPPORTING SCHEMAS
// ============================================================================

export const SUPPORTING_SCHEMAS = {
  // Column Schema
  column_schema: {
    name: 'column',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 255,
        pattern: '^[a-zA-Z][a-zA-Z0-9_]*$'
      },
      dataType: {
        type: 'string',
        required: true,
        enum: Object.values(DataType)
      },
      nullable: {
        type: 'boolean',
        default: true
      },
      defaultValue: {
        type: 'any'
      },
      maxLength: {
        type: 'number',
        minimum: 0
      },
      precision: {
        type: 'number',
        minimum: 0
      },
      scale: {
        type: 'number',
        minimum: 0
      },
      description: {
        type: 'string',
        maxLength: 1024
      },
      tags: {
        type: 'array',
        items: 'string'
      },
      sensitivityLevel: {
        type: 'string',
        enum: Object.values(SensitivityLevel),
        default: SensitivityLevel.INTERNAL
      },
      piiType: {
        type: 'string',
        enum: ['NAME', 'EMAIL', 'PHONE', 'SSN', 'CREDIT_CARD', 'ADDRESS', 'NONE'],
        default: 'NONE'
      }
    }
  },

  // Foreign Key Schema
  foreign_key_schema: {
    name: 'foreign_key',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      columns: {
        type: 'array',
        required: true,
        items: 'string'
      },
      referencedTable: {
        type: 'string',
        required: true
      },
      referencedColumns: {
        type: 'array',
        required: true,
        items: 'string'
      },
      onDelete: {
        type: 'string',
        enum: ['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION'],
        default: 'NO_ACTION'
      },
      onUpdate: {
        type: 'string',
        enum: ['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION'],
        default: 'NO_ACTION'
      }
    }
  },

  // Index Schema
  index_schema: {
    name: 'index',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      type: {
        type: 'string',
        enum: ['BTREE', 'HASH', 'BITMAP', 'CLUSTERED', 'NON_CLUSTERED'],
        default: 'BTREE'
      },
      columns: {
        type: 'array',
        required: true,
        items: 'string'
      },
      unique: {
        type: 'boolean',
        default: false
      },
      partial: {
        type: 'boolean',
        default: false
      },
      condition: {
        type: 'string'
      }
    }
  },

  // Parameter Schema (for APIs)
  parameter_schema: {
    name: 'parameter',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 128
      },
      type: {
        type: 'string',
        required: true,
        enum: ['query', 'path', 'header', 'body']
      },
      dataType: {
        type: 'string',
        required: true,
        enum: Object.values(DataType)
      },
      required: {
        type: 'boolean',
        default: false
      },
      description: {
        type: 'string',
        maxLength: 512
      },
      defaultValue: {
        type: 'any'
      },
      enum: {
        type: 'array',
        items: 'any'
      }
    }
  },

  // Widget Schema (for Dashboards)
  widget_schema: {
    name: 'widget',
    version: '1.0.0',
    fields: {
      id: {
        type: 'string',
        required: true
      },
      type: {
        type: 'string',
        required: true,
        enum: ['CHART', 'TABLE', 'METRIC', 'TEXT', 'IMAGE']
      },
      title: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      position: {
        type: 'object',
        required: true,
        properties: {
          x: { type: 'number', minimum: 0 },
          y: { type: 'number', minimum: 0 },
          width: { type: 'number', minimum: 1 },
          height: { type: 'number', minimum: 1 }
        }
      },
      dataSource: {
        type: 'string'
      },
      query: {
        type: 'string'
      },
      configuration: {
        type: 'object'
      }
    }
  },

  // Filter Schema
  filter_schema: {
    name: 'filter',
    version: '1.0.0',
    fields: {
      name: {
        type: 'string',
        required: true,
        maxLength: 128
      },
      field: {
        type: 'string',
        required: true
      },
      type: {
        type: 'string',
        required: true,
        enum: ['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN']
      },
      defaultValue: {
        type: 'any'
      },
      options: {
        type: 'array',
        items: 'object'
      },
      required: {
        type: 'boolean',
        default: false
      }
    }
  }
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  // Asset Name Validation
  ASSET_NAME: {
    pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    minLength: 1,
    maxLength: 255,
    description: 'Asset name must start with a letter and contain only letters, numbers, underscores, and hyphens'
  },

  // Column Name Validation
  COLUMN_NAME: {
    pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
    minLength: 1,
    maxLength: 255,
    description: 'Column name must start with a letter and contain only letters, numbers, and underscores'
  },

  // Schema Name Validation
  SCHEMA_NAME: {
    pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
    minLength: 1,
    maxLength: 128,
    description: 'Schema name must start with a letter and contain only letters, numbers, and underscores'
  },

  // Database Name Validation
  DATABASE_NAME: {
    pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
    minLength: 1,
    maxLength: 128,
    description: 'Database name must start with a letter and contain only letters, numbers, and underscores'
  },

  // File Path Validation
  FILE_PATH: {
    pattern: /^[a-zA-Z0-9_\-/.]+$/,
    minLength: 1,
    maxLength: 4096,
    description: 'File path must contain only valid path characters'
  },

  // URL Validation
  URL: {
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    description: 'Must be a valid HTTP or HTTPS URL'
  },

  // Tag Validation
  TAG: {
    pattern: /^[a-zA-Z0-9_-]+$/,
    minLength: 1,
    maxLength: 64,
    description: 'Tag must contain only letters, numbers, underscores, and hyphens'
  },

  // Description Validation
  DESCRIPTION: {
    minLength: 0,
    maxLength: 2048,
    description: 'Description must be less than 2048 characters'
  }
} as const;

// ============================================================================
// SCHEMA TEMPLATES
// ============================================================================

export const SCHEMA_TEMPLATES = {
  // Standard Data Warehouse Table Template
  DATA_WAREHOUSE_TABLE: {
    name: 'Standard Data Warehouse Table',
    description: 'Template for standard data warehouse dimension and fact tables',
    schema: {
      ...ASSET_SCHEMAS.TABLE,
      defaultFields: {
        created_date: {
          dataType: DataType.DATETIME,
          nullable: false,
          description: 'Record creation timestamp'
        },
        updated_date: {
          dataType: DataType.DATETIME,
          nullable: false,
          description: 'Record last update timestamp'
        },
        is_active: {
          dataType: DataType.BOOLEAN,
          nullable: false,
          defaultValue: true,
          description: 'Record active status'
        },
        data_source: {
          dataType: DataType.STRING,
          nullable: false,
          maxLength: 128,
          description: 'Source system identifier'
        }
      }
    }
  },

  // Customer Data Template
  CUSTOMER_DATA: {
    name: 'Customer Data Table',
    description: 'Template for customer-related data with PII considerations',
    schema: {
      ...ASSET_SCHEMAS.TABLE,
      defaultFields: {
        customer_id: {
          dataType: DataType.STRING,
          nullable: false,
          description: 'Unique customer identifier',
          sensitivityLevel: SensitivityLevel.INTERNAL
        },
        email: {
          dataType: DataType.STRING,
          nullable: true,
          maxLength: 255,
          description: 'Customer email address',
          sensitivityLevel: SensitivityLevel.CONFIDENTIAL,
          piiType: 'EMAIL'
        },
        phone: {
          dataType: DataType.STRING,
          nullable: true,
          maxLength: 20,
          description: 'Customer phone number',
          sensitivityLevel: SensitivityLevel.CONFIDENTIAL,
          piiType: 'PHONE'
        },
        created_date: {
          dataType: DataType.DATETIME,
          nullable: false,
          description: 'Customer record creation date'
        }
      }
    }
  },

  // Financial Data Template
  FINANCIAL_DATA: {
    name: 'Financial Data Table',
    description: 'Template for financial data with high security requirements',
    schema: {
      ...ASSET_SCHEMAS.TABLE,
      defaultFields: {
        transaction_id: {
          dataType: DataType.STRING,
          nullable: false,
          description: 'Unique transaction identifier',
          sensitivityLevel: SensitivityLevel.CONFIDENTIAL
        },
        amount: {
          dataType: DataType.DECIMAL,
          nullable: false,
          precision: 15,
          scale: 2,
          description: 'Transaction amount',
          sensitivityLevel: SensitivityLevel.RESTRICTED
        },
        currency: {
          dataType: DataType.STRING,
          nullable: false,
          maxLength: 3,
          description: 'Currency code (ISO 4217)'
        },
        transaction_date: {
          dataType: DataType.DATETIME,
          nullable: false,
          description: 'Transaction timestamp'
        }
      }
    }
  },

  // Log Data Template
  LOG_DATA: {
    name: 'Log Data File',
    description: 'Template for log file data',
    schema: {
      ...ASSET_SCHEMAS.FILE,
      defaultFields: {
        timestamp: {
          dataType: DataType.DATETIME,
          nullable: false,
          description: 'Log entry timestamp'
        },
        level: {
          dataType: DataType.STRING,
          nullable: false,
          maxLength: 10,
          description: 'Log level (ERROR, WARN, INFO, DEBUG)'
        },
        message: {
          dataType: DataType.STRING,
          nullable: false,
          maxLength: 4096,
          description: 'Log message content'
        },
        source: {
          dataType: DataType.STRING,
          nullable: false,
          maxLength: 128,
          description: 'Log source identifier'
        }
      }
    }
  }
} as const;

// ============================================================================
// SCHEMA CATEGORIES
// ============================================================================

export const SCHEMA_CATEGORIES = {
  STRUCTURED_DATA: {
    name: 'Structured Data',
    description: 'Well-defined schema with fixed columns and data types',
    assetTypes: [DataAssetType.TABLE, DataAssetType.VIEW],
    characteristics: ['Fixed schema', 'Relational', 'ACID compliant']
  },

  SEMI_STRUCTURED_DATA: {
    name: 'Semi-Structured Data',
    description: 'Flexible schema with some organizational structure',
    assetTypes: [DataAssetType.FILE],
    formats: [SchemaFormat.JSON, SchemaFormat.AVRO, SchemaFormat.PARQUET],
    characteristics: ['Flexible schema', 'Self-describing', 'Hierarchical']
  },

  UNSTRUCTURED_DATA: {
    name: 'Unstructured Data',
    description: 'No predefined schema or structure',
    assetTypes: [DataAssetType.FILE],
    formats: ['TEXT', 'BINARY', 'IMAGE', 'VIDEO', 'AUDIO'],
    characteristics: ['No schema', 'Free-form', 'Content-based']
  },

  STREAMING_DATA: {
    name: 'Streaming Data',
    description: 'Continuous data streams with time-series characteristics',
    assetTypes: [DataAssetType.STREAM],
    characteristics: ['Time-series', 'Continuous', 'Real-time', 'Event-driven']
  },

  API_DATA: {
    name: 'API Data',
    description: 'Data accessed through API endpoints',
    assetTypes: [DataAssetType.API],
    characteristics: ['REST/GraphQL', 'Request-response', 'Rate-limited', 'Authenticated']
  }
} as const;

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_CONFIGS = {
  // Default asset configuration
  ASSET: {
    sensitivityLevel: SensitivityLevel.INTERNAL,
    status: 'ACTIVE',
    qualityThreshold: 0.8,
    enableLineageTracking: true,
    enableQualityMonitoring: true,
    enableUsageTracking: true
  },

  // Default column configuration
  COLUMN: {
    nullable: true,
    sensitivityLevel: SensitivityLevel.INTERNAL,
    piiType: 'NONE',
    enableProfiling: true,
    enableQualityRules: true
  },

  // Default schema configuration
  SCHEMA: {
    version: '1.0.0',
    enableValidation: true,
    strictMode: false,
    allowAdditionalFields: true,
    enableEvolution: true
  }
} as const;