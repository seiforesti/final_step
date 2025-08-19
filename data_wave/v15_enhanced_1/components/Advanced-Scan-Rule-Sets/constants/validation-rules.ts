/**
 * Advanced Validation Rules for Enterprise Data Governance
 * Comprehensive validation criteria, patterns, and rules for
 * scan rule validation, compliance, and quality assurance
 */

// =============================================================================
// SYNTAX VALIDATION RULES
// =============================================================================

export const SYNTAX_VALIDATION_RULES = {
  // SQL-based rules validation
  SQL_RULES: {
    requiredKeywords: ['SELECT', 'FROM', 'WHERE'],
    forbiddenKeywords: ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'],
    maxQueryLength: 10000,
    maxNestingDepth: 5,
    allowedOperators: ['=', '!=', '<>', '<', '>', '<=', '>=', 'LIKE', 'IN', 'NOT IN', 'BETWEEN'],
    forbiddenFunctions: ['EXEC', 'EXECUTE', 'xp_cmdshell'],
    requiredQuoting: true,
    parameterizedQueries: true,
    validIdentifierPattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    maxIdentifierLength: 128
  },

  // Python-based rules validation  
  PYTHON_RULES: {
    allowedImports: [
      'pandas', 'numpy', 'datetime', 'json', 're', 'math', 
      'collections', 'itertools', 'functools', 'typing'
    ],
    forbiddenImports: ['os', 'sys', 'subprocess', 'eval', 'exec'],
    maxFunctionLength: 100,
    maxComplexity: 10,
    requiredDocstrings: true,
    typeHints: true,
    validFunctionPattern: /^[a-z_][a-z0-9_]*$/,
    maxParameterCount: 10,
    forbiddenBuiltins: ['eval', 'exec', 'compile', '__import__']
  },

  // Regular expression rules validation
  REGEX_RULES: {
    maxPatternLength: 1000,
    maxCaptureGroups: 20,
    maxQuantifierRange: 1000,
    forbiddenPatterns: ['.*.*', '.+.+', '(?:){0,}'],
    allowedFlags: ['i', 'm', 's', 'x', 'u'],
    validateUnicodeCategories: true,
    preventCatastrophicBacktracking: true,
    maxExecutionTime: 1000 // milliseconds
  },

  // JSON schema validation
  JSON_SCHEMA_RULES: {
    maxSchemaDepth: 10,
    maxPropertyCount: 100,
    requiredProperties: ['type'],
    allowedTypes: ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'],
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxNumberValue: Number.MAX_SAFE_INTEGER,
    minNumberValue: Number.MIN_SAFE_INTEGER,
    validateFormat: true,
    strictMode: true
  }
} as const;

// =============================================================================
// SEMANTIC VALIDATION RULES
// =============================================================================

export const SEMANTIC_VALIDATION_RULES = {
  // Business logic consistency
  BUSINESS_LOGIC: {
    consistencyChecks: {
      dataTypeAlignment: true,
      fieldNameConsistency: true,
      businessRuleAlignment: true,
      crossReferenceValidation: true
    },
    domainValidation: {
      validateAgainstDictionary: true,
      checkBusinessTerms: true,
      validateRelationships: true,
      enforceNamingConventions: true
    },
    logicalConsistency: {
      checkContradictions: true,
      validateDependencies: true,
      checkCircularReferences: true,
      validatePreconditions: true
    }
  },

  // Data quality rules
  DATA_QUALITY: {
    completenessRules: {
      requiredFields: true,
      minDataCoverage: 0.95,
      nullValueThreshold: 0.05,
      emptyStringThreshold: 0.02
    },
    accuracyRules: {
      dataTypeValidation: true,
      formatValidation: true,
      rangeValidation: true,
      patternValidation: true
    },
    consistencyRules: {
      crossTableConsistency: true,
      referentialIntegrity: true,
      duplicateDetection: true,
      standardizationRules: true
    },
    timelinessRules: {
      dataFreshnessThreshold: 86400, // 24 hours in seconds
      updateFrequencyValidation: true,
      timestampValidation: true,
      latencyThreshold: 300 // 5 minutes in seconds
    }
  },

  // Context awareness
  CONTEXT_VALIDATION: {
    industryContext: {
      validateIndustryTerms: true,
      checkRegulations: true,
      validateStandards: true,
      enforceIndustryPractices: true
    },
    organizationalContext: {
      alignWithPolicies: true,
      validatePermissions: true,
      checkApprovalLevels: true,
      enforceGovernanceRules: true
    },
    technicalContext: {
      systemCompatibility: true,
      performanceConstraints: true,
      securityRequirements: true,
      scalabilityConsiderations: true
    }
  }
} as const;

