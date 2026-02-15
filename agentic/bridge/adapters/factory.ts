/**
 * Adapter Factory for Bridge Layer
 *
 * Provides dependency injection for bridge adapters based on environment.
 * Skills call getAdapter() to get the appropriate implementation.
 *
 * Environment variable BRIDGE_ADAPTER_MODE controls adapter selection:
 * - 'mock' (default): Use mock adapters for testing
 * - 'real': Use real adapters (when ClawHub exists)
 */

import { MockSelfImprovingAgent } from './mock-self-improving-agent';
import { MockProactiveAgent } from './mock-proactive-agent';
import { MockVFMSystem } from './mock-vfm-system';

export type AdapterType = 'self-improving-agent' | 'proactive-agent' | 'vfm-system';
export type AdapterMode = 'mock' | 'real';

// Singleton instances for mock adapters
let mockSelfImprovingAgent: MockSelfImprovingAgent | null = null;
let mockProactiveAgent: MockProactiveAgent | null = null;
let mockVFMSystem: MockVFMSystem | null = null;

/**
 * Get the current adapter mode from environment.
 */
export function getAdapterMode(): AdapterMode {
  const mode = process.env.BRIDGE_ADAPTER_MODE || 'mock';
  if (mode !== 'mock' && mode !== 'real') {
    console.warn(
      `[AdapterFactory] Unknown BRIDGE_ADAPTER_MODE: ${mode}, defaulting to 'mock'`
    );
    return 'mock';
  }
  return mode;
}

/**
 * Get adapter instance for the specified type.
 *
 * @param type - The adapter type to retrieve
 * @returns The adapter instance (mock or real based on environment)
 * @throws Error if real adapters are requested but not implemented
 */
export function getAdapter(type: 'self-improving-agent'): MockSelfImprovingAgent;
export function getAdapter(type: 'proactive-agent'): MockProactiveAgent;
export function getAdapter(type: 'vfm-system'): MockVFMSystem;
export function getAdapter(
  type: AdapterType
): MockSelfImprovingAgent | MockProactiveAgent | MockVFMSystem {
  const mode = getAdapterMode();

  if (mode === 'real') {
    throw new Error(
      `[AdapterFactory] Real adapters not yet implemented for '${type}'. ` +
        `ClawHub integration pending. Use BRIDGE_ADAPTER_MODE=mock for testing.`
    );
  }

  // Return mock adapters (singleton pattern)
  switch (type) {
    case 'self-improving-agent':
      if (!mockSelfImprovingAgent) {
        mockSelfImprovingAgent = new MockSelfImprovingAgent();
      }
      return mockSelfImprovingAgent;

    case 'proactive-agent':
      if (!mockProactiveAgent) {
        mockProactiveAgent = new MockProactiveAgent();
      }
      return mockProactiveAgent;

    case 'vfm-system':
      if (!mockVFMSystem) {
        mockVFMSystem = new MockVFMSystem();
      }
      return mockVFMSystem;

    default:
      throw new Error(`[AdapterFactory] Unknown adapter type: ${type}`);
  }
}

/**
 * Reset all adapter instances (for testing).
 */
export function resetAdapters(): void {
  mockSelfImprovingAgent = null;
  mockProactiveAgent = null;
  mockVFMSystem = null;
}

/**
 * Check if real adapters are available.
 * Currently always returns false until ClawHub is implemented.
 */
export function isRealAdapterAvailable(type: AdapterType): boolean {
  // TODO: Implement real adapter availability checks when ClawHub exists
  return false;
}
