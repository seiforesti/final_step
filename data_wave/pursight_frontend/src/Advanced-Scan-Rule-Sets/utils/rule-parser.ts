import { 
  ScanRuleDefinition, 
  RulePattern, 
  RuleCondition, 
  RuleAction, 
  RuleContext, 
  PatternType, 
  ConditionOperator, 
  ActionType,
  ParseResult,
  ParseError,
  ValidationResult,
  RuleMetadata,
  RuleParameterDefinition,
  RuleExecutionContext
} from '../types/scan-rules.types';

// Parser configuration
interface ParserConfig {
  enableStrictMode: boolean;
  allowDeprecatedSyntax: boolean;
  maxComplexity: number;
  maxNestingDepth: number;
  enableOptimizations: boolean;
  validateSemantics: boolean;
}

// Default parser configuration
const DEFAULT_CONFIG: ParserConfig = {
  enableStrictMode: false,
  allowDeprecatedSyntax: true,
  maxComplexity: 1000,
  maxNestingDepth: 10,
  enableOptimizations: true,
  validateSemantics: true
};

// Token types for lexical analysis
enum TokenType {
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  REGEX = 'REGEX',
  OPERATOR = 'OPERATOR',
  KEYWORD = 'KEYWORD',
  DELIMITER = 'DELIMITER',
  WHITESPACE = 'WHITESPACE',
  COMMENT = 'COMMENT',
  NEWLINE = 'NEWLINE',
  EOF = 'EOF'
}

// Token interface
interface Token {
  type: TokenType;
  value: string;
  position: {
    line: number;
    column: number;
    offset: number;
  };
  length: number;
}

// Abstract Syntax Tree node types
interface ASTNode {
  type: string;
  position: {
    start: number;
    end: number;
    line: number;
    column: number;
  };
  metadata?: any;
}

interface RuleNode extends ASTNode {
  type: 'Rule';
  name: string;
  description?: string;
  metadata: RuleMetadata;
  patterns: PatternNode[];
  conditions: ConditionNode[];
  actions: ActionNode[];
  parameters: ParameterNode[];
}

interface PatternNode extends ASTNode {
  type: 'Pattern';
  patternType: PatternType;
  expression: string;
  flags?: string[];
  metadata?: any;
}

interface ConditionNode extends ASTNode {
  type: 'Condition';
  operator: ConditionOperator;
  left: ExpressionNode;
  right: ExpressionNode;
  negated?: boolean;
}

interface ActionNode extends ASTNode {
  type: 'Action';
  actionType: ActionType;
  parameters: { [key: string]: any };
  condition?: ConditionNode;
}

interface ParameterNode extends ASTNode {
  type: 'Parameter';
  name: string;
  dataType: string;
  defaultValue?: any;
  required: boolean;
  validation?: ValidationRule[];
}

interface ExpressionNode extends ASTNode {
  type: 'Expression';
  expression: string;
  dataType?: string;
}

interface ValidationRule {
  type: string;
  parameters: { [key: string]: any };
  message?: string;
}