// =============================================================================
// PERFORMANCE VALIDATION RULES
// =============================================================================

export const PERFORMANCE_VALIDATION_RULES = {
  // Execution performance
  EXECUTION_PERFORMANCE: {
    maxExecutionTime: 5000, // milliseconds
    maxMemoryUsage: 200, // MB
    maxCpuUsage: 70, // percentage
    maxIoOperations: 1000,
    maxNetworkCalls: 10,
    cacheHitRatio: 0.8,
    parallelizationFactor: 4
  },

  // Scalability requirements
  SCALABILITY: {
    maxDataVolumeGB: 1000,
    maxConcurrentUsers: 1000,
    maxTransactionsPerSecond: 1000,
    linearScalingFactor: 0.9,
    horizontalScalingSupport: true,
    loadBalancingRequirement: true,
    failoverCapability: true
  },

  // Resource constraints
  RESOURCE_CONSTRAINTS: {
    maxDatabaseConnections: 100,
    maxFileHandles: 1000,
    maxThreadCount: 50,
    maxQueueSize: 10000,
    maxCacheSize: 500, // MB
    maxLogFileSize: 100, // MB
    diskSpaceThreshold: 0.1 // 10% free space minimum
  },

  // Performance benchmarks
  BENCHMARKS: {
    responseTimeP95: 1000, // milliseconds
    responseTimeP99: 2000, // milliseconds
    throughputMinimum: 100, // requests per second
    availabilityTarget: 0.999, // 99.9%
    errorRateMaximum: 0.001, // 0.1%
    latencyMaximum: 100, // milliseconds
    recoveryTimeObjective: 300 // seconds
  }
} as const;

// =============================================================================
// COMPLIANCE VALIDATION RULES
// =============================================================================

