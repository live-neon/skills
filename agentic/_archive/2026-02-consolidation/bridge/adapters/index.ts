/**
 * Bridge Layer Adapters
 *
 * Export adapter factory and mock implementations.
 */

export { getAdapter, getAdapterMode, resetAdapters, isRealAdapterAvailable } from './factory';
export type { AdapterType, AdapterMode } from './factory';

export { MockSelfImprovingAgent } from './mock-self-improving-agent';
export { MockProactiveAgent } from './mock-proactive-agent';
export { MockVFMSystem } from './mock-vfm-system';