// Lexer class for tokenization
class RuleLexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    this.tokens = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;

    while (this.position < this.input.length) {
      this.scanToken();
    }

    // Add EOF token
    this.addToken(TokenType.EOF, '');

    return this.tokens;
  }

  private scanToken(): void {
    const char = this.currentChar();

    // Skip whitespace
    if (this.isWhitespace(char)) {
      this.scanWhitespace();
      return;
    }

    // Handle newlines
    if (char === '\n') {
      this.addToken(TokenType.NEWLINE, char);
      this.advance();
      this.line++;
      this.column = 1;
      return;
    }

    // Handle comments
    if (char === '/' && this.peek() === '/') {
      this.scanLineComment();
      return;
    }

    if (char === '/' && this.peek() === '*') {
      this.scanBlockComment();
      return;
    }

    // Handle strings
    if (char === '"' || char === "'") {
      this.scanString(char);
      return;
    }

    // Handle regex literals
    if (char === '/' && this.isRegexContext()) {
      this.scanRegex();
      return;
    }

    // Handle numbers
    if (this.isDigit(char)) {
      this.scanNumber();
      return;
    }

    // Handle identifiers and keywords
    if (this.isAlpha(char) || char === '_') {
      this.scanIdentifier();
      return;
    }

    // Handle operators and delimiters
    if (this.isOperatorChar(char)) {
      this.scanOperator();
      return;
    }

    // Handle delimiters
    if (this.isDelimiter(char)) {
      this.addToken(TokenType.DELIMITER, char);
      this.advance();
      return;
    }

    // Unknown character - could be an error
    this.advance();
  }

  private scanWhitespace(): void {
    const start = this.position;
    while (this.position < this.input.length && this.isWhitespace(this.currentChar())) {
      this.advance();
    }
    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.WHITESPACE, value);
  }

  private scanLineComment(): void {
    const start = this.position;
    // Skip '//'
    this.advance();
    this.advance();
    
    while (this.position < this.input.length && this.currentChar() !== '\n') {
      this.advance();
    }
    
    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.COMMENT, value);
  }

  private scanBlockComment(): void {
    const start = this.position;
    // Skip '/*'
    this.advance();
    this.advance();
    
    while (this.position < this.input.length - 1) {
      if (this.currentChar() === '*' && this.peek() === '/') {
        this.advance();
        this.advance();
        break;
      }
      if (this.currentChar() === '\n') {
        this.line++;
        this.column = 1;
      }
      this.advance();
    }
    
    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.COMMENT, value);
  }

  private scanString(quote: string): void {
    const start = this.position;
    this.advance(); // Skip opening quote
    
    while (this.position < this.input.length && this.currentChar() !== quote) {
      if (this.currentChar() === '\\') {
        this.advance(); // Skip escape character
        if (this.position < this.input.length) {
          this.advance(); // Skip escaped character
        }
      } else {
        this.advance();
      }
    }
    
    if (this.position < this.input.length) {
      this.advance(); // Skip closing quote
    }
    
    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.STRING, value);
  }

  private scanRegex(): void {
    const start = this.position;
    this.advance(); // Skip opening '/'
    
    while (this.position < this.input.length && this.currentChar() !== '/') {
      if (this.currentChar() === '\\') {
        this.advance(); // Skip escape character
        if (this.position < this.input.length) {
          this.advance(); // Skip escaped character
        }
      } else {
        this.advance();
      }
    }
    
    if (this.position < this.input.length) {
      this.advance(); // Skip closing '/'
    }
    
    // Scan regex flags
    while (this.position < this.input.length && this.isAlpha(this.currentChar())) {
      this.advance();
    }
    
    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.REGEX, value);
  }

  private scanNumber(): void {
    const start = this.position;
    
    while (this.position < this.input.length && this.isDigit(this.currentChar())) {
      this.advance();
    }
    
    // Handle decimal numbers
    if (this.position < this.input.length && this.currentChar() === '.' && 
        this.position + 1 < this.input.length && this.isDigit(this.input[this.position + 1])) {
      this.advance(); // Skip '.'
      while (this.position < this.input.length && this.isDigit(this.currentChar())) {
        this.advance();
      }
    }
    
    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.NUMBER, value);
  }

  private scanIdentifier(): void {
    const start = this.position;
    
    while (this.position < this.input.length && 
           (this.isAlphaNumeric(this.currentChar()) || this.currentChar() === '_')) {
      this.advance();
    }
    
    const value = this.input.substring(start, this.position);
    const tokenType = this.isKeyword(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
    this.addToken(tokenType, value);
  }

  private scanOperator(): void {
    const start = this.position;
    const char = this.currentChar();
    const nextChar = this.peek();
    
    // Two-character operators
    const twoChar = char + nextChar;
    if (['==', '!=', '<=', '>=', '&&', '||', '<<', '>>', '+=', '-=', '*=', '/='].includes(twoChar)) {
      this.advance();
      this.advance();
      this.addToken(TokenType.OPERATOR, twoChar);
      return;
    }
    
    // Single-character operators
    if (this.isOperatorChar(char)) {
      this.advance();
      this.addToken(TokenType.OPERATOR, char);
    }
  }

  private currentChar(): string {
    if (this.position >= this.input.length) return '\0';
    return this.input[this.position];
  }

  private peek(offset: number = 1): string {
    const pos = this.position + offset;
    if (pos >= this.input.length) return '\0';
    return this.input[pos];
  }

  private advance(): void {
    if (this.position < this.input.length) {
      this.position++;
      this.column++;
    }
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      position: {
        line: this.line,
        column: this.column - value.length,
        offset: this.position - value.length
      },
      length: value.length
    });
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\r';
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private isOperatorChar(char: string): boolean {
    return '+-*/%=<>!&|^~'.includes(char);
  }

  private isDelimiter(char: string): boolean {
    return '(){}[],:;'.includes(char);
  }

  private isKeyword(value: string): boolean {
    const keywords = [
      'rule', 'pattern', 'condition', 'action', 'if', 'then', 'else', 'and', 'or', 'not',
      'match', 'contains', 'equals', 'regex', 'length', 'count', 'any', 'all', 'none',
      'true', 'false', 'null', 'undefined', 'string', 'number', 'boolean', 'array', 'object'
    ];
    return keywords.includes(value.toLowerCase());
  }

  private isRegexContext(): boolean {
    // Simple heuristic to determine if '/' starts a regex
    // This is a simplified implementation
    return true;
  }
}

