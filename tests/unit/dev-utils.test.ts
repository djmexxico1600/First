import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MockRequestBuilder,
  ResponseAssertions,
  generateTypeFromJson,
  generateAPIRoute,
  generateTestBoilerplate,
  CodeMetrics,
  EnvValidator,
  DevLogger,
} from '../../src/lib/dev-utils';

describe('dev-utils', () => {
  describe('MockRequestBuilder', () => {
    it('should build GET request', () => {
      const builder = new MockRequestBuilder('http://localhost:3000/api/test');
      const request = builder.build();

      expect(request.url).toContain('/api/test');
      expect(request.method).toBe('GET');
    });

    it('should build POST request with body', () => {
      const builder = new MockRequestBuilder('http://localhost:3000/api/test');
      const request = builder
        .withMethod('POST')
        .withBody({ name: 'test' })
        .build();

      expect(request.method).toBe('POST');
      expect(request.body).toBeDefined();
    });

    it('should add custom headers', () => {
      const builder = new MockRequestBuilder('http://localhost:3000/api/test');
      const request = builder
        .withHeader('X-Custom', 'value')
        .build();

      expect(request.headers.get('X-Custom')).toBe('value');
    });

    it('should add authorization header', () => {
      const builder = new MockRequestBuilder('http://localhost:3000/api/test');
      const request = builder
        .withAuth('token123')
        .build();

      expect(request.headers.get('Authorization')).toBe('Bearer token123');
    });

    it('should support method chaining', () => {
      const request = new MockRequestBuilder('http://localhost:3000/api/test')
        .withMethod('PUT')
        .withHeader('X-API-Key', 'key123')
        .withBody({ id: 1 })
        .build();

      expect(request.method).toBe('PUT');
      expect(request.headers.get('X-API-Key')).toBe('key123');
    });
  });

  describe('ResponseAssertions', () => {
    let response: Response;

    beforeEach(() => {
      const init: ResponseInit = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600',
        },
      };
      response = new Response(JSON.stringify({ ok: true }), init);
    });

    it('should assert status code', () => {
      const assertions = new ResponseAssertions(response);

      expect(() => assertions.assertStatus(200)).not.toThrow();
      expect(() => assertions.assertStatus(404)).toThrow();
    });

    it('should assert successful response', () => {
      const assertions = new ResponseAssertions(response);

      expect(() => assertions.assertSuccess()).not.toThrow();
    });

    it('should assert header value', () => {
      const assertions = new ResponseAssertions(response);

      expect(() =>
        assertions.assertHeader('Content-Type', 'application/json')
      ).not.toThrow();

      expect(() =>
        assertions.assertHeader('Content-Type', 'text/html')
      ).toThrow();
    });

    it('should support assertion chaining', () => {
      const assertions = new ResponseAssertions(response);

      expect(() => {
        assertions
          .assertStatus(200)
          .assertSuccess()
          .assertHeader('Cache-Control', 'max-age=3600');
      }).not.toThrow();
    });
  });

  describe('generateTypeFromJson', () => {
    it('should generate TypeScript interface', () => {
      const sample = { name: 'John', age: 30 };
      const generated = generateTypeFromJson('User', sample);

      expect(generated).toContain('interface User');
      expect(generated).toContain('name: string');
      expect(generated).toContain('age: number');
    });

    it('should handle various types', () => {
      const sample = {
        name: 'John',
        active: true,
        score: 95.5,
        tags: ['a', 'b'],
      };
      const generated = generateTypeFromJson('Data', sample);

      expect(generated).toContain('string');
      expect(generated).toContain('boolean');
      expect(generated).toContain('number');
    });
  });

  describe('generateAPIRoute', () => {
    it('should generate GET handler', () => {
      const generated = generateAPIRoute('GetBeats', ['GET']);

      expect(generated).toContain('export async function GET');
      expect(generated).toContain('withErrorHandler');
    });

    it('should generate multiple handlers', () => {
      const generated = generateAPIRoute('ManageBeats', ['GET', 'POST', 'DELETE']);

      expect(generated).toContain('export async function GET');
      expect(generated).toContain('export async function POST');
      expect(generated).toContain('export async function DELETE');
    });
  });

  describe('generateTestBoilerplate', () => {
    it('should generate test file structure', () => {
      const generated = generateTestBoilerplate('MyUtil');

      expect(generated).toContain('describe');
      expect(generated).toContain('it');
      expect(generated).toContain('import');
      expect(generated).toContain('beforeEach');
    });
  });

  describe('CodeMetrics', () => {
    it('should count non-comment lines of code', () => {
      const code = `
const x = 1;
// This is a comment
const y = 2;
`;
      const loc = CodeMetrics.countLOC(code);

      expect(loc).toBe(2); // Only const lines
    });

    it('should count TODO comments', () => {
      const code = `
// TODO: Fix this
function test() {
  // FIXME: Implement
  // HACK: Temporary fix
}
`;
      const count = CodeMetrics.countTODOs(code);

      expect(count).toBe(3);
    });

    it('should estimate cyclomatic complexity', () => {
      const simple = 'const x = 1;';
      const complex = `
if (x > 0) {
  if (y > 0) {
    for (let i = 0; i < 10; i++) {
      while (true) { }
    }
  }
}
`;

      expect(CodeMetrics.estimateComplexity(simple)).toBe(1);
      expect(CodeMetrics.estimateComplexity(complex)).toBeGreaterThan(1);
    });
  });

  describe('EnvValidator', () => {
    it('should require environment variable', () => {
      process.env.TEST_VAR = 'value';
      const validator = new EnvValidator();

      expect(validator.require('TEST_VAR')).toBe('value');
    });

    it('should accept default value', () => {
      const validator = new EnvValidator();

      expect(validator.require('MISSING_VAR', 'default')).toBe('default');
    });

    it('should validate email format', () => {
      process.env.EMAIL = 'test@example.com';
      const validator = new EnvValidator();

      expect(validator.requireEmail('EMAIL')).toBe('test@example.com');
    });

    it('should validate URL format', () => {
      process.env.URL = 'https://example.com';
      const validator = new EnvValidator();

      expect(validator.requireUrl('URL')).toBe('https://example.com');
    });

    it('should validate port number', () => {
      process.env.PORT = '3000';
      const validator = new EnvValidator();

      expect(validator.requirePort('PORT')).toBe(3000);
    });

    it('should collect validation errors', () => {
      const validator = new EnvValidator();
      validator.require('MISSING1');
      validator.require('MISSING2');

      const errors = validator.getErrors();
      expect(errors.length).toBe(2);
    });

    it('should throw on validation', () => {
      const validator = new EnvValidator();
      validator.require('MISSING');

      expect(() => validator.validate()).toThrow();
    });
  });

  describe('DevLogger', () => {
    it('should log success message', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      DevLogger.success('Test passed');

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('✓');

      consoleSpy.mockRestore();
    });

    it('should log error message', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const error = new Error('Something went wrong');

      DevLogger.error('Operation failed', error);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('✗');

      consoleSpy.mockRestore();
    });

    it('should log warning message', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      DevLogger.warn('Be careful');

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('⚠');

      consoleSpy.mockRestore();
    });

    it('should log info message', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      DevLogger.info('FYI');

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('ℹ');

      consoleSpy.mockRestore();
    });

    it('should log debug only when DEBUG is set', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const originalDebug = process.env.DEBUG;
      process.env.DEBUG = '1';

      DevLogger.debug('Debug message');

      expect(consoleSpy).toHaveBeenCalled();

      delete process.env.DEBUG;
      consoleSpy.mockClear();

      DevLogger.debug('Should not log');

      expect(consoleSpy).not.toHaveBeenCalled();

      if (originalDebug) process.env.DEBUG = originalDebug;
      consoleSpy.mockRestore();
    });
  });
});