export const COMPLIANCE_VALIDATION_RULES = {
  // GDPR compliance
  GDPR: {
    dataMinimization: {
      collectOnlyNecessary: true,
      purposeLimitation: true,
      retentionLimits: true,
      dataReduction: true
    },
    consentManagement: {
      explicitConsent: true,
      granularConsent: true,
      withdrawalMechanism: true,
      consentRecords: true
    },
    rightsManagement: {
      rightToAccess: true,
      rightToRectification: true,
      rightToErasure: true,
      rightToPortability: true,
      rightToObject: true
    },
    securityMeasures: {
      pseudonymization: true,
      encryption: true,
      accessControls: true,
      auditLogging: true
    }
  },

  // CCPA compliance
  CCPA: {
    consumerRights: {
      rightToKnow: true,
      rightToDelete: true,
      rightToOptOut: true,
      rightToNonDiscrimination: true
    },
    dataHandling: {
      salesDisclosure: true,
      categoryDisclosure: true,
      purposeDisclosure: true,
      retentionPeriods: true
    },
    privacyNotices: {
      collectionNotice: true,
      privacyPolicy: true,
      optOutMethods: true,
      contactInformation: true
    }
  },

  // HIPAA compliance
  HIPAA: {
    safeguards: {
      administrativeSafeguards: true,
      physicalSafeguards: true,
      technicalSafeguards: true,
      organizationalRequirements: true
    },
    accessControls: {
      uniqueUserIdentification: true,
      automaticLogoff: true,
      encryptionDecryption: true,
      auditControls: true
    },
    dataIntegrity: {
      phi: true, // Protected Health Information
      transmissionSecurity: true,
      backupProcedures: true,
      disasterRecovery: true
    }
  },

  // SOX compliance
  SOX: {
    internalControls: {
      financialReporting: true,
      accessControls: true,
      changeManagement: true,
      segregationOfDuties: true
    },
    auditRequirements: {
      auditTrails: true,
      documentRetention: true,
      managementAssessment: true,
      externalAuditorReview: true
    },
    disclosure: {
      materialWeaknesses: true,
      significantDeficiencies: true,
      compensatingControls: true,
      remediation: true
    }
  },

  // PCI DSS compliance
  PCI_DSS: {
    dataProtection: {
      cardholderDataProtection: true,
      encryptedTransmission: true,
      encryptedStorage: true,
      keyManagement: true
    },
    accessControl: {
      restrictedAccess: true,
      uniqueUserIds: true,
      strongAuthentication: true,
      regularAccessReview: true
    },
    networkSecurity: {
      firewallConfiguration: true,
      secureNetworks: true,
      vendorDefaults: true,
      wirelessSecurity: true
    },
    monitoring: {
      vulnerabilityManagement: true,
      securityTesting: true,
      logMonitoring: true,
      incidentResponse: true
    }
  }
} as const;

// =============================================================================
// SECURITY VALIDATION RULES
// =============================================================================

export const SECURITY_VALIDATION_RULES = {
  // Input validation
  INPUT_VALIDATION: {
    sqlInjectionPrevention: {
      parameterizedQueries: true,
      inputSanitization: true,
      whitelistValidation: true,
      escapeCharacters: true
    },
    xssPrevention: {
      outputEncoding: true,
      inputValidation: true,
      contentSecurityPolicy: true,
      httpOnlyCookies: true
    },
    commandInjectionPrevention: {
      inputValidation: true,
      commandWhitelisting: true,
      shellEscaping: true,
      principleOfLeastPrivilege: true
    },
    pathTraversalPrevention: {
      pathValidation: true,
      canonicalization: true,
      accessControls: true,
      jailDirectory: true
    }
  },

  // Authentication and authorization
  AUTH_VALIDATION: {
    authenticationRequirements: {
      strongPasswords: true,
      multiFactorAuthentication: true,
      sessionManagement: true,
      accountLockout: true
    },
    authorizationControls: {
      roleBasedAccess: true,
      attributeBasedAccess: true,
      principleOfLeastPrivilege: true,
      segregationOfDuties: true
    },
    sessionSecurity: {
      sessionTimeout: 1800, // 30 minutes
      secureTransmission: true,
      sessionRegeneration: true,
      concurrentSessionLimits: 3
    }
  },

  // Data protection
  DATA_PROTECTION: {
    encryptionRequirements: {
      dataAtRest: 'AES-256',
      dataInTransit: 'TLS-1.3',
      keyManagement: 'FIPS-140-2',
      cryptographicStandards: 'NIST'
    },
    accessLogging: {
      auditTrails: true,
      logIntegrity: true,
      logRetention: 365, // days
      realTimeMonitoring: true
    },
    dataClassification: {
      sensitivityLabels: true,
      handlingRequirements: true,
      retentionPolicies: true,
      disposalProcedures: true
    }
  },

  // Vulnerability assessment
  VULNERABILITY_ASSESSMENT: {
    codeAnalysis: {
      staticAnalysis: true,
      dynamicAnalysis: true,
      interactiveAnalysis: true,
      dependencyScanning: true
    },
    penetrationTesting: {
      regularTesting: true,
      thirdPartyTesting: true,
      remediationTracking: true,
      riskAssessment: true
    },
    securityUpdates: {
      patchManagement: true,
      vulnerabilityTracking: true,
      updateTimelines: 72, // hours for critical patches
      testingProcedures: true
    }
  }
} as const;