// Parser class for syntax analysis
class RuleParser {
  private tokens: Token[];
  private position: number = 0;
  private config: ParserConfig;
  private errors: ParseError[] = [];

  constructor(tokens: Token[], config: ParserConfig = DEFAULT_CONFIG) {
    this.tokens = tokens.filter(token => 
      token.type !== TokenType.WHITESPACE && 
      token.type !== TokenType.COMMENT
    );
    this.config = config;
  }

  parse(): ParseResult {
    this.position = 0;
    this.errors = [];

    try {
      const rules = this.parseRules();
      return {
        success: this.errors.length === 0,
        rules,
        errors: this.errors,
        metadata: {
          complexity: this.calculateComplexity(rules),
          nestingDepth: this.calculateNestingDepth(rules),
          tokenCount: this.tokens.length
        }
      };
    } catch (error) {
      this.addError(`Unexpected error during parsing: ${error.message}`);
      return {
        success: false,
        rules: [],
        errors: this.errors,
        metadata: {}
      };
    }
  }

  private parseRules(): RuleNode[] {
    const rules: RuleNode[] = [];

    while (!this.isAtEnd()) {
      const rule = this.parseRule();
      if (rule) {
        rules.push(rule);
      } else {
        // Skip to next rule or end
        this.skipToNextRule();
      }
    }

    return rules;
  }

