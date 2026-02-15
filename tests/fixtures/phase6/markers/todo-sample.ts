/**
 * TODO Sample Fixture
 *
 * Fixture for testing loop-closer unclosed TODO detection.
 */

// TODO: Implement error handling
export function processData(data: unknown): void {
  console.log(data);
}

// TODO: Add input validation
export function validateInput(input: string): boolean {
  return input.length > 0;
}

// FIXME: This function has a bug
export function calculateTotal(items: number[]): number {
  // TODO: Handle empty array case
  return items.reduce((a, b) => a + b, 0);
}

/**
 * @todo Add unit tests for this function
 */
export function formatOutput(value: number): string {
  return value.toFixed(2);
}

// NOTE: This is not a TODO, just a note
export function helper(): void {
  // Implementation
}

// XXX: Security concern - fix before release
export function authenticate(token: string): boolean {
  // TODO: Implement proper token validation
  return token.length > 10;
}