// =============================================================================
// BUSINESS LOGIC VALIDATION RULES
// =============================================================================

export const BUSINESS_LOGIC_VALIDATION_RULES = {
  // Rule consistency
  RULE_CONSISTENCY: {
    logicalConsistency: {
      noContradictions: true,
      transitiveConsistency: true,
      equivalenceConsistency: true,
      temporalConsistency: true
    },
    referentialIntegrity: {
      foreignKeyConstraints: true,
      cascadingUpdates: true,
      orphanPrevention: true,
      cyclicReferenceDetection: true
    },
    dataConsistency: {
      crossTableValidation: true,
      aggregateConsistency: true,
      derivedFieldValidation: true,
      calculationAccuracy: true
    }
  },

  // Business constraints
  BUSINESS_CONSTRAINTS: {
    temporalConstraints: {
      sequentialOrdering: true,
      timeWindowValidation: true,
      deadlineEnforcement: true,
      businessHoursRestriction: true
    },
    quantityConstraints: {
      minimumThresholds: true,
      maximumLimits: true,
      ratioValidation: true,
      percentageValidation: true
    },
    relationshipConstraints: {
      hierarchicalValidation: true,
      dependencyValidation: true,
      exclusivityRules: true,
      cardinalityConstraints: true
    }
  },

  // Process validation
  PROCESS_VALIDATION: {
    workflowValidation: {
      stateTransitions: true,
      approvalChains: true,
      escalationPaths: true,
      timeoutHandling: true
    },
    businessRuleCompliance: {
      policyAdherence: true,
      regulatoryCompliance: true,
      standardsCompliance: true,
      bestPracticeAlignment: true
    },
    exceptionHandling: {
      errorRecovery: true,
      rollbackProcedures: true,
      notificationRequirements: true,
      auditLogging: true
    }
  }
} as const;

// =============================================================================
// COMPATIBILITY VALIDATION RULES
// =============================================================================

export const COMPATIBILITY_VALIDATION_RULES = {
  // System compatibility
  SYSTEM_COMPATIBILITY: {
    databaseVersions: {
      supportedVersions: ['PostgreSQL 12+', 'MySQL 8+', 'SQL Server 2019+', 'Oracle 19c+'],
      deprecatedFeatures: [],
      migrationPaths: true,
      backwardCompatibility: true
    },
    operatingSystem: {
      supportedOS: ['Linux', 'Windows Server 2019+', 'macOS 10.15+'],
      architectures: ['x86_64', 'ARM64'],
      containerSupport: true,
      cloudCompatibility: true
    },
    runtimeEnvironments: {
      javaVersions: ['JDK 11+', 'JDK 17+'],
      pythonVersions: ['3.8+', '3.9+', '3.10+', '3.11+'],
      nodeVersions: ['16+', '18+', '20+'],
      dotnetVersions: ['.NET 6+', '.NET 7+', '.NET 8+']
    }
  },

  // API compatibility
  API_COMPATIBILITY: {
    versionCompatibility: {
      backwardCompatibility: true,
      forwardCompatibility: false,
      apiVersioning: 'semantic',
      deprecationNotice: 180 // days
    },
    dataFormatCompatibility: {
      jsonSupport: true,
      xmlSupport: true,
      csvSupport: true,
      binaryFormats: ['protobuf', 'avro']
    },
    protocolCompatibility: {
      httpVersions: ['HTTP/1.1', 'HTTP/2', 'HTTP/3'],
      tlsVersions: ['TLS 1.2', 'TLS 1.3'],
      webSocketSupport: true,
      grpcSupport: true
    }
  },

  // Integration compatibility
  INTEGRATION_COMPATIBILITY: {
    messageQueues: {
      supportedQueues: ['RabbitMQ', 'Apache Kafka', 'AWS SQS', 'Azure Service Bus'],
      protocolSupport: ['AMQP', 'MQTT', 'STOMP'],
      messageFormats: ['JSON', 'XML', 'Avro', 'Protobuf'],
      deliveryGuarantees: ['at-least-once', 'exactly-once']
    },
    eventStreaming: {
      platforms: ['Apache Kafka', 'AWS Kinesis', 'Azure Event Hubs'],
      serialization: ['JSON', 'Avro', 'Protobuf'],
      schemaEvolution: true,
      eventSourcing: true
    },
    caching: {
      cacheProviders: ['Redis', 'Memcached', 'Hazelcast'],
      distributedCaching: true,
      cacheEviction: ['LRU', 'LFU', 'TTL'],
      cachePatterns: ['cache-aside', 'write-through', 'write-behind']
    }
  }
} as const;

