/**
 * Development utilities and helpers
 * Code generation, testing shortcuts, type safety
 *
 * @module lib/dev-utils
 */

/**
 * API request/response builder for easy testing
 */
export class MockRequestBuilder {
  private url: string;
  private method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
  private headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  private body?: any;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Set HTTP method
   */
  withMethod(method: 'GET' | 'POST' | 'PUT' | 'DELETE'): this {
    this.method = method;
    return this;
  }

  /**
   * Add header
   */
  withHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  /**
   * Set body
   */
  withBody(body: any): this {
    this.body = body;
    return this;
  }

  /**
   * Add authorization header
   */
  withAuth(token: string): this {
    this.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  /**
   * Build Request object
   */
  build(): Request {
    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body ? JSON.stringify(this.body) : undefined,
    });
  }
}

/**
 * Response assertion helper
 */
export class ResponseAssertions {
  constructor(private response: Response) {}

  /**
   * Assert status code
   */
  assertStatus(expected: number): this {
    if (this.response.status !== expected) {
      throw new Error(
        `Expected status ${expected}, got ${this.response.status}`
      );
    }
    return this;
  }

  /**
   * Assert successful response (2xx)
   */
  assertSuccess(): this {
    if (!this.response.ok) {
      throw new Error(
        `Expected successful response, got ${this.response.status}`
      );
    }
    return this;
  }

  /**
   * Assert JSON response
   */
  async assertJSON(): Promise<any> {
    const contentType = this.response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON response, got ${contentType}`);
    }
    return this.response.json();
  }

  /**
   * Assert header value
   */
  assertHeader(name: string, expected: string): this {
    const actual = this.response.headers.get(name);
    if (actual !== expected) {
      throw new Error(
        `Expected header ${name}=${expected}, got ${actual}`
      );
    }
    return this;
  }
}

/**
 * Generate TypeScript type from JSON sample
 */
export function generateTypeFromJson(name: string, sample: any): string {
  const lines: string[] = [`export interface ${name} {`];

  for (const [key, value] of Object.entries(sample)) {
    const type = typeof value === 'object' 
      ? value === null ? 'any' : 'object'
      : typeof value;
    
    lines.push(`  ${key}: ${type};`);
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate API route boilerplate
 */
export function generateAPIRoute(
  _name: string,
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE')[]
): string {
  const handlers = methods.map(method => {
    return `export async function ${method}(req: Request) {
  return withErrorHandler(async () => {
    // TODO: Implement ${method} handler
    return new Response('${method} handler', { status: 200 });
  });
}`;
  }).join('\n\n');

  return `import { withErrorHandler } from '@/lib/api-middleware';

${handlers}`;
}

/**
 * Generate test boilerplate
 */
export function generateTestBoilerplate(name: string): string {
  return `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ${name} } from '../../src/lib/${name}';

describe('${name}', () => {
  let instance: ${name};

  beforeEach(() => {
    instance = new ${name}();
  });

  it('should be created', () => {
    expect(instance).toBeDefined();
  });

  it('should have required methods', () => {
    // TODO: Add assertions
  });
});`;
}

/**
 * Code quality metrics calculator
 */
export class CodeMetrics {
  /**
   * Count lines of code (excluding comments and blanks)
   */
  static countLOC(code: string): number {
    return code
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith('//');
      }).length;
  }

  /**
   * Count TODO comments
   */
  static countTODOs(code: string): number {
    return (code.match(/TODO|FIXME|HACK/gi) || []).length;
  }

  /**
   * Estimate cyclomatic complexity (simple version)
   */
  static estimateComplexity(code: string): number {
    let complexity = 1;
    complexity += (code.match(/if\s*\(/gi) || []).length;
    complexity += (code.match(/else\s*if\s*\(/gi) || []).length;
    complexity += (code.match(/for\s*\(/gi) || []).length;
    complexity += (code.match(/while\s*\(/gi) || []).length;
    complexity += (code.match(/\?/g) || []).length; // Ternary operators
    complexity += (code.match(/catch\s*\(/gi) || []).length;
    return complexity;
  }

  /**
   * Calculate code duplication ratio (simple heuristic)
   */
  static estimateDuplication(code: string): number {
    const lines = code.split('\n');
    const hashes = new Set<string>();
    let duplicates = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 10) { // Only check meaningful lines
        if (hashes.has(trimmed)) {
          duplicates++;
        }
        hashes.add(trimmed);
      }
    }

    return (duplicates / lines.length) * 100;
  }
}

/**
 * Environment variable validator
 */
export class EnvValidator {
  private errors: string[] = [];

  /**
   * Require environment variable
   */
  require(name: string, defaultValue?: string): string {
    const value = process.env[name] || defaultValue;
    
    if (!value) {
      this.errors.push(`Missing required environment variable: ${name}`);
    }
    
    return value || '';
  }

  /**
   * Validate email format
   */
  requireEmail(name: string): string {
    const value = this.require(name);
    
    if (value && !value.includes('@')) {
      this.errors.push(`Invalid email for ${name}: ${value}`);
    }
    
    return value;
  }

  /**
   * Validate URL format
   */
  requireUrl(name: string): string {
    const value = this.require(name);
    
    if (value) {
      try {
        new URL(value);
      } catch {
        this.errors.push(`Invalid URL for ${name}: ${value}`);
      }
    }
    
    return value;
  }

  /**
   * Validate port number
   */
  requirePort(name: string): number {
    const value = this.require(name);
    const port = parseInt(value, 10);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      this.errors.push(`Invalid port for ${name}: ${value}`);
    }
    
    return port;
  }

  /**
   * Get all validation errors
   */
  getErrors(): string[] {
    return this.errors;
  }

  /**
   * Throw if any errors
   */
  validate(): void {
    if (this.errors.length > 0) {
      throw new Error(`Environment validation failed:\n${this.errors.join('\n')}`);
    }
  }
}

/**
 * Development logging helper
 */
export class DevLogger {
  static readonly colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  };

  /**
   * Success message
   */
  static success(message: string): void {
    console.log(`${this.colors.green}✓${this.colors.reset} ${message}`);
  }

  /**
   * Error message
   */
  static error(message: string, error?: Error): void {
    console.log(
      `${this.colors.red}✗${this.colors.reset} ${message}`
    );
    if (error) {
      console.log(
        `${this.colors.dim}${error.message}${this.colors.reset}`
      );
    }
  }

  /**
   * Warning message
   */
  static warn(message: string): void {
    console.log(`${this.colors.yellow}⚠${this.colors.reset} ${message}`);
  }

  /**
   * Info message
   */
  static info(message: string): void {
    console.log(`${this.colors.blue}ℹ${this.colors.reset} ${message}`);
  }

  /**
   * Debug message (only in dev)
   */
  static debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      console.log(`${this.colors.cyan}🔍${this.colors.reset} ${message}`);
      if (data) {
        console.log(`${this.colors.dim}`, data, this.colors.reset);
      }
    }
  }
}

export default {
  MockRequestBuilder,
  ResponseAssertions,
  generateTypeFromJson,
  generateAPIRoute,
  generateTestBoilerplate,
  CodeMetrics,
  EnvValidator,
  DevLogger,
};
