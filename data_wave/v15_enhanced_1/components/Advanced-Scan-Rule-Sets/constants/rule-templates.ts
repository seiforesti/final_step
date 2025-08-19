import { RuleTemplate, PatternType, ConditionOperator, ActionType } from '../types/scan-rules.types';

// Core Rule Templates
export const CORE_RULE_TEMPLATES: RuleTemplate[] = [
  // Personal Identifiable Information (PII) Templates
  {
    id: 'pii-ssn-us',
    name: 'US Social Security Number',
    description: 'Detects US Social Security Numbers in various formats',
    category: 'PII',
    tags: ['ssn', 'pii', 'us', 'social-security'],
    version: '1.2.0',
    author: 'Data Governance Team',
    complexity: 3,
    patterns: [
      {
        id: 'ssn-pattern-1',
        type: 'regex' as PatternType,
        expression: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
        description: 'SSN with dashes (123-45-6789)',
        weight: 0.9,
        flags: ['global', 'case-insensitive']
      },
      {
        id: 'ssn-pattern-2',
        type: 'regex' as PatternType,
        expression: '\\b\\d{3}\\s\\d{2}\\s\\d{4}\\b',
        description: 'SSN with spaces (123 45 6789)',
        weight: 0.8,
        flags: ['global', 'case-insensitive']
      },
      {
        id: 'ssn-pattern-3',
        type: 'regex' as PatternType,
        expression: '\\b\\d{9}\\b',
        description: 'SSN without separators (123456789)',
        weight: 0.7,
        flags: ['global', 'case-insensitive']
      }
    ],
    conditions: [
      {
        id: 'ssn-condition-1',
        field: 'value',
        operator: 'not_starts_with' as ConditionOperator,
        value: ['000', '666', '9'],
        description: 'Invalid SSN prefixes'
      },
      {
        id: 'ssn-condition-2',
        field: 'length',
        operator: 'between' as ConditionOperator,
        value: [9, 11],
        description: 'Valid SSN length range'
      }
    ],
    actions: [
      {
        id: 'ssn-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'PII',
          sensitivity: 'High',
          category: 'Social Security Number'
        }
      },
      {
        id: 'ssn-action-2',
        type: 'alert' as ActionType,
        parameters: {
          severity: 'high',
          message: 'SSN detected in data'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 10,
      requiredFields: ['value']
    },
    metadata: {
      regulation: ['GDPR', 'CCPA', 'HIPAA'],
      dataTypes: ['string', 'text'],
      regions: ['US'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-15T12:30:00Z'
    }
  },

  {
    id: 'pii-email',
    name: 'Email Address',
    description: 'Detects email addresses in various formats',
    category: 'PII',
    tags: ['email', 'pii', 'contact'],
    version: '1.1.0',
    author: 'Data Governance Team',
    complexity: 2,
    patterns: [
      {
        id: 'email-pattern-1',
        type: 'regex' as PatternType,
        expression: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
        description: 'Standard email format',
        weight: 0.95,
        flags: ['global', 'case-insensitive']
      },
      {
        id: 'email-pattern-2',
        type: 'regex' as PatternType,
        expression: '\\b[A-Za-z0-9._%+-]+\\s*@\\s*[A-Za-z0-9.-]+\\s*\\.\\s*[A-Z|a-z]{2,}\\b',
        description: 'Email with spaces around @ and .',
        weight: 0.8,
        flags: ['global', 'case-insensitive']
      }
    ],
    conditions: [
      {
        id: 'email-condition-1',
        field: 'domain',
        operator: 'not_equals' as ConditionOperator,
        value: ['test.com', 'example.com', 'temp.com'],
        description: 'Exclude test domains'
      }
    ],
    actions: [
      {
        id: 'email-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'PII',
          sensitivity: 'Medium',
          category: 'Email Address'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 5,
      requiredFields: ['value']
    },
    metadata: {
      regulation: ['GDPR', 'CCPA'],
      dataTypes: ['string', 'text'],
      regions: ['Global'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-10T09:15:00Z'
    }
  },

  {
    id: 'pii-phone-us',
    name: 'US Phone Number',
    description: 'Detects US phone numbers in various formats',
    category: 'PII',
    tags: ['phone', 'pii', 'us', 'contact'],
    version: '1.0.0',
    author: 'Data Governance Team',
    complexity: 3,
    patterns: [
      {
        id: 'phone-pattern-1',
        type: 'regex' as PatternType,
        expression: '\\b\\(\\d{3}\\)\\s*\\d{3}-\\d{4}\\b',
        description: 'Phone with parentheses (123) 456-7890',
        weight: 0.9,
        flags: ['global']
      },
      {
        id: 'phone-pattern-2',
        type: 'regex' as PatternType,
        expression: '\\b\\d{3}-\\d{3}-\\d{4}\\b',
        description: 'Phone with dashes 123-456-7890',
        weight: 0.85,
        flags: ['global']
      },
      {
        id: 'phone-pattern-3',
        type: 'regex' as PatternType,
        expression: '\\b\\d{3}\\.\\d{3}\\.\\d{4}\\b',
        description: 'Phone with dots 123.456.7890',
        weight: 0.8,
        flags: ['global']
      }
    ],
    conditions: [
      {
        id: 'phone-condition-1',
        field: 'area_code',
        operator: 'not_in' as ConditionOperator,
        value: ['000', '111', '555'],
        description: 'Invalid area codes'
      }
    ],
    actions: [
      {
        id: 'phone-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'PII',
          sensitivity: 'Medium',
          category: 'Phone Number'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 8,
      requiredFields: ['value']
    },
    metadata: {
      regulation: ['GDPR', 'CCPA'],
      dataTypes: ['string', 'text'],
      regions: ['US'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-01T00:00:00Z'
    }
  },

  // Financial Data Templates
  {
    id: 'fin-credit-card',
    name: 'Credit Card Number',
    description: 'Detects credit card numbers using Luhn algorithm validation',
    category: 'Financial',
    tags: ['credit-card', 'financial', 'payment'],
    version: '1.3.0',
    author: 'Security Team',
    complexity: 4,
    patterns: [
      {
        id: 'cc-pattern-visa',
        type: 'regex' as PatternType,
        expression: '\\b4\\d{3}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',
        description: 'Visa card pattern',
        weight: 0.9,
        flags: ['global']
      },
      {
        id: 'cc-pattern-mastercard',
        type: 'regex' as PatternType,
        expression: '\\b5[1-5]\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',
        description: 'MasterCard pattern',
        weight: 0.9,
        flags: ['global']
      },
      {
        id: 'cc-pattern-amex',
        type: 'regex' as PatternType,
        expression: '\\b3[47]\\d{2}[\\s-]?\\d{6}[\\s-]?\\d{5}\\b',
        description: 'American Express pattern',
        weight: 0.9,
        flags: ['global']
      }
    ],
    conditions: [
      {
        id: 'cc-condition-luhn',
        field: 'value',
        operator: 'custom' as ConditionOperator,
        value: 'luhn_check',
        description: 'Luhn algorithm validation'
      }
    ],
    actions: [
      {
        id: 'cc-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'Financial',
          sensitivity: 'Critical',
          category: 'Credit Card'
        }
      },
      {
        id: 'cc-action-2',
        type: 'encrypt' as ActionType,
        parameters: {
          algorithm: 'AES-256',
          keyManagement: 'HSM'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 12,
      requiredFields: ['value'],
      customValidators: ['luhn_check']
    },
    metadata: {
      regulation: ['PCI-DSS', 'GDPR'],
      dataTypes: ['string', 'number'],
      regions: ['Global'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-20T14:45:00Z'
    }
  },

  {
    id: 'fin-bank-account',
    name: 'Bank Account Number',
    description: 'Detects bank account numbers and routing numbers',
    category: 'Financial',
    tags: ['bank-account', 'financial', 'banking'],
    version: '1.1.0',
    author: 'Security Team',
    complexity: 3,
    patterns: [
      {
        id: 'bank-pattern-routing',
        type: 'regex' as PatternType,
        expression: '\\b\\d{9}\\b',
        description: 'US routing number (9 digits)',
        weight: 0.7,
        flags: ['global']
      },
      {
        id: 'bank-pattern-account',
        type: 'regex' as PatternType,
        expression: '\\b\\d{8,17}\\b',
        description: 'Bank account number (8-17 digits)',
        weight: 0.6,
        flags: ['global']
      }
    ],
    conditions: [
      {
        id: 'bank-condition-routing',
        field: 'routing_number',
        operator: 'custom' as ConditionOperator,
        value: 'aba_check',
        description: 'ABA routing number validation'
      }
    ],
    actions: [
      {
        id: 'bank-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'Financial',
          sensitivity: 'Critical',
          category: 'Bank Account'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 8,
      requiredFields: ['value']
    },
    metadata: {
      regulation: ['PCI-DSS', 'SOX', 'GDPR'],
      dataTypes: ['string', 'number'],
      regions: ['US'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-12T11:20:00Z'
    }
  },

  // Health Information Templates
  {
    id: 'health-mrn',
    name: 'Medical Record Number',
    description: 'Detects medical record numbers in various formats',
    category: 'Health',
    tags: ['mrn', 'health', 'medical', 'hipaa'],
    version: '1.0.0',
    author: 'Healthcare Team',
    complexity: 2,
    patterns: [
      {
        id: 'mrn-pattern-1',
        type: 'regex' as PatternType,
        expression: '\\bMRN[:\\s]*\\d{6,12}\\b',
        description: 'MRN prefix with number',
        weight: 0.95,
        flags: ['global', 'case-insensitive']
      },
      {
        id: 'mrn-pattern-2',
        type: 'regex' as PatternType,
        expression: '\\bMEDICAL[\\s-]?RECORD[\\s-]?NUMBER[:\\s]*\\d{6,12}\\b',
        description: 'Full medical record number text',
        weight: 0.9,
        flags: ['global', 'case-insensitive']
      }
    ],
    conditions: [
      {
        id: 'mrn-condition-1',
        field: 'length',
        operator: 'between' as ConditionOperator,
        value: [6, 12],
        description: 'Valid MRN length'
      }
    ],
    actions: [
      {
        id: 'mrn-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'Health',
          sensitivity: 'High',
          category: 'Medical Record Number'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 5,
      requiredFields: ['value']
    },
    metadata: {
      regulation: ['HIPAA', 'HITECH'],
      dataTypes: ['string'],
      regions: ['US'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-01T00:00:00Z'
    }
  },

  // Government ID Templates
  {
    id: 'gov-passport-us',
    name: 'US Passport Number',
    description: 'Detects US passport numbers',
    category: 'Government ID',
    tags: ['passport', 'government', 'us', 'id'],
    version: '1.0.0',
    author: 'Compliance Team',
    complexity: 2,
    patterns: [
      {
        id: 'passport-pattern-1',
        type: 'regex' as PatternType,
        expression: '\\b[A-Z]{1,2}\\d{6,9}\\b',
        description: 'US passport format (1-2 letters + 6-9 digits)',
        weight: 0.85,
        flags: ['global']
      }
    ],
    conditions: [
      {
        id: 'passport-condition-1',
        field: 'length',
        operator: 'between' as ConditionOperator,
        value: [7, 11],
        description: 'Valid passport length'
      }
    ],
    actions: [
      {
        id: 'passport-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'Government ID',
          sensitivity: 'High',
          category: 'Passport Number'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 5,
      requiredFields: ['value']
    },
    metadata: {
      regulation: ['GDPR', 'Travel Security'],
      dataTypes: ['string'],
      regions: ['US'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-01T00:00:00Z'
    }
  },

  // Technical Data Templates
  {
    id: 'tech-ip-address',
    name: 'IP Address',
    description: 'Detects IPv4 and IPv6 addresses',
    category: 'Technical',
    tags: ['ip', 'network', 'technical'],
    version: '1.1.0',
    author: 'IT Security Team',
    complexity: 2,
    patterns: [
      {
        id: 'ip-pattern-ipv4',
        type: 'regex' as PatternType,
        expression: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b',
        description: 'IPv4 address',
        weight: 0.9,
        flags: ['global']
      },
      {
        id: 'ip-pattern-ipv6',
        type: 'regex' as PatternType,
        expression: '\\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\b',
        description: 'IPv6 address (full)',
        weight: 0.85,
        flags: ['global']
      }
    ],
    conditions: [
      {
        id: 'ip-condition-1',
        field: 'value',
        operator: 'custom' as ConditionOperator,
        value: 'valid_ip',
        description: 'Valid IP address validation'
      }
    ],
    actions: [
      {
        id: 'ip-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'Technical',
          sensitivity: 'Low',
          category: 'IP Address'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 5,
      requiredFields: ['value']
    },
    metadata: {
      regulation: [],
      dataTypes: ['string'],
      regions: ['Global'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-05T16:30:00Z'
    }
  },

  {
    id: 'tech-api-key',
    name: 'API Key',
    description: 'Detects various API key formats',
    category: 'Technical',
    tags: ['api-key', 'security', 'credentials'],
    version: '1.2.0',
    author: 'Security Team',
    complexity: 3,
    patterns: [
      {
        id: 'api-pattern-1',
        type: 'regex' as PatternType,
        expression: '\\b[A-Za-z0-9]{32,}\\b',
        description: 'Generic API key (32+ characters)',
        weight: 0.6,
        flags: ['global']
      },
      {
        id: 'api-pattern-aws',
        type: 'regex' as PatternType,
        expression: '\\bAKIA[0-9A-Z]{16}\\b',
        description: 'AWS Access Key ID',
        weight: 0.95,
        flags: ['global']
      },
      {
        id: 'api-pattern-github',
        type: 'regex' as PatternType,
        expression: '\\bghp_[A-Za-z0-9]{36}\\b',
        description: 'GitHub Personal Access Token',
        weight: 0.9,
        flags: ['global']
      }
    ],
    conditions: [
      {
        id: 'api-condition-1',
        field: 'entropy',
        operator: 'greater_than' as ConditionOperator,
        value: 4.5,
        description: 'High entropy check'
      }
    ],
    actions: [
      {
        id: 'api-action-1',
        type: 'classify' as ActionType,
        parameters: {
          classification: 'Security',
          sensitivity: 'Critical',
          category: 'API Key'
        }
      },
      {
        id: 'api-action-2',
        type: 'alert' as ActionType,
        parameters: {
          severity: 'critical',
          message: 'API key detected - potential security risk'
        }
      }
    ],
    validation: {
      minPatterns: 1,
      maxComplexity: 8,
      requiredFields: ['value']
    },
    metadata: {
      regulation: ['SOC2', 'ISO27001'],
      dataTypes: ['string'],
      regions: ['Global'],
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-18T10:00:00Z'
    }
  }
];

// Template Categories
export const TEMPLATE_CATEGORIES = [
  {
    id: 'pii',
    name: 'Personal Identifiable Information',
    description: 'Templates for detecting personal information',
    icon: 'user',
    color: '#3b82f6',
    regulations: ['GDPR', 'CCPA', 'PIPEDA']
  },
  {
    id: 'financial',
    name: 'Financial Data',
    description: 'Templates for detecting financial information',
    icon: 'credit-card',
    color: '#10b981',
    regulations: ['PCI-DSS', 'SOX', 'GLBA']
  },
  {
    id: 'health',
    name: 'Health Information',
    description: 'Templates for detecting health-related data',
    icon: 'heart',
    color: '#f59e0b',
    regulations: ['HIPAA', 'HITECH']
  },
  {
    id: 'government',
    name: 'Government ID',
    description: 'Templates for detecting government identifiers',
    icon: 'shield',
    color: '#8b5cf6',
    regulations: ['Various Government Regulations']
  },
  {
    id: 'technical',
    name: 'Technical Data',
    description: 'Templates for detecting technical information',
    icon: 'server',
    color: '#6b7280',
    regulations: ['SOC2', 'ISO27001']
  },
  {
    id: 'custom',
    name: 'Custom Templates',
    description: 'User-defined custom templates',
    icon: 'wrench',
    color: '#ef4444',
    regulations: []
  }
];

// Pattern Type Definitions
export const PATTERN_TYPES = [
  {
    id: 'regex',
    name: 'Regular Expression',
    description: 'Pattern matching using regular expressions',
    icon: 'code',
    complexity: 3,
    examples: ['\\b\\d{3}-\\d{2}-\\d{4}\\b', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}']
  },
  {
    id: 'keyword',
    name: 'Keyword Match',
    description: 'Simple keyword or phrase matching',
    icon: 'search',
    complexity: 1,
    examples: ['password', 'confidential', 'social security']
  },
  {
    id: 'dictionary',
    name: 'Dictionary Lookup',
    description: 'Match against predefined dictionary',
    icon: 'book',
    complexity: 2,
    examples: ['first_names', 'last_names', 'cities']
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    description: 'AI/ML based pattern detection',
    icon: 'brain',
    complexity: 5,
    examples: ['named_entity_recognition', 'sentiment_analysis']
  },
  {
    id: 'statistical',
    name: 'Statistical Analysis',
    description: 'Statistical pattern detection',
    icon: 'trending-up',
    complexity: 4,
    examples: ['entropy_analysis', 'frequency_analysis']
  },
  {
    id: 'custom',
    name: 'Custom Function',
    description: 'User-defined custom pattern function',
    icon: 'function-square',
    complexity: 4,
    examples: ['luhn_check', 'checksum_validation']
  }
];

// Condition Operators
export const CONDITION_OPERATORS = [
  {
    id: 'equals',
    name: 'Equals',
    symbol: '==',
    description: 'Exact match',
    dataTypes: ['string', 'number', 'boolean'],
    examples: ['value == "test"', 'count == 5']
  },
  {
    id: 'not_equals',
    name: 'Not Equals',
    symbol: '!=',
    description: 'Not equal to',
    dataTypes: ['string', 'number', 'boolean'],
    examples: ['value != "test"', 'count != 0']
  },
  {
    id: 'greater_than',
    name: 'Greater Than',
    symbol: '>',
    description: 'Greater than value',
    dataTypes: ['number', 'date'],
    examples: ['length > 10', 'confidence > 0.8']
  },
  {
    id: 'less_than',
    name: 'Less Than',
    symbol: '<',
    description: 'Less than value',
    dataTypes: ['number', 'date'],
    examples: ['length < 100', 'score < 0.5']
  },
  {
    id: 'greater_equal',
    name: 'Greater Than or Equal',
    symbol: '>=',
    description: 'Greater than or equal to value',
    dataTypes: ['number', 'date'],
    examples: ['length >= 8', 'version >= 2.0']
  },
  {
    id: 'less_equal',
    name: 'Less Than or Equal',
    symbol: '<=',
    description: 'Less than or equal to value',
    dataTypes: ['number', 'date'],
    examples: ['length <= 255', 'age <= 120']
  },
  {
    id: 'contains',
    name: 'Contains',
    symbol: 'contains',
    description: 'Contains substring',
    dataTypes: ['string', 'array'],
    examples: ['text contains "password"', 'tags contains "sensitive"']
  },
  {
    id: 'not_contains',
    name: 'Not Contains',
    symbol: 'not contains',
    description: 'Does not contain substring',
    dataTypes: ['string', 'array'],
    examples: ['text not contains "test"', 'path not contains "temp"']
  },
  {
    id: 'starts_with',
    name: 'Starts With',
    symbol: 'starts with',
    description: 'Starts with prefix',
    dataTypes: ['string'],
    examples: ['filename starts with "PII_"', 'id starts with "USER_"']
  },
  {
    id: 'ends_with',
    name: 'Ends With',
    symbol: 'ends with',
    description: 'Ends with suffix',
    dataTypes: ['string'],
    examples: ['filename ends with ".csv"', 'email ends with "@company.com"']
  },
  {
    id: 'in',
    name: 'In List',
    symbol: 'in',
    description: 'Value is in list',
    dataTypes: ['string', 'number'],
    examples: ['status in ["active", "pending"]', 'code in [200, 201, 204]']
  },
  {
    id: 'not_in',
    name: 'Not In List',
    symbol: 'not in',
    description: 'Value is not in list',
    dataTypes: ['string', 'number'],
    examples: ['status not in ["deleted", "archived"]', 'code not in [400, 404, 500]']
  },
  {
    id: 'between',
    name: 'Between',
    symbol: 'between',
    description: 'Value is between range',
    dataTypes: ['number', 'date'],
    examples: ['age between [18, 65]', 'score between [0.0, 1.0]']
  },
  {
    id: 'matches',
    name: 'Matches Pattern',
    symbol: 'matches',
    description: 'Matches regular expression',
    dataTypes: ['string'],
    examples: ['value matches "^[A-Z]{2}\\d{4}$"', 'phone matches "^\\+1\\d{10}$"']
  },
  {
    id: 'custom',
    name: 'Custom Function',
    symbol: 'custom',
    description: 'Custom validation function',
    dataTypes: ['any'],
    examples: ['value custom "luhn_check"', 'data custom "business_rule_1"']
  }
];

// Action Types
export const ACTION_TYPES = [
  {
    id: 'classify',
    name: 'Classify Data',
    description: 'Apply classification labels to data',
    icon: 'tag',
    color: '#3b82f6',
    parameters: [
      { name: 'classification', type: 'string', required: true },
      { name: 'sensitivity', type: 'string', required: true },
      { name: 'category', type: 'string', required: false },
      { name: 'confidence', type: 'number', required: false }
    ]
  },
  {
    id: 'alert',
    name: 'Generate Alert',
    description: 'Send alert notification',
    icon: 'bell',
    color: '#f59e0b',
    parameters: [
      { name: 'severity', type: 'string', required: true },
      { name: 'message', type: 'string', required: true },
      { name: 'recipients', type: 'array', required: false },
      { name: 'channel', type: 'string', required: false }
    ]
  },
  {
    id: 'encrypt',
    name: 'Encrypt Data',
    description: 'Apply encryption to sensitive data',
    icon: 'lock',
    color: '#10b981',
    parameters: [
      { name: 'algorithm', type: 'string', required: true },
      { name: 'keyManagement', type: 'string', required: true },
      { name: 'keyRotation', type: 'boolean', required: false }
    ]
  },
  {
    id: 'mask',
    name: 'Mask Data',
    description: 'Apply data masking',
    icon: 'eye-off',
    color: '#8b5cf6',
    parameters: [
      { name: 'maskType', type: 'string', required: true },
      { name: 'preserveFormat', type: 'boolean', required: false },
      { name: 'maskCharacter', type: 'string', required: false }
    ]
  },
  {
    id: 'quarantine',
    name: 'Quarantine Data',
    description: 'Move data to quarantine area',
    icon: 'shield-alert',
    color: '#ef4444',
    parameters: [
      { name: 'quarantineLocation', type: 'string', required: true },
      { name: 'retentionPeriod', type: 'number', required: false },
      { name: 'accessRestrictions', type: 'array', required: false }
    ]
  },
  {
    id: 'log',
    name: 'Log Event',
    description: 'Log detection event',
    icon: 'file-text',
    color: '#6b7280',
    parameters: [
      { name: 'logLevel', type: 'string', required: true },
      { name: 'message', type: 'string', required: true },
      { name: 'metadata', type: 'object', required: false }
    ]
  },
  {
    id: 'workflow',
    name: 'Trigger Workflow',
    description: 'Start automated workflow',
    icon: 'play',
    color: '#06b6d4',
    parameters: [
      { name: 'workflowId', type: 'string', required: true },
      { name: 'parameters', type: 'object', required: false },
      { name: 'priority', type: 'string', required: false }
    ]
  },
  {
    id: 'custom',
    name: 'Custom Action',
    description: 'Execute custom action function',
    icon: 'code',
    color: '#84cc16',
    parameters: [
      { name: 'function', type: 'string', required: true },
      { name: 'parameters', type: 'object', required: false }
    ]
  }
];

// Validation Rules
export const VALIDATION_RULES = {
  minPatterns: 1,
  maxPatterns: 20,
  minConditions: 0,
  maxConditions: 10,
  minActions: 1,
  maxActions: 5,
  maxComplexity: 100,
  maxNestingDepth: 5,
  requiredFields: ['name', 'patterns', 'actions'],
  validCategories: TEMPLATE_CATEGORIES.map(cat => cat.id),
  validPatternTypes: PATTERN_TYPES.map(type => type.id),
  validConditionOperators: CONDITION_OPERATORS.map(op => op.id),
  validActionTypes: ACTION_TYPES.map(action => action.id)
};

// Example Templates for Quick Start
export const QUICK_START_TEMPLATES = [
  'pii-ssn-us',
  'pii-email',
  'fin-credit-card',
  'tech-api-key'
];

// Template Export/Import Configuration
export const TEMPLATE_CONFIG = {
  version: '1.0.0',
  supportedFormats: ['json', 'yaml', 'xml'],
  exportFields: [
    'id', 'name', 'description', 'category', 'tags', 'version', 'author',
    'patterns', 'conditions', 'actions', 'validation', 'metadata'
  ],
  requiredImportFields: ['name', 'patterns', 'actions'],
  maxTemplateSize: 1024 * 1024, // 1MB
  maxBulkImport: 100
};

export default {
  CORE_RULE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  PATTERN_TYPES,
  CONDITION_OPERATORS,
  ACTION_TYPES,
  VALIDATION_RULES,
  QUICK_START_TEMPLATES,
  TEMPLATE_CONFIG
};