// =============================================================================
// DATA TYPE VALIDATION RULES
// =============================================================================

export const DATA_TYPE_VALIDATION_RULES = {
  // Primitive types
  PRIMITIVE_TYPES: {
    string: {
      maxLength: 10000,
      minLength: 0,
      encoding: 'UTF-8',
      allowedCharsets: ['ASCII', 'UTF-8', 'UTF-16'],
      trimWhitespace: true,
      normalizeCase: false
    },
    number: {
      maxValue: Number.MAX_SAFE_INTEGER,
      minValue: Number.MIN_SAFE_INTEGER,
      precision: 15,
      scale: 4,
      allowInfinity: false,
      allowNaN: false
    },
    boolean: {
      strictValidation: true,
      acceptableValues: [true, false, 'true', 'false', '1', '0'],
      caseSensitive: false
    },
    date: {
      formats: ['ISO8601', 'RFC3339', 'YYYY-MM-DD', 'MM/DD/YYYY'],
      timeZoneHandling: 'UTC',
      rangeValidation: true,
      futureDate: true,
      pastDate: true
    }
  },

  // Complex types
  COMPLEX_TYPES: {
    array: {
      maxLength: 10000,
      minLength: 0,
      homogeneousTypes: false,
      allowNested: true,
      maxDepth: 10,
      uniqueElements: false
    },
    object: {
      maxProperties: 1000,
      allowAdditionalProperties: true,
      requireRequired: true,
      allowNull: true,
      strictMode: false,
      circularReferences: false
    },
    enum: {
      strictValidation: true,
      caseSensitive: true,
      allowCustomValues: false,
      extensible: false
    }
  },

  // Format validation
  FORMAT_VALIDATION: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254,
      domainValidation: true,
      mxRecordCheck: false
    },
    phone: {
      patterns: [
        /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US
        /^\+?44[1-9]\d{8,9}$/, // UK
        /^\+?33[1-9]\d{8}$/ // France
      ],
      internationalization: true,
      countryCodeRequired: false
    },
    url: {
      protocols: ['http', 'https', 'ftp', 'ftps'],
      maxLength: 2048,
      domainValidation: true,
      pathValidation: true,
      queryValidation: true
    },
    ip: {
      ipv4: true,
      ipv6: true,
      cidrNotation: true,
      privateRanges: true,
      loopbackAddresses: true
    }
  }
} as const;

// =============================================================================
// RANGE VALIDATION RULES
// =============================================================================

