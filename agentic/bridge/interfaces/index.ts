/**
 * Bridge Layer Interface Definitions
 *
 * Export all interfaces for integration with external systems:
 * - self-improving-agent: Learnings export
 * - proactive-agent: WAL parsing and health alerts
 * - vfm-system: Constraint value scoring
 */

export * from './self-improving-agent';
export * from './proactive-agent';
export * from './vfm-system';