  private parseRule(): RuleNode | null {
    if (!this.match(TokenType.KEYWORD, 'rule')) {
      this.addError('Expected "rule" keyword');
      return null;
    }

    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected rule name');
    if (!nameToken) return null;

    const rule: RuleNode = {
      type: 'Rule',
      name: nameToken.value,
      position: {
        start: nameToken.position.offset,
        end: nameToken.position.offset + nameToken.length,
        line: nameToken.position.line,
        column: nameToken.position.column
      },
      metadata: {
        id: nameToken.value,
        version: '1.0.0',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      patterns: [],
      conditions: [],
      actions: [],
      parameters: []
    };

    // Parse optional description
    if (this.check(TokenType.STRING)) {
      rule.description = this.advance().value.slice(1, -1); // Remove quotes
    }

    // Parse rule body
    if (!this.match(TokenType.DELIMITER, '{')) {
      this.addError('Expected "{" to start rule body');
      return null;
    }

    while (!this.check(TokenType.DELIMITER, '}') && !this.isAtEnd()) {
      if (this.match(TokenType.KEYWORD, 'pattern')) {
        const pattern = this.parsePattern();
        if (pattern) rule.patterns.push(pattern);
      } else if (this.match(TokenType.KEYWORD, 'condition')) {
        const condition = this.parseCondition();
        if (condition) rule.conditions.push(condition);
      } else if (this.match(TokenType.KEYWORD, 'action')) {
        const action = this.parseAction();
        if (action) rule.actions.push(action);
      } else if (this.match(TokenType.KEYWORD, 'parameter')) {
        const parameter = this.parseParameter();
        if (parameter) rule.parameters.push(parameter);
      } else {
        this.addError(`Unexpected token: ${this.peek()?.value}`);
        this.advance();
      }
    }

    if (!this.match(TokenType.DELIMITER, '}')) {
      this.addError('Expected "}" to end rule body');
    }

    return rule;
  }

  private parsePattern(): PatternNode | null {
    const start = this.previous();
    
    const typeToken = this.consume(TokenType.IDENTIFIER, 'Expected pattern type');
    if (!typeToken) return null;

    const expressionToken = this.consume(TokenType.STRING, 'Expected pattern expression');
    if (!expressionToken) return null;

    const pattern: PatternNode = {
      type: 'Pattern',
      patternType: typeToken.value as PatternType,
      expression: expressionToken.value.slice(1, -1), // Remove quotes
      position: {
        start: start.position.offset,
        end: expressionToken.position.offset + expressionToken.length,
        line: start.position.line,
        column: start.position.column
      }
    };

    // Parse optional flags
    if (this.match(TokenType.KEYWORD, 'flags')) {
      pattern.flags = [];
      if (this.check(TokenType.STRING)) {
        const flagsStr = this.advance().value.slice(1, -1);
        pattern.flags = flagsStr.split(',').map(f => f.trim());
      }
    }

    this.consumeStatementEnd();
    return pattern;
  }

  private parseCondition(): ConditionNode | null {
    const start = this.previous();
    
    const left = this.parseExpression();
    if (!left) return null;

    const operatorToken = this.consume(TokenType.OPERATOR, 'Expected condition operator');
    if (!operatorToken) return null;

    const right = this.parseExpression();
    if (!right) return null;

    const condition: ConditionNode = {
      type: 'Condition',
      operator: operatorToken.value as ConditionOperator,
      left,
      right,
      position: {
        start: start.position.offset,
        end: right.position.end,
        line: start.position.line,
        column: start.position.column
      }
    };

    this.consumeStatementEnd();
    return condition;
  }

  private parseAction(): ActionNode | null {
    const start = this.previous();
    
    const typeToken = this.consume(TokenType.IDENTIFIER, 'Expected action type');
    if (!typeToken) return null;

    const action: ActionNode = {
      type: 'Action',
      actionType: typeToken.value as ActionType,
      parameters: {},
      position: {
        start: start.position.offset,
        end: typeToken.position.offset + typeToken.length,
        line: start.position.line,
        column: start.position.column
      }
    };

    // Parse optional parameters
    if (this.match(TokenType.DELIMITER, '(')) {
      action.parameters = this.parseActionParameters();
      if (!this.match(TokenType.DELIMITER, ')')) {
        this.addError('Expected ")" after action parameters');
      }
    }

    this.consumeStatementEnd();
    return action;
  }

  private parseParameter(): ParameterNode | null {
    const start = this.previous();
    
    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected parameter name');
    if (!nameToken) return null;

    const typeToken = this.consume(TokenType.IDENTIFIER, 'Expected parameter type');
    if (!typeToken) return null;

    const parameter: ParameterNode = {
      type: 'Parameter',
      name: nameToken.value,
      dataType: typeToken.value,
      required: true,
      position: {
        start: start.position.offset,
        end: typeToken.position.offset + typeToken.length,
        line: start.position.line,
        column: start.position.column
      }
    };

    // Parse optional default value
    if (this.match(TokenType.OPERATOR, '=')) {
      parameter.defaultValue = this.parseValue();
      parameter.required = false;
    }

    this.consumeStatementEnd();
    return parameter;
  }

  private parseExpression(): ExpressionNode | null {
    const start = this.peek();
    if (!start) return null;

    let expression = '';
    const startPos = this.position;

    // Simple expression parsing - collect tokens until operator or delimiter
    while (!this.isAtEnd() && 
           !this.check(TokenType.OPERATOR) && 
           !this.check(TokenType.DELIMITER, ';') &&
           !this.check(TokenType.DELIMITER, '}') &&
           !this.check(TokenType.DELIMITER, ')')) {
      expression += this.advance().value + ' ';
    }

    if (expression.trim() === '') {
      this.addError('Expected expression');
      return null;
    }

    const end = this.previous();
    return {
      type: 'Expression',
      expression: expression.trim(),
      position: {
        start: start.position.offset,
        end: end.position.offset + end.length,
        line: start.position.line,
        column: start.position.column
      }
    };
  }

  private parseActionParameters(): { [key: string]: any } {
    const parameters: { [key: string]: any } = {};

    while (!this.check(TokenType.DELIMITER, ')') && !this.isAtEnd()) {
      const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected parameter name');
      if (!nameToken) break;

      if (!this.match(TokenType.DELIMITER, ':')) {
        this.addError('Expected ":" after parameter name');
        break;
      }

      const value = this.parseValue();
      parameters[nameToken.value] = value;

      if (!this.match(TokenType.DELIMITER, ',')) {
        break;
      }
    }

    return parameters;
  }

  private parseValue(): any {
    const token = this.advance();
    
    switch (token.type) {
      case TokenType.STRING:
        return token.value.slice(1, -1); // Remove quotes
      case TokenType.NUMBER:
        return parseFloat(token.value);
      case TokenType.KEYWORD:
        if (token.value === 'true') return true;
        if (token.value === 'false') return false;
        if (token.value === 'null') return null;
        return token.value;
      default:
        return token.value;
    }
  }

  private consumeStatementEnd(): void {
    this.match(TokenType.DELIMITER, ';');
  }

  private skipToNextRule(): void {
    while (!this.isAtEnd() && !this.check(TokenType.KEYWORD, 'rule')) {
      this.advance();
    }
  }

  private calculateComplexity(rules: RuleNode[]): number {
    let complexity = 0;
    
    for (const rule of rules) {
      complexity += rule.patterns.length * 2;
      complexity += rule.conditions.length * 3;
      complexity += rule.actions.length * 1;
      complexity += rule.parameters.length * 1;
    }
    
    return complexity;
  }

  private calculateNestingDepth(rules: RuleNode[]): number {
    // Simplified nesting depth calculation
    return Math.max(1, ...rules.map(rule => 
      Math.max(rule.conditions.length, rule.patterns.length, rule.actions.length)
    ));
  }

  // Token manipulation methods
  private match(type: TokenType, value?: string): boolean {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private check(type: TokenType, value?: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token?.type === type && (value === undefined || token.value === value);
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.position++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length || this.peek()?.type === TokenType.EOF;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private previous(): Token {
    return this.tokens[this.position - 1];
  }

  private consume(type: TokenType, message: string): Token | null {
    if (this.check(type)) {
      return this.advance();
    }
    
    this.addError(message);
    return null;
  }

  private addError(message: string): void {
    const token = this.peek();
    this.errors.push({
      message,
      position: token ? {
        line: token.position.line,
        column: token.position.column,
        offset: token.position.offset
      } : { line: 0, column: 0, offset: 0 },
      type: 'SyntaxError'
    });
  }
}

// Main parser functions
export function parseRule(ruleText: string, config?: Partial<ParserConfig>): ParseResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    const lexer = new RuleLexer(ruleText);
    const tokens = lexer.tokenize();
    
    const parser = new RuleParser(tokens, mergedConfig);
    return parser.parse();
  } catch (error) {
    return {
      success: false,
      rules: [],
      errors: [{
        message: `Parse error: ${error.message}`,
        position: { line: 0, column: 0, offset: 0 },
        type: 'ParseError'
      }],
      metadata: {}
    };
  }
}

export function validateRuleSyntax(ruleText: string): ValidationResult {
  const result = parseRule(ruleText, { validateSemantics: true });
  
  return {
    isValid: result.success,
    errors: result.errors,
    warnings: [],
    suggestions: []
  };
}

export function optimizeRule(rule: ScanRuleDefinition): ScanRuleDefinition {
  // Rule optimization logic
  const optimized = { ...rule };
  
  // Optimize patterns
  if (optimized.patterns) {
    optimized.patterns = optimized.patterns.map(pattern => ({
      ...pattern,
      // Add optimization flags or simplified expressions
      optimized: true
    }));
  }
  
  return optimized;
}

export function convertRuleToString(rule: ScanRuleDefinition): string {
  let result = `rule ${rule.name}`;
  
  if (rule.description) {
    result += ` "${rule.description}"`;
  }
  
  result += ' {\n';
  
  // Add patterns
  if (rule.patterns) {
    for (const pattern of rule.patterns) {
      result += `  pattern ${pattern.type} "${pattern.expression}"`;
      if (pattern.flags && pattern.flags.length > 0) {
        result += ` flags "${pattern.flags.join(',')}"`;
      }
      result += ';\n';
    }
  }
  
  // Add conditions
  if (rule.conditions) {
    for (const condition of rule.conditions) {
      result += `  condition ${condition.field} ${condition.operator} ${condition.value};\n`;
    }
  }
  
  // Add actions
  if (rule.actions) {
    for (const action of rule.actions) {
      result += `  action ${action.type}`;
      if (action.parameters && Object.keys(action.parameters).length > 0) {
        result += '(';
        const params = Object.entries(action.parameters)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join(', ');
        result += params;
        result += ')';
      }
      result += ';\n';
    }
  }
  
  result += '}\n';
  return result;
}

export function extractRuleMetadata(ruleText: string): RuleMetadata {
  const parseResult = parseRule(ruleText);
  
  if (parseResult.success && parseResult.rules.length > 0) {
    const rule = parseResult.rules[0];
    return {
      id: rule.name,
      name: rule.name,
      description: rule.description,
      version: '1.0.0',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      complexity: parseResult.metadata.complexity || 0,
      patterns: rule.patterns.length,
      conditions: rule.conditions.length,
      actions: rule.actions.length
    };
  }
  
  return {
    id: 'unknown',
    name: 'Unknown Rule',
    version: '1.0.0',
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    complexity: 0,
    patterns: 0,
    conditions: 0,
    actions: 0
  };
}

export function formatRule(ruleText: string, options?: { 
  indent?: string; 
  maxLineLength?: number; 
  sortSections?: boolean; 
}): string {
  const { indent = '  ', maxLineLength = 80, sortSections = false } = options || {};
  
  const parseResult = parseRule(ruleText);
  
  if (!parseResult.success || parseResult.rules.length === 0) {
    return ruleText; // Return original if parsing failed
  }
  
  const rule = parseResult.rules[0];
  return convertRuleToString(rule as any);
}

export { RuleLexer, RuleParser, TokenType };
export type { Token, ASTNode, RuleNode, PatternNode, ConditionNode, ActionNode, ParserConfig };