export const RANGE_VALIDATION_RULES = {
  // Numeric ranges
  NUMERIC_RANGES: {
    percentage: {
      min: 0,
      max: 100,
      allowDecimals: true,
      precision: 2
    },
    currency: {
      min: 0,
      max: 999999999.99,
      currency: 'USD',
      precision: 2,
      allowNegative: false
    },
    age: {
      min: 0,
      max: 150,
      allowDecimals: false,
      unit: 'years'
    },
    score: {
      min: 0,
      max: 100,
      allowDecimals: true,
      precision: 1
    }
  },

  // Date ranges
  DATE_RANGES: {
    birthDate: {
      earliest: '1900-01-01',
      latest: 'today',
      format: 'YYYY-MM-DD'
    },
    businessDate: {
      earliest: '1970-01-01',
      latest: 'today + 10 years',
      businessDaysOnly: false
    },
    auditDate: {
      earliest: 'today - 7 years',
      latest: 'today',
      retentionPeriod: '7 years'
    }
  },

  // String length ranges
  STRING_RANGES: {
    shortText: {
      min: 1,
      max: 50,
      trimWhitespace: true
    },
    mediumText: {
      min: 1,
      max: 500,
      trimWhitespace: true
    },
    longText: {
      min: 1,
      max: 10000,
      trimWhitespace: true
    },
    description: {
      min: 10,
      max: 2000,
      trimWhitespace: true
    }
  },

  // Collection size ranges
  COLLECTION_RANGES: {
    smallCollection: {
      min: 0,
      max: 100
    },
    mediumCollection: {
      min: 0,
      max: 1000
    },
    largeCollection: {
      min: 0,
      max: 10000
    },
    pagination: {
      pageSize: {
        min: 1,
        max: 100,
        default: 25
      },
      pageNumber: {
        min: 1,
        max: 1000000
      }
    }
  }
} as const;

// =============================================================================
// CUSTOM VALIDATION RULES
// =============================================================================

export const CUSTOM_VALIDATION_RULES = {
  // Domain-specific validation
  DOMAIN_SPECIFIC: {
    // Financial domain
    financial: {
      accountNumber: {
        pattern: /^[0-9]{8,12}$/,
        checksumValidation: true,
        luhnAlgorithm: true
      },
      routingNumber: {
        pattern: /^[0-9]{9}$/,
        checksumValidation: true,
        abaValidation: true
      },
      creditCard: {
        patterns: {
          visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
          mastercard: /^5[1-5][0-9]{14}$/,
          amex: /^3[47][0-9]{13}$/,
          discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
        },
        luhnValidation: true,
        expirationValidation: true
      }
    },

    // Healthcare domain
    healthcare: {
      npi: {
        pattern: /^[0-9]{10}$/,
        checksumValidation: true,
        luhnAlgorithm: true
      },
      icd10: {
        pattern: /^[A-Z][0-9]{2}(\.[A-Z0-9]{1,4})?$/,
        codeValidation: true,
        versionValidation: true
      },
      hipaaId: {
        pattern: /^[0-9A-Z]{8,15}$/,
        checksumValidation: true,
        uniquenessValidation: true
      }
    },

    // Government domain
    government: {
      ssn: {
        pattern: /^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/,
        validationRules: [
          'no-sequential-numbers',
          'no-all-zeros',
          'valid-area-number'
        ]
      },
      ein: {
        pattern: /^[0-9]{2}-?[0-9]{7}$/,
        prefixValidation: true,
        checksumValidation: false
      }
    }
  },

  // Industry-specific validation
  INDUSTRY_SPECIFIC: {
    // Retail industry
    retail: {
      upc: {
        pattern: /^[0-9]{12}$/,
        checksumValidation: true,
        gs1Validation: true
      },
      sku: {
        pattern: /^[A-Z0-9]{6,20}$/,
        uniquenessValidation: true,
        hierarchicalValidation: true
      }
    },

    // Manufacturing industry
    manufacturing: {
      partNumber: {
        pattern: /^[A-Z0-9\-]{6,25}$/,
        revisionValidation: true,
        bomValidation: true
      },
      serialNumber: {
        pattern: /^[A-Z0-9]{8,20}$/,
        uniquenessValidation: true,
        traceabilityValidation: true
      }
    },

    // Telecommunications industry
    telecommunications: {
      phoneNumber: {
        e164Format: true,
        countryCodeValidation: true,
        carrierValidation: false
      },
      imei: {
        pattern: /^[0-9]{15}$/,
        checksumValidation: true,
        tacValidation: true
      }
    }
  }
} as const;

