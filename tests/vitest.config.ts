/**
 * Vitest Configuration
 *
 * Excludes archived tests from pre-consolidation structure.
 * Created 2026-02-15 as part of agentic skills consolidation.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude archived tests and node_modules
    exclude: ['**/node_modules/**', '**/_archive/**'],
    // Include only active test directories
    include: ['e2e/**/*.test.ts'],
    // Test environment
    environment: 'node',
  },
});
