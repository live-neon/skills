/**
 * Large Test File Fixture (400+ lines)
 *
 * For testing mce-refactorer MCE compliance detection.
 * This file intentionally exceeds 200-line MCE limit.
 */

// =============================================================================
// Types (50 lines)
// =============================================================================

interface TestConfig {
  name: string;
  enabled: boolean;
  timeout: number;
  retries: number;
}

interface TestResult {
  passed: boolean;
  duration: number;
  errors: string[];
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  setup?: () => void;
  teardown?: () => void;
}

interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
  timeout?: number;
  skip?: boolean;
}

// =============================================================================
// Test Runner (100 lines)
// =============================================================================

export class TestRunner {
  private suites: TestSuite[] = [];
  private config: TestConfig;

  constructor(config: Partial<TestConfig> = {}) {
    this.config = {
      name: config.name || 'default',
      enabled: config.enabled ?? true,
      timeout: config.timeout || 5000,
      retries: config.retries || 0,
    };
  }

  addSuite(suite: TestSuite): void {
    this.suites.push(suite);
  }

  async runAll(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const suite of this.suites) {
      if (suite.setup) suite.setup();

      for (const test of suite.tests) {
        if (test.skip) continue;

        const start = Date.now();
        const errors: string[] = [];

        try {
          await Promise.race([
            test.fn(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), test.timeout || this.config.timeout)
            ),
          ]);
        } catch (error) {
          errors.push(String(error));
        }

        results.push({
          passed: errors.length === 0,
          duration: Date.now() - start,
          errors,
        });
      }

      if (suite.teardown) suite.teardown();
    }

    return results;
  }

  getSuiteCount(): number {
    return this.suites.length;
  }

  getTestCount(): number {
    return this.suites.reduce((sum, suite) => sum + suite.tests.length, 0);
  }
}

// =============================================================================
// Assertions (80 lines)
// =============================================================================

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

export function assertNotEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual === expected) {
    throw new Error(message || `Expected values to differ, both are ${actual}`);
  }
}

export function assertTrue(value: boolean, message?: string): void {
  if (!value) {
    throw new Error(message || 'Expected true, got false');
  }
}

export function assertFalse(value: boolean, message?: string): void {
  if (value) {
    throw new Error(message || 'Expected false, got true');
  }
}

export function assertDefined<T>(value: T | undefined | null, message?: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message || 'Expected defined value, got undefined/null');
  }
}

export function assertThrows(fn: () => void, message?: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error(message || 'Expected function to throw');
  }
}

export async function assertRejects(fn: () => Promise<void>, message?: string): Promise<void> {
  let rejected = false;
  try {
    await fn();
  } catch {
    rejected = true;
  }
  if (!rejected) {
    throw new Error(message || 'Expected promise to reject');
  }
}

export function assertArrayEqual<T>(actual: T[], expected: T[], message?: string): void {
  if (actual.length !== expected.length) {
    throw new Error(message || `Array lengths differ: ${actual.length} vs ${expected.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(message || `Arrays differ at index ${i}`);
    }
  }
}

// =============================================================================
// Mock Utilities (80 lines)
// =============================================================================

export function createMock<T extends object>(template: Partial<T> = {}): T {
  return new Proxy(template as T, {
    get(target, prop) {
      if (prop in target) {
        return (target as Record<string | symbol, unknown>)[prop];
      }
      return () => undefined;
    },
  });
}

export function createSpy(): { calls: unknown[][]; fn: (...args: unknown[]) => void } {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
  };
  return { calls, fn };
}

export function createStub<T>(returnValue: T): () => T {
  return () => returnValue;
}

export function createAsyncStub<T>(returnValue: T, delay = 0): () => Promise<T> {
  return () => new Promise((resolve) => setTimeout(() => resolve(returnValue), delay));
}

export class MockTimer {
  private time = 0;

  advance(ms: number): void {
    this.time += ms;
  }

  now(): number {
    return this.time;
  }

  reset(): void {
    this.time = 0;
  }
}

// =============================================================================
// Test Helpers (80 lines)
// =============================================================================

export function describe(name: string, fn: () => void): void {
  console.log(`Suite: ${name}`);
  fn();
}

export function it(name: string, fn: () => void | Promise<void>): void {
  console.log(`  Test: ${name}`);
}

export function beforeEach(fn: () => void): void {
  // Setup hook
}

export function afterEach(fn: () => void): void {
  // Teardown hook
}

export function skip(name: string, fn: () => void | Promise<void>): void {
  console.log(`  SKIP: ${name}`);
}

export function only(name: string, fn: () => void | Promise<void>): void {
  console.log(`  ONLY: ${name}`);
}

export function timeout(ms: number): (fn: () => Promise<void>) => () => Promise<void> {
  return (fn) => async () => {
    await Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
    ]);
  };
}

export function retry(count: number): (fn: () => Promise<void>) => () => Promise<void> {
  return (fn) => async () => {
    for (let i = 0; i < count; i++) {
      try {
        await fn();
        return;
      } catch (error) {
        if (i === count - 1) throw error;
      }
    }
  };
}

// =============================================================================
// Fixture Data (50 lines)
// =============================================================================

export const sampleUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Carol', email: 'carol@example.com' },
];

export const samplePosts = [
  { id: 1, title: 'First Post', authorId: 1 },
  { id: 2, title: 'Second Post', authorId: 2 },
  { id: 3, title: 'Third Post', authorId: 1 },
];

export const sampleComments = [
  { id: 1, postId: 1, authorId: 2, content: 'Great post!' },
  { id: 2, postId: 1, authorId: 3, content: 'Thanks for sharing.' },
  { id: 3, postId: 2, authorId: 1, content: 'Interesting perspective.' },
];

export function generateUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));
}

export function generatePosts(count: number, authorId: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Post ${i + 1}`,
    authorId,
  }));
}

// =============================================================================
// Additional Padding to Exceed 400 Lines
// =============================================================================

export const constants = {
  MAX_RETRIES: 3,
  DEFAULT_TIMEOUT: 5000,
  MIN_DELAY: 100,
  MAX_DELAY: 10000,
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  log(level: LogLevel, message: string): void;
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export function createLogger(prefix: string): Logger {
  return {
    log(level: LogLevel, message: string) {
      console.log(`[${prefix}] [${level.toUpperCase()}] ${message}`);
    },
    debug(message: string) {
      this.log('debug', message);
    },
    info(message: string) {
      this.log('info', message);
    },
    warn(message: string) {
      this.log('warn', message);
    },
    error(message: string) {
      this.log('error', message);
    },
  };
}