// =============================================================================
// VALIDATION CONFIGURATION PROFILES
// =============================================================================

export const VALIDATION_PROFILES = {
  // Strict validation profile
  STRICT: {
    syntaxValidation: 'comprehensive',
    semanticValidation: 'strict',
    performanceValidation: 'strict',
    complianceValidation: 'full',
    securityValidation: 'maximum',
    businessLogicValidation: 'comprehensive',
    compatibilityValidation: 'strict',
    dataTypeValidation: 'strict',
    rangeValidation: 'strict',
    customValidation: 'enabled',
    errorTolerance: 'zero',
    warningEscalation: true
  },

  // Standard validation profile
  STANDARD: {
    syntaxValidation: 'standard',
    semanticValidation: 'standard',
    performanceValidation: 'standard',
    complianceValidation: 'required',
    securityValidation: 'standard',
    businessLogicValidation: 'standard',
    compatibilityValidation: 'standard',
    dataTypeValidation: 'standard',
    rangeValidation: 'standard',
    customValidation: 'enabled',
    errorTolerance: 'low',
    warningEscalation: false
  },

  // Lenient validation profile
  LENIENT: {
    syntaxValidation: 'basic',
    semanticValidation: 'basic',
    performanceValidation: 'basic',
    complianceValidation: 'minimal',
    securityValidation: 'basic',
    businessLogicValidation: 'basic',
    compatibilityValidation: 'basic',
    dataTypeValidation: 'basic',
    rangeValidation: 'basic',
    customValidation: 'optional',
    errorTolerance: 'medium',
    warningEscalation: false
  },

  // Development validation profile
  DEVELOPMENT: {
    syntaxValidation: 'comprehensive',
    semanticValidation: 'standard',
    performanceValidation: 'lenient',
    complianceValidation: 'basic',
    securityValidation: 'standard',
    businessLogicValidation: 'standard',
    compatibilityValidation: 'lenient',
    dataTypeValidation: 'standard',
    rangeValidation: 'standard',
    customValidation: 'enabled',
    errorTolerance: 'medium',
    warningEscalation: false,
    debugMode: true,
    verboseOutput: true
  }
} as const;

// =============================================================================
// EXPORT ALL VALIDATION RULES
// =============================================================================

export const VALIDATION_RULES = {
  SYNTAX: SYNTAX_VALIDATION_RULES,
  SEMANTIC: SEMANTIC_VALIDATION_RULES,
  PERFORMANCE: PERFORMANCE_VALIDATION_RULES,
  COMPLIANCE: COMPLIANCE_VALIDATION_RULES,
  SECURITY: SECURITY_VALIDATION_RULES,
  BUSINESS_LOGIC: BUSINESS_LOGIC_VALIDATION_RULES,
  COMPATIBILITY: COMPATIBILITY_VALIDATION_RULES,
  DATA_TYPE: DATA_TYPE_VALIDATION_RULES,
  RANGE: RANGE_VALIDATION_RULES,
  CUSTOM: CUSTOM_VALIDATION_RULES,
  PROFILES: VALIDATION_PROFILES
} as const;

// Export individual rule groups
export {
  SYNTAX_VALIDATION_RULES,
  SEMANTIC_VALIDATION_RULES,
  PERFORMANCE_VALIDATION_RULES,
  COMPLIANCE_VALIDATION_RULES,
  SECURITY_VALIDATION_RULES,
  BUSINESS_LOGIC_VALIDATION_RULES,
  COMPATIBILITY_VALIDATION_RULES,
  DATA_TYPE_VALIDATION_RULES,
  RANGE_VALIDATION_RULES,
  CUSTOM_VALIDATION_RULES,
  VALIDATION_PROFILES
};

// Default export
export default VALIDATION_RULES;