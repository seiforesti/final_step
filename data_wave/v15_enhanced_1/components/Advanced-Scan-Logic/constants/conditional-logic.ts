// Advanced Conditional Logic Constants - aligned to backend
// Maps to: /api/v1/workflow/conditional-logic

export const LOGIC_OPERATORS = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  XOR: 'XOR',
  NAND: 'NAND',
  NOR: 'NOR',
  IMPLIES: 'IMPLIES',
  EQUIVALENT: 'EQUIVALENT'
} as const;

export const COMPARISON_OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_EQUAL: 'greater_equal',
  LESS_EQUAL: 'less_equal',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  REGEX_MATCH: 'regex_match',
  IN_RANGE: 'in_range',
  BETWEEN: 'between',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null',
  IS_EMPTY: 'is_empty',
  IS_NOT_EMPTY: 'is_not_empty'
} as const;

export const CONDITIONAL_FUNCTIONS = {
  IF_THEN_ELSE: 'if_then_else',
  SWITCH_CASE: 'switch_case',
  COALESCE: 'coalesce',
  NULLIF: 'nullif',
  CASE_WHEN: 'case_when',
  DECODE: 'decode',
  CHOOSE: 'choose',
  IIF: 'iif'
} as const;

export const FIELD_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  ARRAY: 'array',
  OBJECT: 'object',
  ENUM: 'enum',
  CUSTOM: 'custom'
} as const;

export const VALIDATION_RULES = {
  REQUIRED: 'required',
  MIN_LENGTH: 'min_length',
  MAX_LENGTH: 'max_length',
  MIN_VALUE: 'min_value',
  MAX_VALUE: 'max_value',
  PATTERN: 'pattern',
  FORMAT: 'format',
  CUSTOM: 'custom'
} as const;

export const PRIORITY_LEVELS = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  INFO: 5
} as const;

export const CONDITION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  TESTING: 'testing'
} as const;

export const LOGIC_COMPLEXITY = {
  SIMPLE: 'simple',
  MODERATE: 'moderate',
  COMPLEX: 'complex',
  VERY_COMPLEX: 'very_complex'
} as const;

export const EXECUTION_MODES = {
  SYNCHRONOUS: 'synchronous',
  ASYNCHRONOUS: 'asynchronous',
  BATCH: 'batch',
  STREAMING: 'streaming'
} as const;

export const CACHING_STRATEGIES = {
  NONE: 'none',
  MEMORY: 'memory',
  DISK: 'disk',
  DISTRIBUTED: 'distributed',
  INTELLIGENT: 'intelligent'
} as const;

export type LogicOperator = typeof LOGIC_OPERATORS[keyof typeof LOGIC_OPERATORS];
export type ComparisonOperator = typeof COMPARISON_OPERATORS[keyof typeof COMPARISON_OPERATORS];
export type ConditionalFunction = typeof CONDITIONAL_FUNCTIONS[keyof typeof CONDITIONAL_FUNCTIONS];
export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];
export type ValidationRule = typeof VALIDATION_RULES[keyof typeof VALIDATION_RULES];
export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];
export type ConditionStatus = typeof CONDITION_STATUS[keyof typeof CONDITION_STATUS];
export type LogicComplexity = typeof LOGIC_COMPLEXITY[keyof typeof LOGIC_COMPLEXITY];
export type ExecutionMode = typeof EXECUTION_MODES[keyof typeof EXECUTION_MODES];
export type CachingStrategy = typeof CACHING_STRATEGIES[keyof typeof CACHING_STRATEGIES];

// Additional missing constants for ConditionalLogicEngine
export const RULE_TEMPLATES = {
  IF_THEN: 'if_then',
  THRESHOLD: 'threshold',
  PATTERN: 'pattern',
  SEQUENCE: 'sequence',
  TIMEOUT: 'timeout',
  RETRY: 'retry',
  FALLBACK: 'fallback',
  CASCADE: 'cascade',
  PARALLEL: 'parallel',
  CONDITIONAL: 'conditional'
} as const;

export const DECISION_PATTERNS = {
  LINEAR: 'linear',
  BRANCHING: 'branching',
  LOOPING: 'looping',
  RECURSIVE: 'recursive',
  PARALLEL: 'parallel',
  SEQUENTIAL: 'sequential',
  CONDITIONAL: 'conditional',
  EXCEPTION_HANDLING: 'exception_handling'
} as const;

export const CONDITIONAL_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  DEFAULT_PRIORITY: 'medium',
  MAX_CONDITIONS: 100,
  MAX_NESTING_LEVEL: 10,
  DEFAULT_CACHE_TTL: 3600000,
  MAX_EXECUTION_TIME: 300000
} as const;

export const EXPRESSION_SYNTAX = {
  FIELD_SEPARATOR: '.',
  OPERATOR_SEPARATOR: ' ',
  VALUE_SEPARATOR: ',',
  GROUP_START: '(',
  GROUP_END: ')',
  FUNCTION_START: '{',
  FUNCTION_END: '}',
  ARRAY_START: '[',
  ARRAY_END: ']',
  QUOTE_CHAR: "'",
  ESCAPE_CHAR: '\\'
} as const;

export const RULE_VALIDATION_RULES = {
  MAX_CONDITIONS_PER_RULE: 50,
  MAX_NESTED_RULES: 5,
  MAX_FUNCTIONS_PER_RULE: 10,
  MAX_EXPRESSION_LENGTH: 1000,
  REQUIRED_FIELDS: ['conditions', 'action'],
  FORBIDDEN_CHARACTERS: ['<script>', 'javascript:', 'data:'],
  MAX_PRIORITY_LEVEL: 5,
  MIN_PRIORITY_LEVEL: 1
} as const;

export const CONDITIONAL_DEFAULTS = {
  DEFAULT_LOGICAL_OPERATOR: 'AND',
  DEFAULT_COMPARISON_OPERATOR: 'equals',
  DEFAULT_FIELD_TYPE: 'string',
  DEFAULT_PRIORITY: 'medium',
  DEFAULT_STATUS: 'active',
  DEFAULT_EXECUTION_MODE: 'synchronous',
  DEFAULT_CACHING_STRATEGY: 'memory',
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRY_COUNT: 3,
  DEFAULT_BATCH_SIZE: 100
} as const;

export type RuleTemplate = typeof RULE_TEMPLATES[keyof typeof RULE_TEMPLATES];
export type DecisionPattern = typeof DECISION_PATTERNS[keyof typeof DECISION_PATTERNS];
export type ConditionalConstant = typeof CONDITIONAL_CONSTANTS[keyof typeof CONDITIONAL_CONSTANTS];
export type ExpressionSyntax = typeof EXPRESSION_SYNTAX[keyof typeof EXPRESSION_SYNTAX];
export type RuleValidationRule = typeof RULE_VALIDATION_RULES[keyof typeof RULE_VALIDATION_RULES];
export type ConditionalDefault = typeof CONDITIONAL_DEFAULTS[keyof typeof CONDITIONAL_DEFAULTS];
